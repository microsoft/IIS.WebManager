#Requires -RunAsAdministrator
#Requires -Version 4.0

Param(
    [string]
    $orgin,

    [string]
    $iisHost = "https://localhost:55539"
)

$ErrorActionPreference = "Stop"
$contentEncoding = [System.Text.Encoding]::UTF8
$tokenName = "WAC"
$RenewEndpoint = "access-tokens"    # Used to renew tokens
$CreateEndpoint = "api-keys"        # Used to create and query existing tokens

function VerifyResponse([string] $action, [Microsoft.Powershell.Commands.WebResponseObject] $response) {
    if ($response.StatusCode -ge 300) {
        throw "Invalid status code $($response.StatusCode) while performing action: $action"
    }
}

function UpsertToken([string] $targetEndpoint, $data) {
    $sessionCreate = Invoke-WebRequest "$iisHost/security/$targetEndpoint" -UseBasicParsing -UseDefaultCredentials -SessionVariable sess
    VerifyResponse "Create WSRF-TOKEN on $targetEndpoint" $sessionCreate | Out-Null
    $hTok = $sessionCreate.headers."XSRF-TOKEN"
    if ($hTok -is [array]) {
        $hTok = $hTok[0]
    }
    $tokenUpsert = Invoke-WebRequest "$iisHost/security/$targetEndpoint" -UseBasicParsing -Headers @{ "XSRF-TOKEN" = $htok } `
        -Method POST -UseDefaultCredentials -ContentType "application/json" -WebSession $sess -Body (ConvertTo-Json $data)
    VerifyResponse "Upsert access token on $targetEndpoint" $sessionCreate | Out-Null
    return $contentEncoding.GetString($tokenUpsert.Content)
}

if ($origin) {
    $tokenName += $orgin
}

$query = Invoke-WebRequest "$iisHost/security/$CreateEndpoint" -UseDefaultCredentials -ContentType "application/json"
VerifyResponse "query exsiting tokens" $query | Out-Null
$existingToken = (ConvertFrom-Json $contentEncoding.GetString($query.Content)).api_keys | Where-Object { $_.purpose -eq $tokenName }

if ($existingToken) {
    ## always renew token when this script is called because there was no way to query for existing token's value
    $existingToken.expires_on = (Get-Date).AddDays(14).ToString()
    ## This is an odd behavior: we need to wrap the existing token in a new object
    $output = UpsertToken $RenewEndpoint @{ "api_key" = $existingToken }
} else {
    $output = UpsertToken $CreateEndpoint @{ "expires_on" = (Get-Date).AddDays(14).ToString(); "purpose" = $tokenName }
}

$output
