#Requires -Version 4.0
#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('install', 'ensure-permission')]
    [string]
    $command,

    [string]
    $adminAPILocation,

    [string]
    $dotnetCoreLocation,

    ## Not doing anything with this parameter yet
    [string]
    $sessionId,

    [string]
    $serviceName = "Microsoft IIS Administration",

    [string]
    $appName = "Microsoft IIS Administration",

    [string]
    $iisAdminOwners = "IIS Administration API Owners",

    [int]
    $adminAPIPort = 55539
)

$ErrorActionPreference = "Stop"

$script:adminAPIInstalled = $false
$script:groupModified = $false
$script:lockOwned = $false
$script:errorsReported = $null

######################## Param checks ###############################
$install = $command -eq 'install'

function VerifySource([string] $source) {
    if (Test-Path -IsValid $source) {
        return "file"
    }
    if ([Uri]::TryCreate($source, [UriKind]::Absolute, [ref]$null)) {
        return "uri"
    }
    throw "Invalid install source $source"
}

$dotnetCoreInstallType = $null
$iisAdminInstallType = $null
if ($install) {
    if ($dotnetCoreLocation) {
        $dotnetCoreInstallType = VerifySource $dotnetCoreLocation
    }

    if (!$adminAPILocation) {
        throw "Missing admin API installer location for install command"
    }

    $iisAdminInstallType = VerifySource $adminAPILocation
}

######################## Utilities ###############################
$verbose = $PSBoundParameters['verbose']

if ($verbose) {
    $logDir = Join-Path $env:UserProfile 'wac-iis-logs'
    if (!(Test-Path $logDir)) {
        mkdir $logDir
    }
    $logFile = Join-Path $logDir 'admin-api-util.log'
}

function LogVerbose([string] $msg) {
    $msg = "[$(Get-Date -Format HH:mm:ss.fffffff)] $msg"
    if ($verbose) {
        Write-Verbose $msg
        Add-Content -Value $msg -Path $logFile -Force | Out-Null
    }
}

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
    LogVerbose "Server started, time remaining ${remainingTime}..."
}

function InstallComponents {
    if ($dotnetCoreLocation) {
        Install "dotnet-core-runtime" $dotnetCoreInstallType $dotnetCoreLocation
    }
    Install "iis-administration-api" $iisAdminInstallType $adminAPILocation
    WaitForServerToStart $serviceName
    $script:adminAPIInstalled = $true
}

function IsIISAdminInstalled {
    return Get-WMIObject -Class Win32_Product | Where-Object { $_.Name -eq $appName }
}

function Install([string] $scenario, [string] $installType, [string] $location) {
    $installer = Join-Path $env:TEMP "${scenario}.exe"
    LogVerbose "source: $location will be copied to $installer"
    if ($installType -eq "file") {
        Copy-Item -Path $location -Destination $installer -Force
    } elseif ($installType -eq "uri") {
        Download $location $installer
    } else {
        throw "Invalid install type $installType"
    }
    LogVerbose "Running $installer"
    & $installer /s
    LogVerbose "Successfully installed $scenario"
}

function Download([string] $uri, [string] $location) {
    Invoke-WebRequest $uri -OutFile $location
    LogVerbose "Downloaded $uri to $location"
}

function EnsureGroup($group) {
    if (!(Get-LocalGroup -Name $group -ErrorAction SilentlyContinue)) {
        New-LocalGroup -Name $group | Out-Null
        LogVerbose "Group $group added"
    }
}

function EnsureMember($group, $userOrGroup) {
    ## NOTE: Get-LocalGroupMember works case-sensitevly. So, as a workaround, Where-Object is used here
    $modify = !(Get-LocalGroupMember -Group $group -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq $userOrGroup })
    if ($modify) {
        Add-LocalGroupMember -Group $group -Member $userOrGroup | Out-Null
        LogVerbose "Member $userOrGroup added"
    }
    return $modify
}

function GetIISAdminHome($procs) {
    foreach ($proc in $procs) {
        $iisMainModule = $proc.Modules | Where-Object { $_.ModuleName -eq "Microsoft.IIS.Administration.dll" }
        if ($iisMainModule) {
            LogVerbose "IIS Admin module found at $($iisMainModule.FileName)"
            return Split-Path $iisMainModule.FileName
        }
    }
}

