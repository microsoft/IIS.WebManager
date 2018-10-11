Param(
    [Alias("n")]
    [Parameter(Mandatory=$true)]
    [string]$name,
    [switch] $Clean = $false
)

$name = $name.ToLower();
$componentName = $name.ToUpper()[0]
$componentName += $name.Substring(1)

$baseDirectory = Get-Location | Split-Path

$appDirectory = $baseDirectory + "\src\app"
$exampleDirectory = $appDirectory + "\hello"

function RenameFilesInDirectory($directory)
{
    "Renaming files..."
    $fileSelect = $directory + "\hello.*" 
    $filesToChange = Split-Path $fileSelect -Leaf -Resolve
    foreach($file in $filesToChange) 
    {
        if($file -ne "hello.service.ts")
        {
            $filePath = $directory + "\" + $file
            $content = Get-Content $filePath
    
            $newContent = $content.Replace('hello', $name)
            $newContent = $newContent.Replace('Hello', $componentName)
        
            $newFileName = $file.Replace('hello', $name)
            $newFilePath = $directory + "\" + $newFileName
            # do file update
            $newContent | Out-File $newFilePath
            Remove-Item $filePath
        }
    }

    #and now to rename the folder
    Rename-Item $directory $name
}

function UpdateComponentReferences($directory)
{
    "Updating app references..."
    $fileSelect = $directory + "\app*"
    Split-Path $fileSelect -Leaf -Resolve | ForEach-Object {
        $updateFile = $directory + "\" + $_
        $content = Get-Content $updateFile
        
        $newContent = $content.Replace('hello', $name)
        $newContent = $newContent.Replace('Hello', $componentName)
            
        $newContent | Out-File $updateFile
    }
}

function CleanDirectory($directory)
{
    "Cleaning..."
    # Remove-Item 
}

RenameFilesInDirectory($exampleDirectory)

UpdateComponentReferences($appDirectory)

if($Clean.IsPresent)
{
    CleanDirectory($exampleDirectory)
}


"Done."