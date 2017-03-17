Param (
    [Parameter(Mandatory=$True,
        ValueFromPipeline=$True,
        ValueFromPipelineByPropertyName=$True,
        Position=0,
        HelpMessage='Which folder would you like to use?')]
    [object]$Folder,
    
    [Parameter()]
    [string[]]$Exclude = @()
)

$Folder = Get-Item $Folder
$FileHashes = Get-ChildItem $Folder -Recurse -File | Where-Object {-not($Exclude.Contains($_.Name))} | Sort -Property FullName | Get-FileHash
$Hashes = @()
$FileHashes | Sort-Object -Property Path | %{$Hashes += $_.Hash}
$Joined = [string]::Join("", $Hashes)
$Bytes = [System.Text.Encoding]::UTF8.GetBytes($Joined)
$Hasher = [System.Security.Cryptography.SHA256]::Create()
$Bytes = $Hasher.ComputeHash($Bytes)
$Hasher.Dispose()
[BitConverter]::ToString($Bytes).Replace("-", "")