<#
.SYNOPSIS
This method load the config file in the specified location and determine if changes need to be made in the config file
### It returns null if no changes need to be made and return the modified config object if it needs to be saved
### The reason this method is exists is because we IIS Administration API installer's settings are not robust enough for WAC
### secnario.
#>
function LoadAndEnsureConfig($configLocation, $user) {
    LogVerbose "Config Location $configLocation"
    $config = Get-Content -Raw -Path $configLocation | ConvertFrom-Json
    $saveConfig = $false

    if ($script:adminAPIInstalled) {
        ## Remove cors rules if we installed the admin api
        $config.cors.rules = @()
        ## Install process adds $user in the config file. We don't want that, we want $iisAdminOwners in there instead
        $config.security.users.owners = @()
        $config.security.users.administrators = @()
        $saveConfig = $true
    }

    if (!$config.security.users.owners.Contains($user)) {
        EnsureGroup $iisAdminOwners | Out-Null
        $script:groupModified = EnsureMember $iisAdminOwners $user
        if (!$config.security.users.owners.Contains($iisAdminOwners)) {
            $config.security.users.owners += $iisAdminOwners
            $saveConfig = $true
        }
        if (!$config.security.users.administrators.Contains($iisAdminOwners)) {
            $config.security.users.administrators += $iisAdminOwners
            $saveConfig = $true
        }
    }

    if ($saveConfig) {
        return $config
    } else {
        return $null
    }
}

$lockLocation = "HKLM:\SOFTWARE\Microsoft\IIS-WAC"
$lockName = "installerLock"
$spinLockWait = 0.5
function ObtainLock() {
	if (!(Test-Path $lockLocation)) {
		New-Item -Path $lockLocation -Force | Out-Null
	}

    while (!($script:lockOwned)) {
        try {
            New-ItemProperty -Path $lockLocation -Name $lockName -Value 1 -PropertyType DWORD | Out-Null
            $script:lockOwned = $true
        } catch {
            LogVerbose "Waiting $spinLockWait seconds to obtain lock"
            Start-Sleep $spinLockWait
        }
    }
    LogVerbose "Lock obtained"
}

function ReleaseLock() {
    if ($script:lockOwned) {
        LogVerbose "Releasing lock"
        try {
            Remove-ItemProperty -Path $lockLocation -Name $lockName | Out-Null
        } catch {
            LogVerbose "Error releasing lock $_"
            $script:errorsReported = $_
        } finally {
            $script:lockOwned = $lockOwned
            LogVerbose "Lock released"
        }
    } else {
        LogVerbose "No lock was released"
    }
}


## Workaround a very odd issue: only reproduced when the IIS Admin API Owner group is newly created
## Looks like the policy are not immediately updated
function ConfirmPolicyUpdate($apiHost) {
    LogVerbose "Confirming service policy is updated"
    $CreateEndpoint = "api-keys"
    $success = $false
    $policyWaitTime = 600
    $policyWaitPeriod = 1
    while (!$success) {
        try {
            Invoke-WebRequest "$apiHost/security/$CreateEndpoint" -UseBasicParsing -UseDefaultCredentials -ContentType "application/json" | Out-Null
            $success = $true
        } catch {
            if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Unauthorized) {
                LogVerbose "Policy is not updated, wait $policyWaitPeriod seconds, remaing time $policyWaitTime"
                Start-Sleep $policyWaitPeriod
                $policyWaitTime -= $policyWaitPeriod
                if ($policyWaitTime -lt 0) {
                    throw "Timeout waiting for service police to update"
                }
            } else {
                throw "Unexpected error while confirming policy update: $_"
            }
        }
    }
    LogVerbose "Policy is confirmed to be updated"
}

####################### Main script ################################

