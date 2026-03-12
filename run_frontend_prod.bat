
@echo off
cd /d "%~dp0"
cd second-brain\frontend

echo Building frontend (production mode)...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Starting frontend...
start /b npm start
