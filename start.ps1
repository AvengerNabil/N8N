# Launch Nabil AI Assistant Backend & Frontend
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting NABIL AI ASSISTANT (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Start Backend API
Write-Host "Starting Backend API on port 4000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# 2. Start Frontend Dashboard
Write-Host "Starting Frontend Dashboard on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# 3. Wait and open browser
Start-Sleep -Seconds 3
Write-Host "Opening Dashboard at http://localhost:3000 in your browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"
