param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('install', 'ensure-permission')]
    [string]
    $command,

    [string]
    $downloadFrom,

    ## Not doing anything with this parameter yet
    [string]
    $sessionId,

    [string]
    $serviceName = "Microsoft IIS Administration",

    [string]
    $iisAdminOwners = "IIS Administration API Owners",

    [int]
    $adminAPIPort = 55539
)

$ErrorActionPreference = "Stop"

######################## Param checks ###############################
$install = $command -eq 'install'

if ($install -and $(!$downloadFrom)) {
    throw "Missing download location for install command"
}

######################## Utilities ###############################
function WaitForServerToStart($service) {
    $waitPeriod = 1
    $remainingTime = 600

    while (!(Get-Service $service -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq "Running"})) {
        Start-Sleep -Seconds $waitPeriod
        $remainingTime -= $waitPeriod
        if ($remainingTime -lt 0) {
            throw "timeout waiting for service to start"
        }
    }
}

function InstallAPI($service) {
    $installer = Join-Path $env:TEMP iis-administration-setup.exe
    Invoke-WebRequest $downloadFrom -OutFile $installer
    & $installer /s
    WaitForServerToStart $service
}

function EnsureGroup($group) {
    if (!(Get-LocalGroup -Name $group -ErrorAction SilentlyContinue)) {
        New-LocalGroup -Name $group | Out-Null
    }
}

function EnsureMember($group, $userOrGroup) {
    $modify = !(Get-LocalGroupMember -Group $group -Member $userOrGroup -ErrorAction SilentlyContinue)
    if ($modify) {
        Add-LocalGroupMember -Group $group -Member $userOrGroup | Out-Null
    }
    return $modify
}

####################### Main script ################################

## TODO: Consider creating a lock around this script because it is not concurrency safe

if ($install) {
    InstallAPI $serviceName
} else {
    try {
        Invoke-WebRequest -UseDefaultCredentials -UseBasicParsing "https://localhost:$adminAPIPort" | Out-Null
    } catch {
        if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ConnectFailure) {
            $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
            if (!$service) {
                throw "IIS Administration API is not installed"
            }
            if ($service.Status -eq [System.ServiceProcess.ServiceControllerStatus]::Running) {
                throw "IIS Administration API is not found, port pinged: $adminAPIPort"
            }
            throw "Unexpected service status for IIS Administration API: ""$($service.Status)"""
        }
        throw $_
    }
}

$service = Get-WmiObject win32_service | Where-Object {$_.name -eq $serviceName}
if ($service.StartInfo.EnvironmentVariables -and $service.StartInfo.EnvironmentVariables["USE_CURRENT_DIRECTORY_AS_ROOT"] -and $service.StartInfo.WorkingDirectory) {
    $workingDirectory = $service.StartInfo.WorkingDirectory
} else {
    $proc = Get-Process -id $service.ProcessId
    $workingDirectory = Split-Path ($proc.Modules | Where-Object { $_.ModuleName -eq "Microsoft.IIS.Administration.dll" }).FileName
}

$configLocation = [System.IO.Path]::Combine($workingDirectory, "config", "appsettings.json")
$config = Get-Content -Raw -Path $configLocation | ConvertFrom-Json

$user = $(whoami)

## Install process adds $user in the config file. We don't want that, we want $iisAdminOwners in there instead
if ($install) {
    $config.security.users.owners = @()
    $config.security.users.administrators = @()
}

if (!$config.security.users.owners.Contains($user)) {
    EnsureGroup $iisAdminOwners
    if (EnsureMember $iisAdminOwners $user) {
        # WIP:
        # We are supposed to force a group policy update here but this command does not work as expected because of how WinRM works
        # GPUpdate /Force | Out-Null
    }
    if (!$config.security.users.owners.Contains($iisAdminOwners)) {
        $config.security.users.owners += $iisAdminOwners
        $saveConfig = $true
    }
    if (!$config.security.users.administrators.Contains($iisAdminOwners)) {
        $config.security.users.administrators += $iisAdminOwners
        $saveConfig = $true
    }

    if ($saveConfig) {
        if (!(Get-LocalGroupMember -Group "Administrators" -Member $user -ErrorAction SilentlyContinue)) {
            throw "Administrator privilege is needed to initiate IIS Administration API"
        }
        $apiHome = [System.IO.Path]::Combine($workingDirectory, "..")
        ## Installer added a read-only rule on current user to the directory, delete it
        $dirAcl = Get-Acl $apiHome
        foreach ($access in $dirAcl.Access | Where-Object { $_.IdentityReference.Value -eq $user }) {
            $dirAcl.RemoveAccessRule($access) | Out-Null
            $updateAcl = $true
        }
        if ($updateAcl) {
            Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
        }
        $rights = [System.Security.AccessControl.FileSystemRights]::Traverse `
            -bOr [System.Security.AccessControl.FileSystemRights]::Modify `
            -bOr [System.Security.AccessControl.FileSystemRights]::ChangePermissions
        $dirAccessGranted = $dirAcl.Access | Where-Object {(($_.IdentityReference.Value -eq "BUILTIN\Administrators") -and (($_.FileSystemRights -bAnd $rights) -eq $rights))}
        if (!$dirAccessGranted) {
            $inheritFlags = [System.Security.AccessControl.InheritanceFlags]::ContainerInherit `
                -bOr [System.Security.AccessControl.InheritanceFlags]::ObjectInherit
            $propFlags = [System.Security.AccessControl.PropagationFlags]::InheritOnly
            $ar = New-Object System.Security.AccessControl.FileSystemAccessRule("BUILTIN\Administrators", $rights, $inheritFlags, $propFlags, "allow")
            $dirAcl.SetAccessRule($ar) | Out-Null
            Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
        }
        $config | ConvertTo-Json -depth 100 | Out-File $configLocation
        Restart-Service -Name $serviceName | Out-Null
        WaitForServerToStart $serviceName
    }
}

'{ "result" : "success" }'
