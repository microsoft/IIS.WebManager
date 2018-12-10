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
    $iisAdminOwners = "IISAdminAPIOwners"
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

function InstallAPI {
    $installer = Join-Path $env:TEMP iis-administration-setup.exe
    Invoke-WebRequest $downloadFrom -OutFile $installer
    & $installer /s
    WaitForServerToStart $serviceName
}

function EnsureGroup($group) {
    if (!(Get-LocalGroup -Name $group -ErrorAction SilentlyContinue)) {
        New-LocalGroup -Name $group | Out-Null
    }
}

function EnsureMember($group, $userOrGroup) {
    if (!(Get-LocalGroupMember -Group $group -Member $userOrGroup -ErrorAction SilentlyContinue)) {
        Add-LocalGroupMember -Group $group -Member $userOrGroup | Out-Null
    }
}

####################### Main script ################################

## TODO: Consider creating a lock around this script because it is not concurrency safe

if ($install) {
    InstallAPI
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
if (!$config.security.users.owners.Contains($user)) {

    EnsureGroup $iisAdminOwners
    EnsureMember $iisAdminOwners $user

    if (!$config.security.users.owners.Contains($iisAdminOwners)) {
        if (!(Get-LocalGroupMember -Group "Administrators" -Member $user -ErrorAction SilentlyContinue)) {
            throw "Administrator privilege is needed to initiate IIS Administration API"
        }
        $apiHome = [System.IO.Path]::Combine($workingDirectory, "..")
        ## Installer added a read-only rule on current user to the directory, delete it
        $dirAcl = Get-Acl $apiHome
        foreach ($access in $dirAcl.Access | Where-Object { $_.IdentityReference.Value -eq $user }) {
            $dirAcl.RemoveAccessRule($access) | Out-Null
        }
        Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
        $rights = [System.Security.AccessControl.FileSystemRights]::Traverse `
            -bOr [System.Security.AccessControl.FileSystemRights]::Modify `
            -bOr [System.Security.AccessControl.FileSystemRights]::ChangePermissions
        $dirAccessGranted = $dirAcl.Access | Where-Object {(($_.IdentityReference.Value -eq "${env:ComputerName}\${iisAdminOwners}") -and (($_.FileSystemRights -bAnd $rights) -eq $rights))}
        if (!$dirAccessGranted) {
            $inheritFlags = [System.Security.AccessControl.InheritanceFlags]::ContainerInherit `
                -bOr [System.Security.AccessControl.InheritanceFlags]::ObjectInherit
            $propFlags = [System.Security.AccessControl.PropagationFlags]::InheritOnly
            $ar = New-Object System.Security.AccessControl.FileSystemAccessRule("BUILTIN\Administrators", $rights, $inheritFlags, $propFlags, "allow")
            $dirAcl.SetAccessRule($ar) | Out-Null
            Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
        }
        $config.security.users.owners += $iisAdminOwners
        $config | ConvertTo-Json -depth 100 | Out-File $configLocation
        Restart-Service -Name $serviceName | Out-Null
        WaitForServerToStart $serviceName
    }
}

'{ "result" : "success" }'
