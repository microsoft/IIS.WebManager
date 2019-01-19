$ErrorActionPreference = "Stop"

<#
.SYNOPSIS
Sometimes right after git clean is called we are unable to stat the directory currently being deleted
This function workaround that by retrying Test-Path command multiple times
#>
function ShouldNPMInstall {
    $npmInstallNeeded = "donno"
    $testPathRetry = 20
    $nodeModuleDir = "node_modules"
    while  ((($testPathRetry--) -and ("donno" -eq $npmInstallNeeded))) {
        try {
            $npmInstallNeeded = !(Test-Path $nodeModuleDir)
        } catch {
            Write-Verbose "Retrying stats on $nodeModuleDir due to error returned: $_"
            Start-Sleep 1
        }
    }

    if ("donno" -eq $npmInstallNeeded) {
        throw "Unable to stat src/$nodeModuleDir"
    }
    return $npmInstallNeeded
}

$purge = $args | Where-Object { $_ -like "--purge" }
$pack = $args | Where-Object { $_ -like "--pack" }
$pack_build = $args | Where-Object { $_.startsWith("--pack.build=") }
if ($pack_build) {
    # Example: --pack.build=0.1.$(Build.BuildNumber)/$(Build.SourceVersion)
    Write-Host ($pack_build)
    $tokens = $pack_build.split("=")[1].trim().split("/")  
    $pack_build = $pack_build = $tokens[0]
} else {
    $pack_build = "0.1.0"
}
Write-Host ("pack_build: " + $pack_build)

if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    throw "npm is required in PATH"
}

if ($purge -and !(Get-Command "git" -ErrorAction SilentlyContinue)) {
    throw """--purge"" operation requires git in PATH"
}

if ($pack -and !(Get-Command "nuget" -ErrorAction SilentlyContinue)) {
    throw """--pack"" operation requires nugetin PATH"
}

$buildArgs = $args | Where-Object { $_ -notlike "--purge" -and $_ -notlike "--pack" -and -not ($_.startsWith("--pack.build="))}
$buildTools = @("@angular/cli@1.7.4","gulp-cli@2.0.1")

Push-Location src
try {
    if ($purge) {
        git clean -xdf
    }

    Write-Host "Ensure build tools are installed..."
    foreach($pkg in $buildTools) {
        if (!((npm list -g $pkg) | Where-Object { $_ -match "$pkg\s*$" })) {
            npm install -g $pkg
        }
    }

    if (ShouldNPMInstall) {
        Write-Host "Installing dependencies..."
        npm install
    }

    Write-Host "Building project..."
    gulp build $buildArgs

    Write-Host ("OutputDirectory: " + (Resolve-Path "..\dist").Path)
    if ($pack) {
        nuget pack . -Version $pack_build -OutputDirectory (Resolve-Path "..\dist").Path
    }
} finally {
    Pop-Location
}