LogVerbose "Started admin_api_util, command $command..."
$apiHost = "https://localhost:$adminAPIPort"
$pingEndpoint = $apiHost
try {
    if ($install) {
        if (!(IsIISAdminInstalled)) {
            ObtainLock
            if (!(IsIISAdminInstalled)) {
                InstallComponents
            }
        }
    } else {
        try {
            LogVerbose "Pinging Admin API at $pingEndpoint"
            Invoke-WebRequest -UseDefaultCredentials -UseBasicParsing $pingEndpoint | Out-Null
        } catch {
            if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ConnectFailure) {
                $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if (!$service) {
                    throw "Microsoft IIS Administration API is not installed"
                }
                if ($service.Status -eq [System.ServiceProcess.ServiceControllerStatus]::Running) {
                    throw "Microsoft IIS Administration API is not found at: $pingEndpoint"
                }
                throw "Unexpected service status for Microsoft IIS Administration API: ""$($service.Status)"""
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
        LogVerbose "Dev mode, scanning processes for IIS Admin API"
        $devMode = $true
        $workingDirectory = GetIISAdminHome (Get-Process -ProcessName dotnet)
    }

    $configLocation = [System.IO.Path]::Combine($workingDirectory, "config", "appsettings.json")
    if ($devMode -and !(Test-Path $configLocation)) {
        $configLocation = [System.IO.Path]::Combine($workingDirectory, "..", "..", "..", "config", "appsettings.json")
    }

    $user = $(whoami)
    $config = LoadAndEnsureConfig $configLocation $user
    if ($config) {
        ObtainLock
        $config = LoadAndEnsureConfig $configLocation $user
        if ($config) {
            LogVerbose "Saving config..."
            if ($devMode) {
                throw "Cannot edit config file in dev mode, please add $user to ""$iisAdminOwners"" group manually"
            }
            $apiHome = [System.IO.Path]::Combine($workingDirectory, "..")
            ## Installer added a read-only rule on current user to the directory, delete it
            $dirAcl = Get-Acl $apiHome
            $modifyAcess = [System.Security.AccessControl.FileSystemRights]::Modify
            $allow = [System.Security.AccessControl.AccessControlType]::Allow
            $dirAccessGranted = $dirAcl.Access | Where-Object { ($_.IdentityReference.Value -eq $user) -and ($_.AccessControlType -eq $allow) -and (($_.FileSystemRights -bAnd $modifyAcess) -eq $modifyAcess) }
            $private:tempAccessRule = $null
            $private:originalAccessRule = $null
            try {
                if (!$dirAccessGranted) {
                    ## we need to grant modify access to directory to change the configuration file
                    $inheritFlags = [System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bOr [System.Security.AccessControl.InheritanceFlags]::ObjectInherit
                    $propagationFlags = [System.Security.AccessControl.PropagationFlags]::InheritOnly
                    $private:minialAccess = [System.Security.AccessControl.FileSystemRights]::ReadAndExecute -bOr [System.Security.AccessControl.FileSystemRights]::Synchronize
                    ## We are about to change access rule for "BUILTIN\Administrators", save original permission so we can roll back if necessary in the finally block
                    $private:originalAccessRule = $dirAcl.Access | Where-Object { $_.IdentityReference.Value -eq $user -and ($_.AccessControlType -eq $allow) }
                    if ($private:originalAccessRule) {
                        $inheritFlags = $private:originalAccessRule.InheritanceFlags
                        $propagationFlags = $private:originalAccessRule.propagationFlags
                        $private:minialAccess = $private:originalAccessRule.FileSystemRights
                    }
                    $private:tempAccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule -ArgumentList $user, ($private:minialAccess -bOr $modifyAcess), $inheritFlags, $propagationFlags, $allow
                    $dirAcl.SetAccessRule($private:tempAccessRule) | Out-Null
                    LogVerbose "Setting Acl to enable administrators' write access"
                    Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
                }
                LogVerbose "Saving new configuration"
                $config | ConvertTo-Json -depth 100 | Out-File $configLocation
            } finally {
                $update = $false
                LogVerbose "Cleaning up"
                if ($script:adminAPIInstalled) {
                    ## Remove any user specific acl the installer or the script had added
                    foreach ($access in $dirAcl.Access | Where-Object { $_.IdentityReference.Value -eq $user }) {
                        LogVerbose "Removing access rules for $user"
                        $dirAcl.RemoveAccessRule($access) | Out-Null
                        $update = $true
                    }
                } else {
                    ## If we didn't install the admin api, we will simply restore any access that the user already have on the file
                    if ($private:tempAccessRule) {
                        LogVerbose "Removing temp access rules"
                        $dirAcl.RemoveAccessRule($private:tempAccessRule) | Out-Null
                        $update = $true
                    }
                    if ($private:originalAccessRule) {
                        LogVerbose "Restoring original access rules"
                        $dirAcl.SetAccessRule($private:originalAccessRule) | Out-Null
                        $update = $true
                    }
                }
                if ($update) {
                    LogVerbose "Revoking write access rules"
                    Set-Acl -Path $apiHome -AclObject $dirAcl | Out-Null
                }
            }
            LogVerbose "Restarting service"
            Restart-Service -Name $serviceName | Out-Null
            WaitForServerToStart $serviceName
            ConfirmPolicyUpdate $apiHost
        } else {
            LogVerbose "Config file is determined to be valid upon second check, no changes will be made"
        }
    }
} finally {
    ReleaseLock
}

ConvertTo-Json @{
    "adminAPIInstalled" = $script:adminAPIInstalled;
    "groupModified" = $script:groupModified;
    "errorsReported" = $script:errorsReported
} -Compress -Depth 100
