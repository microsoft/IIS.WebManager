[CmdletBinding()]
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
            throw "Timeout waiting for service to start"
        }
    }
    Write-Verbose "Server started, time remaining ${remainingTime}..."
}

$adminAPIInstalled = $false
function InstallAPI($service) {
    $installer = Join-Path $env:TEMP iis-administration-setup.exe
    Invoke-WebRequest $downloadFrom -OutFile $installer
    Write-Verbose "Downloaded $downloadFrom to $installer"
    & $installer /s
    Write-Verbose "Install complete"
    WaitForServerToStart $service
    $adminAPIInstalled = $true
}

function EnsureGroup($group) {
    if (!(Get-LocalGroup -Name $group -ErrorAction SilentlyContinue)) {
        New-LocalGroup -Name $group | Out-Null
        Write-Verbose "Group $group added"
    }
}

function EnsureMember($group, $userOrGroup) {
    $modify = !(Get-LocalGroupMember -Group $group -Member $userOrGroup -ErrorAction SilentlyContinue)
    if ($modify) {
        Add-LocalGroupMember -Group $group -Member $userOrGroup | Out-Null
        Write-Verbose "Member $userOrGroup added"
    }
    return $modify
}

function GetIISAdminHome($procs) {
    foreach ($proc in $procs) {
        $iisMainModule = $proc.Modules | Where-Object { $_.ModuleName -eq "Microsoft.IIS.Administration.dll" }
        if ($iisMainModule) {
            Write-Verbose "IIS Admin module found at $($iisMainModule.FileName)"
            return Split-Path $iisMainModule.FileName
        }
    }
}

####################### Main script ################################

## TODO: Consider creating a lock around this script because it is not concurrency safe

if ($install) {
    InstallAPI $serviceName
} else {
    try {
        $pingEndpoint = "https://localhost:$adminAPIPort"
        Write-Verbose "Pinging Admin API at $pingEndpoint"
        Invoke-WebRequest -UseDefaultCredentials -UseBasicParsing $pingEndpoint | Out-Null
    } catch {
        if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ConnectFailure) {
            $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
            if (!$service) {
                throw "IIS Administration API is not installed"
            }
            if ($service.Status -eq [System.ServiceProcess.ServiceControllerStatus]::Running) {
                throw "IIS Administration API is not found at: $pingEndpoint"
            }
            throw "Unexpected service status for IIS Administration API: ""$($service.Status)"""
        }
        throw $_
    }
}

$service = Get-WmiObject win32_service | Where-Object {$_.name -eq $serviceName}
if ($service) {
    if ($service.StartInfo.EnvironmentVariables -and $service.StartInfo.EnvironmentVariables["USE_CURRENT_DIRECTORY_AS_ROOT"] -and $service.StartInfo.WorkingDirectory) {
        $workingDirectory = $service.StartInfo.WorkingDirectory
    } else {
        $proc = Get-Process -id $service.ProcessId
        $workingDirectory = GetIISAdminHome $proc
    }
} else {
    ## dev-mode support, no restart can be perfomed
    Write-Verbose "Dev mode, scanning processes for IIS Admin API"
    $devMode = $true
    $workingDirectory = GetIISAdminHome (Get-Process -ProcessName dotnet)
}

$configLocation = [System.IO.Path]::Combine($workingDirectory, "config", "appsettings.json")
if ($devMode -and !(Test-Path $configLocation)) {
    $configLocation = [System.IO.Path]::Combine($workingDirectory, "..", "..", "..", "config", "appsettings.json")
}
Write-Verbose "Config Location $configLocation"
$config = Get-Content -Raw -Path $configLocation | ConvertFrom-Json
$user = $(whoami)

$groupModified = $false

## Install process adds $user in the config file. We don't want that, we want $iisAdminOwners in there instead
if ($install) {
    $config.security.users.owners = @()
    $config.security.users.administrators = @()
}

if (!$config.security.users.owners.Contains($user)) {
    EnsureGroup $iisAdminOwners
    $groupModified = EnsureMember $iisAdminOwners $user

    if (!$config.security.users.owners.Contains($iisAdminOwners)) {
        $config.security.users.owners += $iisAdminOwners
        $saveConfig = $true
    }
    if (!$config.security.users.administrators.Contains($iisAdminOwners)) {
        $config.security.users.administrators += $iisAdminOwners
        $saveConfig = $true
    }

    if ($saveConfig) {
        Write-Verbose "Saving config..."
        if ($devMode) {
            throw "Cannot edit config file in dev mode, please add $user to ""$iisAdminOwners"" group manually"
        }
        if (!(Get-LocalGroupMember -Group "Administrators" -Member $user -ErrorAction SilentlyContinue)) {
            throw "User $user lacks administrator privilege which is needed to initiate IIS Administration API"
        }
        $apiHome = [System.IO.Path]::Combine($workingDirectory, "..")
        ## Installer added a read-only rule on current user to the directory, delete it
        $dirAcl = Get-Acl $apiHome
        foreach ($access in $dirAcl.Access | Where-Object { $_.IdentityReference.Value -eq $user }) {
            $dirAcl.RemoveAccessRule($access) | Out-Null
            $updateAcl = $true
        }
        if ($updateAcl) {
            Write-Verbose "Updating Acl to remove readonly access..."
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
            Write-Verbose "Setting Acl to enable administrators' write access"
            Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
        }
        Write-Verbose "Saving new configuration"
        $config | ConvertTo-Json -depth 100 | Out-File $configLocation
        Write-Verbose "Restarting service"
        Restart-Service -Name $serviceName | Out-Null
        WaitForServerToStart $serviceName
    }
}

ConvertTo-Json @{
    "adminAPIInstalled" = $adminAPIInstalled;
    "groupModified" = $groupModified
} -Compress -Depth 100
