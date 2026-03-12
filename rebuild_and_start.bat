@echo off
cd /d "%~dp0"

echo Killing old processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo.
echo Building frontend...
cd second-brain\frontend
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo.
echo Starting Backend...
cd ..
start "Backend" cmd /k "venv\Scripts\activate && uvicorn backend.main:app --reload --env-file .env --host 0.0.0.0 --port 8000"

echo.
echo Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm start"

echo.
echo Services launched!
