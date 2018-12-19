param(
    [string]
    $requestBase64
)

$ErrorActionPreference = "Stop"
$contentEncoding = [System.Text.Encoding]::UTF8

function stringify($content) {
    if ((!$content) -or ($content -is [System.String])) {
        return $content
    }

    if ($content -is [System.Byte[]]) {
        return [System.Convert]::ToBase64String($content)
    }

    return $content.ToString()
}

## same order as @angular/http/enums/RequestMethod
$requestMethods = @(
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Get,
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Post,
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Put,
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Delete,
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Options,
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Head,
    [Microsoft.PowerShell.Commands.WebRequestMethod]::Patch
)

$decoded = $contentEncoding.GetString([System.Convert]::FromBase64String($requestBase64))
$reqObj = ConvertFrom-Json $decoded
$uri = [System.UriBuilder]$reqObj.url
$uri.Host = "localhost"
$req = @{ "Uri" = $uri.ToString() }

if ($reqObj.method) {
    $req.Method = $requestMethods[$reqObj.method]
}

if ($reqObj._body) {
    $req.Body = $reqObj._body
}

if ($reqObj.headers) {
    $req.Headers = @{}
    foreach ($prop in $reqObj.headers | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name) {
        ## NOTE: not all http headers follow the same syntax. This delimitation logic is assumed to work for all headers we use
        $req.Headers[$prop] = $reqObj.headers.$prop -Join ","
    }
}

try {
    $res = Invoke-WebRequest -UseBasicParsing -UseDefaultCredentials @req
} catch {
    $errMsg = $_.Exception.Message
    $res = $_.Exception.Response
} finally {
    if (!$res) {
        throw $errMsg
    }
    $content = stringify $res.Content
    $result = ConvertTo-Json @{
        "url" = $res.ResponseUri;
        "status" = $res.StatusCode;
        "statusText" = $res.StatusDescription;
        "type" = $res."Content-Type";
        "headers" = $res.Headers;
        "body" = $content
    } -Compress -Depth 100
    $result
}
