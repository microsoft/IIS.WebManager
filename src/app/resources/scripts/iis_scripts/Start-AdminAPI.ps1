[CmdletBinding()]
param(
    ## Not doing anything with this parameter yet
    [string]
    $sessionId,

    [string]
    $serviceName = "Microsoft IIS Administration"
)

$ErrorActionPreference = "Stop"
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
}

Start-Service -Name $serviceName
WaitForServerToStart $serviceName

'{ "success": true }'
