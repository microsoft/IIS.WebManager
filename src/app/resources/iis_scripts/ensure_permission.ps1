Param(
    ## Origin is the hostname of the CORS origin - the site that hosts wac
    [Parameter(Mandatory=$true)]
    [string]
    $origin,

    ## requestHost is the hostname where the http requests would be coming from - the computer that is running WAC on client side
    [Parameter(Mandatory=$true)]
    [string]
    $requestHost,

    [string]
    $serviceName = "Microsoft IIS Administration",
    
    ## Not doing anything with this parameter yet
    [string]
    $sessionId,

    [int]
    $adminAPIPort = 55539
)

$ErrorActionPreference = "Stop"
$service = Get-WmiObject win32_service | Where-Object {$_.name -eq $serviceName}

if (!$service) {
    throw "$serviceName is not installed"
}

if ($service.StartInfo.EnvironmentVariables["USE_CURRENT_DIRECTORY_AS_ROOT"] -and $service.StartInfo.WorkingDirectory) {
    $workingDirectory = $service.StartInfo.WorkingDirectory
} else {
    $workingDirectory = Split-Path ($service.Modules | Where-Object { $_.ModuleName -eq "Microsoft.IIS.Administration.dll" }).FileName
}

$configLocation = [System.IO.Path]::Combine($workingDirectory, "config", "appsettings.json")
$config = Get-Content -Raw -Path $configLocation | ConvertFrom-Json

$user = $(whoami)
$userPolicy = $config.security.users.administrators | Where-Object { $_ -like $user }
$originPolicy = $config.cors.rules | Where-Object { $_ -like $origin }

if (!$userPolicy -or !$originPolicy -or !$originPolicy.allow) {
    if (!$userPolicy) {
        $config.security.users.administrators += $user
    }

    if (!$originPolicy) {
        $config.cors.rules += New-Object PSObject -Property @{ "origin" = $origin; "allow" = $true }
    } elseif (!$originPolicy.allow) {
        $originPolicy.allow = $true
    }
    
    $originalAcl = Get-Acl $configLocation
    $newAcl = Get-Acl $configLocation
    $ar = New-Object System.Security.AccessControl.FileSystemAccessRule($user, "write", "allow")
    $newAcl.SetAccessRule($ar)
    Set-Acl $configLocation $newAcl
    $config | ConvertTo-Json -depth 100 | Out-File $configLocation
    Set-Acl $configLocation $originalAcl

    Restart-Service -Name $serviceName
}

$firewallRuleName = "wac-iis.$requestHost"

if (!(Get-NetFirewallProfile -Name $firewallRuleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name $firewallRuleName -DisplayName $firewallRuleName `
        -Description "Enabled by Windows Admin Center: allow $requestHost to access admin api, port $adminAPIPort" `
        -Enabled "true" -RemoteAddress $requestHost -Action "allow" -LocalPort $adminAPIPort -Direction Inbound
}

"Success"
