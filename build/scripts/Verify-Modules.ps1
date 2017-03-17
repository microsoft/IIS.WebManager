$ScriptDir = Split-Path $script:MyInvocation.MyCommand.Path
$NodeModules = Get-Item $([System.IO.Path]::Combine($ScriptDir, "../../node_modules"))
$ShrinkWrapJson = Get-Item $([System.IO.Path]::Combine($ScriptDir, "../../npm-shrinkwrap.json"))

$ShrinkWrap = ConvertFrom-Json $([System.IO.File]::ReadAllText($ShrinkWrapJson.FullName))
$Dependencies = $ShrinkWrap.dependencies
$Modules = $Dependencies | Get-Member | where {$_.MemberType -eq "NoteProperty"} | %{$_.name}

function VerifyModule($module, $path, $obj) {
    "Verifying $Name"

    $subDependencies = $obj."$module".dependencies
    if ($subDependencies -ne $null) {
        $subModules = $subDependencies | Get-Member -MemberType NoteProperty | %{$_.Name}
        foreach ($subModule in $subModules) {
            VerifyModule $subModule $("$path/node_modules/$subModule") $subDependencies
        }
    }

    $Actual = ./Get-FolderHash.ps1 $path -Exclude "package.json"
    if ($Actual -ne $obj."$Module".Hash) {
        Write-Warning "Invalid module $path"
        exit 1
    }
}

Push-Location $ScriptDir
try {
    foreach ($Module in $Modules) {
        "verify $Module"
        VerifyModule $Module "$($NodeModules.FullName)/$Module" $Dependencies
    }
}
finally {
    Pop-Location
}

exit 0