
@echo off
cd second-brain
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing backend dependencies...
pip install -r backend/requirements.txt

echo Installing frontend dependencies...
cd frontend
call npm install

echo Setup complete!
cd ..
pause
