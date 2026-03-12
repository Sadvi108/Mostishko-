
@echo off
cd /d "%~dp0"
start "Backend" run_backend.bat
start "Frontend" run_frontend_prod.bat
echo Servers starting (Frontend in PROD mode)...
pause
