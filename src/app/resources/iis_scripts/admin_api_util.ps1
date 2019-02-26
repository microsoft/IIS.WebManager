#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('install', 'ensure')]
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
    $appName = "Microsoft IIS Administration",

    [Version]
    $appMinVersion = [Version]::Parse("2.2.1"),

    [string]
    $serviceName = "Microsoft IIS Administration",

    [string]
    $iisAdminOwners = "IIS Administration API Owners",

## TODO: Figure out how to detect endpoint dynamically when the service is installed, blockers:
## 1. For some reasons port 55539 is owned by system process
## 2. We might be able to detect port used by inspecting services or cert installed
    [string]
    $apiHost = "https://localhost:55539"
)

$ErrorActionPreference = "Stop"

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
        mkdir $logDir | Out-Null
    }
    $timestamp = Get-Date -Format "yyyyMMddTHHmmssffffZ"
    $logFile = Join-Path $logDir "admin_api_util-${timestamp}-${sessionId}.log"
}

function LogVerbose([string] $msg) {
    $msg = "[$(Get-Date -Format ""yyyy/MM/dd HH:mm:ss:ffff"")] $msg"
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

$script:adminAPIInstalled = $false
function InstallComponents {
    if ($dotnetCoreLocation) {
        Install "dotnet-core-runtime" $dotnetCoreInstallType $dotnetCoreLocation
    }
    Install "iis-administration-api" $iisAdminInstallType $adminAPILocation
    WaitForServerToStart $serviceName
    $script:adminAPIInstalled = $true
}

function Download([string] $uri, [string] $location) {
    Invoke-WebRequest $uri -OutFile $location
    LogVerbose "Downloaded $uri to $location"
}

function Install([string] $scenario, [string] $installType, [string] $location) {
    $installer = Join-Path $env:TEMP "${scenario}.exe"
    LogVerbose "source: $location will be copied to $installer"
    if ($installType -eq "file") {
        Copy-Item -Path $location -Destination $installer -Force | Out-Null
    } elseif ($installType -eq "uri") {
        Download $location $installer
    } else {
        throw "Invalid install type $installType"
    }
    LogVerbose "Running $installer"
    & $installer /s DefaultCors=false | Out-Null
    LogVerbose "Successfully installed $scenario"
}

function GetIISAdminAPIApp {
    return Get-WMIObject -Class Win32_Product | Where-Object { $_.Name -eq $appName }
}

function ThrowExpectedError($err) {
    throw (ConvertTo-Json $err -Compress -Depth 100)
}

function EnsureMinVersion($app, $minVersion) {
    $version = [Version]::Parse($app.Version)
    if ($version -lt $minVersion) {
        ThrowExpectedError @{
            "Type" = "PREREQ_BELOW_MIN_VERSION";
            "App" = $app.Name;
            "Actual" = $version.ToString();
            "Required" = $minVersion.ToString()
        }
    }
}

function EnsureIISAdminStarted {
    try {
        LogVerbose "Pinging Admin API at $apiHost"
        Invoke-WebRequest -UseDefaultCredentials -UseBasicParsing $apiHost | Out-Null
    } catch {
        if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ConnectFailure) {
            $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
            if (!$service) {
                ThrowExpectedError @{
                    "Type" = "ADMIN_API_SERVICE_NOT_FOUND";
                    "App" = $appName
                }
            }
            if ($service.Status -eq [System.ServiceProcess.ServiceControllerStatus]::Running) {
                ThrowExpectedError @{
                    "Type" = "ADMIN_API_SERVICE_WRONG_ENDPOINT";
                    "EndPoint" = $apiHost
                }
            }
            ThrowExpectedError @{
                "Type" = "ADMIN_API_SERVICE_NOT_RUNNING";
                "Status" = $service.Status
            }
        }
        throw
    }
}

function GetLocalAd {
    $server = "$env:COMPUTERNAME"
    return [ADSI]"WinNT://$server,computer"
}

function VerifyCOMErrorCode($thrown, $code) {
    return ($thrown.Exception -and
            $thrown.Exception.InnerException -and
            $thrown.Exception.InnerException -is [System.Runtime.InteropServices.COMException] -and
            ($thrown.Exception.InnerException.HResult -eq $code -or $thrown.Exception.InnerException.ErrorCode -eq $code))
}

## Precondition: group should already exist. Note that the installer would create the group
function EnsureUserGroup($groupName) {
    $userAD = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

    ## TODO: we might want to check membership recursively. It might not be necessary if the user is already in a subgroup
    if ((Get-Command "Get-LocalGroupMember" -ErrorAction SilentlyContinue) -and
        (Get-Command "Add-LocalGroupMember" -ErrorAction SilentlyContinue)) {
        if (!(Get-LocalGroupMember -Group $groupName -Member $userAD -ErrorAction SilentlyContinue)) {
            Add-LocalGroupMember -Group $groupName -Member $userAD | Out-Null
        }
    } else {
        $userPath = 'WinNT://' + $userAD.Replace("\", "/")
        $localAd = GetLocalAd
        try {
            $group = $localAd.Children.Find($groupName, 'group')
        } catch {
            if (VerifyCOMErrorCode $_ 0x800708AC) {
                ## Expected exception when group does not exist
                LogVerbose "Re-throwing an exception that might have indicated that the group ${groupName} does not exist"
            }
            throw
        }
        try {
            $group.Invoke('Add', @($userPath)) | Out-Null
        } catch {
            if (VerifyCOMErrorCode $_ 0x80070562) {
                # Expected excaption when specified account name is already a member of the group.
                LogVerbose "Member ${userAD} already exists in ${groupName}"
            } else {
                throw
            }
        }
    }
}

####################### Main script ################################

LogVerbose 'Started admin_api_util...'

if ($install) {
    InstallComponents
} else {
    $app = GetIISAdminAPIApp
    if ($app) {
        EnsureMinVersion $app $appMinVersion
    }
    ## If we can't find the app, it might be ok because we may be in dev mode and the server is not installed
}
EnsureUserGroup $iisAdminOwners
EnsureIISAdminStarted

ConvertTo-Json @{
    "adminAPIInstalled" = $script:adminAPIInstalled;
    "apiHost" = $apiHost;
    "groupModified" = $groupModified
} -Compress -Depth 100
