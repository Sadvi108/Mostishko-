
@echo off
cd /d "%~dp0"
cd second-brain\frontend

echo Starting frontend (fast)...
call npm run dev > ..\..\frontend_error.log 2>&1

if %errorlevel% neq 0 pause
