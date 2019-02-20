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
$version = $args | Where-Object { $_.ToLower().startsWith("--version=") }
if ($version) {
    # Example: --version=0.1.$(Build.BuildNumber)
    Write-Host ($version)
    $version = $version.split("=")[1]
}

if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    throw "npm is required in PATH"
}

if ($purge -and !(Get-Command "git" -ErrorAction SilentlyContinue)) {
    throw """--purge"" operation requires git in PATH"
}

if ($pack) {
    if (!(Get-Command "nuget" -ErrorAction SilentlyContinue)) {
        throw """--pack"" operation requires nugetin PATH"
    }

    $outputHashingTag = "--output-hashing"
    $outputHashingIndex = -1
    foreach ($i in 0..($args.Count - 1)) {
        if ($args[$i].ToLower() -eq $outputHashingTag) {
            $outputHashingIndex = $i
            break
        }
    }
    if (
        ($outputHashingIndex -eq -1) -Or
        ($outputHashingIndex+1 -ge $args.Count) -Or
        ($args[$outputHashingIndex+1].ToLower() -ne "all")
    ) {
        throw "Please include ""$outputHashingTag all"" option when packing"
    }
}

Write-Host "Dump the root source directory..."
Get-ChildItem $Env:BUILD_SOURCESDIRECTORY

$buildArgs = $args | Where-Object { $_ -notlike "--purge" -and $_ -notlike "--pack" -and -not ($_.startsWith("--version="))}
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
        nuget pack . -Version $version -OutputDirectory (Resolve-Path "..\dist").Path
    }
} finally {
    Pop-Location
}
