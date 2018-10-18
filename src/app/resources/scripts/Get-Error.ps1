Param([int]$wait)
sleep $wait
write-progress -Activity "running" -PercentComplete 50
write-error "=== Error Error Error === ($wait)"

