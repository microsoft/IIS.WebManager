param (
  [string]$Id = 'UA-XXXXXXXX-X'
)

$analytics = Join-Path $env:DEPLOYMENT_TARGET "js/settings.js"
$text = [System.IO.File]::ReadAllText($analytics)
$text = $text.Replace('UA-XXXXXXXX-X', $Id)
Write-Host "Writing"
$text
Write-Host "To $analytics"
[System.IO.File]::WriteAllText($analytics, $text)