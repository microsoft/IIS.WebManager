Param([int]$wait)
sleep $wait
write-progress -Activity "running" -PercentComplete 50
throw "=== Exception Exception Exception === ($wait)"

