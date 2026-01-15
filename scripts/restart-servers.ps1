# Restart backend and frontend dev servers (Windows PowerShell)
# Stops any Node process listening on ports 3001 or 5281, then starts backend and frontend in background terminals.

function Kill-PortProcess {
  param([int]$Port)
  $owningPids = (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue).OwningProcess
  if ($owningPids) {
    foreach ($ownPid in $owningPids) {
      Write-Output "Killing PID $ownPid on port $Port"
      Stop-Process -Id $ownPid -Force -ErrorAction SilentlyContinue
    }
  }
}

# Kill existing
Kill-PortProcess -Port 3001
Kill-PortProcess -Port 5281

# Start backend
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\..\backend" -FilePath "powershell" -ArgumentList "-NoExit","-Command","npm run start"
Start-Sleep -Seconds 1
# Start frontend (Vite)
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\..\frontend-react" -FilePath "powershell" -ArgumentList "-NoExit","-Command","npm run dev"

Write-Output "Restart commands issued. Backend -> http://localhost:3001, Frontend -> http://localhost:5281"