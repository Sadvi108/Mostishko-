
@echo off
cd /d "%~dp0"
cd second-brain\frontend

echo Cleaning cache...
if exist .next rmdir /s /q .next

echo Installing dependencies...
call npm install

echo Starting frontend (forcing Webpack)...
call npm run dev -- --no-turbo

if %errorlevel% neq 0 pause
