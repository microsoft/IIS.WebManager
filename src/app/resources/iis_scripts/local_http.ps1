param(
    [string]
    $requestBase64
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http
$contentEncoding = [System.Text.Encoding]::UTF8

function stringify([System.Byte[]]$content) {
    if (!$content) {
        return $content
    }
    return [System.Convert]::ToBase64String($content).ToString()
}

## same order as @angular/http/enums/RequestMethod
## Note that index 0 maps to GET, so if $reqObj.method is null we would default to GET
$requestMethods = @(
    [System.Net.Http.HttpMethod]::Get,
    [System.Net.Http.HttpMethod]::Post,
    [System.Net.Http.HttpMethod]::Put,
    [System.Net.Http.HttpMethod]::Delete,
    [System.Net.Http.HttpMethod]::Options,
    [System.Net.Http.HttpMethod]::Head,
    [System.Net.Http.HttpMethod]::Patch
)

$decoded = $contentEncoding.GetString([System.Convert]::FromBase64String($requestBase64))
$reqObj = ConvertFrom-Json $decoded

$httpMethod = $requestMethods[[int]$reqObj.method]
$uriBuilder = [System.UriBuilder]$reqObj.url
$uriBuilder.Host = "localhost"
$uri = $uriBuilder.ToString()

Write-Host $decoded
try {
    $httpMsg = New-Object System.Net.Http.HttpRequestMessage -ArgumentList $httpMethod,$uri
    if ($reqObj.Body) {
        $httpMsg.Content = $requestContent
        $requestContent = New-Object System.Net.Http.StringContent ([string] $reqObj.Body)
    }
    foreach ($prop in $reqObj.headers | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name) {
        $httpMsg.Headers.Add($prop, $reqObj.headers.$prop)
    }
    $clientHandler = New-Object System.Net.Http.HttpClientHandler
    $clientHandler.UseDefaultCredentials = $true
    $client = New-Object System.Net.Http.HttpClient -ArgumentList $clientHandler
    $responseMsg = $client.SendAsync($httpMsg).GetAwaiter().GetResult()

    if ($responseMsg.Content) {
        $resContent = stringify $responseMsg.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
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
