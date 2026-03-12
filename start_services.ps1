
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd second-brain && venv\Scripts\activate && uvicorn backend.main:app --reload --env-file .env --host 0.0.0.0 --port 8000" -WorkingDirectory "d:\My Second Brain--Project"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd second-brain\frontend && echo Cleaning cache... && if exist .next rmdir /s /q .next && npm run dev -- --turbo=false" -WorkingDirectory "d:\My Second Brain--Project"
