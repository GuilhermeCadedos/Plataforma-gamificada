# Start backend and frontend in separate PowerShell windows on Windows
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend-react"

# Start backend
Start-Process -FilePath "powershell" -ArgumentList @("-NoExit","-Command","cd `"$backend`"; npm install; npm run start") -WindowStyle Normal

# Start frontend with VITE_API_URL
Start-Process -FilePath "powershell" -ArgumentList @("-NoExit","-Command","cd `"$frontend`"; $env:VITE_API_URL='http://localhost:3001'; npm install; npm run dev") -WindowStyle Normal

Write-Host "Started backend (http://localhost:3001) and frontend (http://localhost:5280) in separate windows."