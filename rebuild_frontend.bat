
@echo off
cd /d "%~dp0"
cd second-brain\frontend

echo Cleaning old build...
if exist .next_new rmdir /s /q .next_new

echo Building frontend (this WILL take 1-2 minutes)...
echo If it seems stuck, please be patient.
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Build complete.
echo.
