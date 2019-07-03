Param(
    [string]
    $name
)

(Get-Item Env:$name).Value
