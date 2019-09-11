[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]
    $requestBase64,

    [Parameter(Mandatory=$true)]
    [string]
    $sessionId

)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http
$contentEncoding = [System.Text.Encoding]::UTF8

######################## Utilities ###############################
$verbose = $PSBoundParameters['verbose']

if ($verbose) {
    $logDir = Join-Path $env:UserProfile 'wac-iis-logs'
    if (!(Test-Path $logDir)) {
        mkdir $logDir | Out-Null
    }
    $timestamp = Get-Date -Format "yyyyMMddTHHmmssffffZ"
    $logFile = Join-Path $logDir "Invoke-LocalHttp-${timestamp}-${sessionId}.log"
}

function LogVerbose([string] $msg) {
    $msg = "[$(Get-Date -Format ""yyyy/MM/dd HH:mm:ss:ffff"")] $msg"
    if ($verbose) {
        Write-Verbose $msg
        Add-Content -Value $msg -Path $logFile -Force | Out-Null
    }
}

## same order as @angular/http/enums/RequestMethod
## Note that index 0 maps to GET, so if $reqObj.method is null we would default to GET
$patchMethod = New-Object System.Net.Http.HttpMethod "PATCH"
$requestMethods = @(
    [System.Net.Http.HttpMethod]::Get,
    [System.Net.Http.HttpMethod]::Post,
    [System.Net.Http.HttpMethod]::Put,
    [System.Net.Http.HttpMethod]::Delete,
    [System.Net.Http.HttpMethod]::Options,
    [System.Net.Http.HttpMethod]::Head,
    $patchMethod
)

LogVerbose "Raw request $requestBase64"
$decoded = $contentEncoding.GetString([System.Convert]::FromBase64String($requestBase64))

$reqObj = ConvertFrom-Json $decoded
LogVerbose "Request $decoded"

$httpMethod = $requestMethods[[int]$reqObj.method]
$uriBuilder = [System.UriBuilder]$reqObj.url
$uriBuilder.Host = "localhost"
$uri = $uriBuilder.ToString()

try {
    $httpMsg = New-Object System.Net.Http.HttpRequestMessage -ArgumentList $httpMethod, $uri
    if ($reqObj._body -or $reqObj._bodyUint8Array) {
        if ($reqObj._bodyUint8Array) {
          ## Convert retreived JSON object like {0:byte1,1:byte2...} to a Byte array like {byte1, byte2...}.
          $byteArray = New-Object Byte[] $reqObj._bodyUint8ArrayLength
          for ($i = 0; $i -lt $reqObj._bodyUint8ArrayLength; $i++) { 
            $byteArray[$i] = $reqObj._bodyUint8Array.$i;
          }
          $requestContent = New-Object System.Net.Http.ByteArrayContent($byteArray, 0, $reqObj._bodyUint8ArrayLength)
        } else {
          $requestContent = New-Object System.Net.Http.StringContent ([string] $reqObj._body)
        }
        $httpMsg.Content = $requestContent
    }
    foreach ($prop in $reqObj.headers | Get-Member -MemberType NoteProperty | Microsoft.PowerShell.Utility\Select-Object -ExpandProperty Name) {
        $headerValue = $reqObj.headers.$prop
        if (!$httpMsg.Headers.TryAddWithoutValidation($prop, $headerValue)) {
            $headerFixed = $false
            if ($httpMsg.Content) {
                if ($prop -like "content-type") {
                    $httpMsg.Content.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue $headerValue
                    $headerFixed = $true
                } elseif ($prop -like "content-range") {
                    $tokens = $headerValue.Split("/-")
                    $from = [int]::Parse(($tokens[0].Trim() -split " ")[-1])
                    $to = [int]::Parse($tokens[1].Trim())
                    $length = [int]::Parse($tokens[2].Trim())
                    $httpMsg.Content.Headers.ContentRange = New-Object System.Net.Http.Headers.ContentRangeHeaderValue -ArgumentList $from, $to,  $length
                    $headerFixed = $true
                }
                ## possibly add more misplaced headers
            }
            if ($headerFixed) {
                LogVerbose "Replaced header ${prop}: ${headerValue}"
            } else {
                LogVerbose "Failed to add header ${prop}: ${headerValue}"
            }
        }
    }
    $clientHandler = New-Object System.Net.Http.HttpClientHandler
    $clientHandler.UseDefaultCredentials = $true
    $client = New-Object System.Net.Http.HttpClient -ArgumentList $clientHandler
    $responseMsg = $client.SendAsync($httpMsg).GetAwaiter().GetResult()

    if ($responseMsg.Content) {
        $resContent = $responseMsg.Content.ReadAsStringAsync().GetAwaiter().GetResult();
    }

    $result = ConvertTo-Json @{
        "url" = $responseMsg.RequestMessage.RequestUri
        "status" = $responseMsg.StatusCode;
        "statusText" = $responseMsg.ReasonPhrase;
        "type" = $responseMsg.Content.Headers.ContentType.MediaType;
        "headers" = $responseMsg.Content.Headers;
        "body" = $resContent
    } -Compress -Depth 100
} finally {
    if ($responseMsg) {
        $responseMsg.Dispose()
    }
    if ($requestContent) {
        $requestContent.Dispose()
    }
    if ($httpMsg) {
        $httpMsg.Dispose()
    }
    if ($clientHandler) {
        $clientHandler.Dispose()
    }
    if ($client) {
        $client.Dispose()
    }
}

if ($result) {
    $result
} else {
    throw "Unexpected error occured"
}
