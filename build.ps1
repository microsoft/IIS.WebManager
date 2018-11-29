$ErrorActionPreference = "Stop"

$purge = $args | Where-Object { $_ -like "--purge" }
$pack = $args | Where-Object { $_ -like "--pack" }

if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    throw "npm is required in PATH"
}

if ($purge -and !(Get-Command "git" -ErrorAction SilentlyContinue)) {
    throw """--purge"" operation requires git in PATH"
}

if ($pack -and !(Get-Command "nuget" -ErrorAction SilentlyContinue)) {
    throw """--pack"" operation requires nugetin PATH"
}

$buildArgs = $args | Where-Object { $_ -notlike "--purge" -and $_ -notlike "--pack" }

Push-Location src
try {
    if ($purge) {
        try {
            git clean -xdf
        } catch {
            ## Sometimes somehow git clean throws error, ignoring any clean up error
            Write-Error $_ -ErrorAction Continue
        }
    }

    if (!(Test-Path "node_modules")) {
        Write-Host "Installing dependencies..."
        npm install
    }

    Write-Host "Ensure build tools are installed..."
    npm install -g @angular/cli@1.7.4
    npm install -g gulp-cli@2.0.1

    Write-Host "Building project..."
    gulp build $buildArgs

    if ($pack) {
        nuget pack . -OutputDirectory (Resolve-Path "..\dist").Path
    }
} finally {
    Pop-Location
}
