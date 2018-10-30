param(
    [Parameter(Mandatory=$true)]
    [string]
    $download,
    
    ## Not doing anything with this parameter yet
    [string]
    $sessionId
)

$ErrorActionPreference = "Stop"

$installer = Join-Path $env:TEMP iis-admin-api-install.exe
Invoke-WebRequest $download -OutFile $installer
& $installer /s

"Success"
