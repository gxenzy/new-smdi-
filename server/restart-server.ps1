# Kill any process using port 8000
Write-Output "Killing any process using port 8000..."
$processInfo = netstat -ano | Select-String -Pattern ':8000' | Select-String -Pattern 'LISTENING'
if ($processInfo) {
    $pid = $processInfo -replace '.*LISTENING\s+', ''
    taskkill /PID $pid /F
    Write-Output "Process with PID $pid killed."
} else {
    Write-Output "No process found using port 8000."
}

# Wait a moment to ensure the port is released
Start-Sleep -Seconds 1

# Start the server
Write-Output "Starting server..."
npm run start 