param(
    [Parameter(Mandatory=$true)]
    [string]
    $download,
    
    ## Not doing anything with this parameter yet
    [string]
    $sessionId,

    [string]
    $serviceName = "Microsoft IIS Administration"
)

$ErrorActionPreference = "Stop"

$installer = Join-Path $env:TEMP iis-administration-setup.exe
Invoke-WebRequest $download -OutFile $installer
& $installer /s

$waitPeriod = 1
$remainingTime = 60

while (!(Get-Service $serviceName -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq "Running"})) {
    Start-Sleep -Seconds $waitPeriod
    $remainingTime -= $waitPeriod
    if ($remainingTime -lt 0) {
        throw "timeout waiting for service to start"
    }
}

'{ "result" : "installation successful" }'
