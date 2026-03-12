
@echo off
cd /d "%~dp0"

echo Starting Backend...
start "Backend" cmd /k "cd second-brain && venv\Scripts\activate && uvicorn backend.main:app --reload --env-file .env --host 0.0.0.0 --port 8000"

echo Starting Frontend (Production Mode)...
cd second-brain\frontend
start "Frontend" cmd /k "npm start"

echo Services launched!
pause
