param(
    [string]
    $requestBase64
)

$ErrorActionPreference = "Stop"
$contentEncoding = [System.Text.Encoding]::UTF8

function stringify($content) {
    if ((!$content) -or ($content -is [System.String])) {
        return $content
    } elseif ($content -is [System.Byte[]]) {
        return [System.Convert]::ToBase64String($content)
    } else {
        return $content.ToString()
    }
}

$decoded = $contentEncoding.GetString([System.Convert]::FromBase64String($requestBase64))
$reqObj = ConvertFrom-Json $decoded
$uri = [System.UriBuilder]$reqObj.url
$uri.Host = "localhost"
$req = @{ "Uri" = $uri.ToString() }

if ($reqObj.method) {
    $req.Method = [Microsoft.PowerShell.Commands.WebRequestMethod]$reqObj.method
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
    $res = $_.Exception.Response
} finally {
    if (!$res) {
        throw "No response is returned."
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
