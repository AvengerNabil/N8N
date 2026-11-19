@echo off
echo ===================================================
echo   Starting NABIL AI ASSISTANT (Backend + Frontend)
echo ===================================================

echo Starting Backend API server on port 4000...
start "Nabil AI - Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting 3 seconds for Backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Frontend Dashboard on port 3000...
start "Nabil AI - Dashboard" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting 3 seconds for Frontend initialization...
timeout /t 3 /nobreak >nul

echo Opening Dashboard in your browser...
start http://localhost:3000

echo All services launched!
