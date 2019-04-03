1..30 | foreach {
    sleep 2
    $p = [math]::floor($_/30 * 100)
    write-progress -Activity "running" -PercentComplete $p
    get-service winrm
}