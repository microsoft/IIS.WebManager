param (
  [string]$FaviconUrl= 'assets/favicon.ico'
)

$configuration = Join-Path $env:DEPLOYMENT_TARGET "web.config"
$text = [System.IO.File]::ReadAllText($configuration)
$text = $text.Replace('assets/favicon.ico', $FaviconUrl)
Write-Host "Writing"
$text
Write-Host "To $configuration"
[System.IO.File]::WriteAllText($configuration, $text)