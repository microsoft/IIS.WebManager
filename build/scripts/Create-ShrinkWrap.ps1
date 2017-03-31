Param (
    [Parameter(Mandatory=$True,
        ValueFromPipeline=$True,
        ValueFromPipelineByPropertyName=$True,
        Position=0,
        HelpMessage='Which folder would you like to use?')]
    [object]$Folder
)

function HashDependency($module, $path, $obj) {
    Write-Verbose "Module: $module"
    Write-Verbose "Folder $path"
    $subDependencies = $obj."$module".dependencies
    if ($subDependencies -ne $null) {
        $subModules = $subDependencies | Get-Member -MemberType NoteProperty | %{$_.Name}
        foreach ($subModule in $subModules) {
            HashDependency $subModule $("$path/node_modules/$subModule") $subDependencies
        }
    }
    
    Write-Verbose "Data:"
    Write-Verbose $obj."$module"
    $obj."$module" | Add-Member -Name "Hash" -Value $(.\build\scripts\Get-FolderHash.ps1 $path -exclude "package.json") -MemberType NoteProperty
}

$Folder = Get-Item $Folder

if (-not([System.IO.Directory]::Exists($Folder.FullName))) {
    throw "$Folder.FullName not found"
}

if ([System.IO.File]::Exists("$($Folder.FullName)\npm-shrinkwrap.json")) {
    throw "Shrink wrap already exists in $Folder"
}

$o = @{}

try {
    Push-Location $Folder

    npm shrinkwrap
    
    $ShrinkContent = [System.IO.File]::ReadAllText("$($Folder.FullName)\npm-shrinkwrap.json")

    $ShrinkWrap = ConvertFrom-Json $ShrinkContent

    $Dependencies = $ShrinkWrap.dependencies

    $Modules = $Dependencies | Get-Member | where {$_.membertype -eq "NoteProperty"} | %{$_.Name}
    foreach ($module in $modules) {
        HashDependency $module "$($Folder.FullName)/node_modules/$module" $dependencies
    }

    ConvertTo-Json $ShrinkWrap -Depth 100 | Out-File .\npm-shrinkwrap.json -Encoding utf8
}
finally {
    Pop-Location 
}