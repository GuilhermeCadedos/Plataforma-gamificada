# Start backend (3001) and frontend (5281) with proxy; open browser
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend-react"

# Start backend
Start-Process -FilePath "powershell" -ArgumentList @("-NoExit","-Command","cd `"$backend`"; npm install; npm run start") -WindowStyle Normal

# Start frontend (port 5281)
Start-Process -FilePath "powershell" -ArgumentList @("-NoExit","-Command","cd `"$frontend`"; npm install; npm run dev") -WindowStyle Normal

Start-Sleep -Seconds 2
Start-Process "http://localhost:5281/"

Write-Host "Frontend: http://localhost:5281 (proxy /api -> http://localhost:3001). Backend: http://localhost:3001."