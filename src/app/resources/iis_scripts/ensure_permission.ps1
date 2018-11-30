Param(
    ## Origin is the hostname of the CORS origin - the site that hosts wac
    [Parameter(Mandatory=$true)]
    [string]
    $origin,

    ## requestHost is the hostname where the http requests would be coming from - the computer that is running WAC on client side
    [string]
    $requestHost,

    [string]
    $serviceName = "Microsoft IIS Administration",
    
    ## Not doing anything with this parameter yet
    [string]
    $sessionId,

    [int]
    $adminAPIPort = 55539,

    [ValidateSet("domain", "host")]
    [string]
    $firewallRule
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

if (!$userPolicy) {
    $config.security.users.administrators += $user
    $originalAcl = Get-Acl $configLocation
    $newAcl = Get-Acl $configLocation
    $ar = New-Object System.Security.AccessControl.FileSystemAccessRule($user, "write", "allow")
    $newAcl.SetAccessRule($ar)
    Set-Acl $configLocation $newAcl
    $config | ConvertTo-Json -depth 100 | Out-File $configLocation
    Set-Acl $configLocation $originalAcl
    Restart-Service -Name $serviceName
}

'{ "result" : "permission modified" }'
