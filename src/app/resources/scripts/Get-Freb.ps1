#Requires -RunAsAdministrator
#Requires -Version 4.0

param(
    [Parameter(Mandatory=$true)]
    [string]
    $sessionId,

    [Parameter(Mandatory=$true)]
    [string]
    $frebLocation
)

$ErrorActionPreference = "Stop"

######################## Utilities ###############################
$verbose = $PSBoundParameters['verbose']

if ($verbose) {
    $logDir = Join-Path $env:UserProfile 'wac-iis-logs'
    if (!(Test-Path $logDir)) {
        mkdir $logDir | Out-Null
    }
    $timestamp = Get-Date -Format "yyyyMMddTHHmmssffffZ"
    $logFile = Join-Path $logDir "Get-Freb-${timestamp}-${sessionId}.log"
}

function LogVerbose([string] $msg) {
    $msg = "[$(Get-Date -Format ""yyyy/MM/dd HH:mm:ss:ffff"")] $msg"
    if ($verbose) {
        Write-Verbose $msg
        Add-Content -Value $msg -Path $logFile -Force | Out-Null
    }
}

LogVerbose "Getting freb from $frebLocation"

$logsLocation = Split-Path $frebLocation
$xslFile = Join-Path $logsLocation "freb.xsl"

if (!(Test-Path $xslFile)) {
    throw "Cannot find xsl file $xslFile"
}

$xslt = New-Object System.Xml.Xsl.XslCompiledTransform;
$xslt.Load($xslFile)
$writer = New-Object System.IO.StringWriter
$xslt.Transform($frebLocation, $null, $writer)

$result = $writer.ToString()

LogVerbose "Results $result"

$result
