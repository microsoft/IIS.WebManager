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

function ToPassThroughArgs($inputArgs) {
    return $inputArgs | Where-Object { $_ -notlike "--purge" -and $_ -notlike "--pack" `
    -and $_ -notlike "--serve" -and -not ($_.startsWith("--version=")) `
    -and -not ($_.startsWith("--env=")) -and -not ($_.startsWith("--configuration=")) `
    -and -not ($_.startsWith("-c="))}
}

$purge = $args | Where-Object { $_ -like "--purge" }
$buildEnv = $args | Where-Object { $_.ToLower().startsWith("--env=")}
$pack = $args | Where-Object { $_ -like "--pack" }
$serve = $args | Where-Object { $_ -like "--serve" }
$version = $args | Where-Object { $_.ToLower().startsWith("--version=") }
if ($version) {
    # Example: --version=0.1.$(Build.BuildNumber)
    Write-Host ($version)
    $version = $version.split("=")[1]
}
elseif ($pack)
{    
   throw "--version=xxx.xxx is required if --pack is provided"
}

if($buildEnv)
{
      $buildEnv = "-c=" + $buildEnv.split("=")[1]
}
else {
    $buildEnv = "-c=wac"
}

if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    throw "npm is required in PATH"
}

if ($purge -and !(Get-Command "git" -ErrorAction SilentlyContinue)) {
    throw """--purge"" operation requires git in PATH"
}

if ($pack) {
    if (!(Get-Command "nuget" -ErrorAction SilentlyContinue)) {
        throw """--pack"" operation requires nuget.exe in PATH"
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
        -not ($args[$outputHashingIndex+1].Equals("all"))
    ) {
        throw "Please include ""$outputHashingTag all"" option when packing"
    }
}

Write-Host "Dump the root source directory..."
Get-ChildItem $Env:BUILD_SOURCESDIRECTORY

$buildArgs = ToPassThroughArgs $args
$buildTools = @("@angular/cli","gulp-cli")

Push-Location src
try {
    if ($purge) {
        git clean -xdf
    }

    Write-Host "Ensure build tools are installed..."
    $allDependencies = Get-Content "package.json" | ConvertFrom-Json

    foreach($pkg in $buildTools) {
        $versionFile = $allDependencies.devDependencies."$pkg"
        $pkgVersion = "${pkg}@${versionFile}"
        Write-Verbose "Dev dependency found: ${pkgVersion}"
        if (!((npm list -g $pkgVersion) | Where-Object { $_ -match "$pkgVersion\s*$" })) {
            npm install -g $pkgVersion
        }
    }

    if (ShouldNPMInstall) {
        Write-Host "Installing dependencies..."
        npm install 
    }

    Write-Host "Building project..."
    gulp build $buildArgs $buildEnv

    Write-Host ("OutputDirectory: " + (Resolve-Path "..\dist").Path)
    if ($pack) {
        nuget pack . -Version $version -OutputDirectory (Resolve-Path "..\dist").Path
    }
    if ($serve) {
        gulp serve $buildArgs
    }
} finally {
    Pop-Location
}
