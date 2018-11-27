$ErrorActionPreference = "Stop"

Push-Location src
try {
    $NODE_MODULES="node_modules"
    if ($args | Where-Object { $_ -like "--purge" }) {
        if (Test-Path $NODE_MODULES) {
            Write-Host "Remove $NODE_MODULES..."
            Remove-Item -Force -Recurse $NODE_MODULES | Out-Null
        }
        $buildArgs = $args | Where-Object { $_ -notlike "--purge" }
    } else {
        $buildArgs = $args
    }
    
    if (!(Test-Path $NODE_MODULES)) {
        Write-Host "Installing dependencies..."
        npm install
    }

    Write-Host "Ensure build tools are installed..."
    npm install -g @angular/cli@1.7.4
    npm install -g gulp-cli@2.0.1

    Write-Host "Building project..."
    gulp build $buildArgs

    nuget pack -OutputDirectory ..\dist
} finally {
    Pop-Location
}
