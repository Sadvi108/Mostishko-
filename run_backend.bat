
@echo off
cd /d "%~dp0"
cd second-brain
call venv\Scripts\activate
uvicorn backend.main:app --reload --env-file .env --host 0.0.0.0 --port 8000
if %errorlevel% neq 0 pause
