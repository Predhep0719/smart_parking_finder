@echo off
echo ========================================================
echo  Smart College Parking Space Finder - Windows Setup
echo ========================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from python.org and check "Add Python to PATH".
    pause
    exit /b 1
)

:: Check if Parking Data.csv exists
if not exist "Parking Data.csv" (
    echo [WARNING] Parking Data.csv was not found in the current folder!
    echo Looking in parent folder...
    if exist "..\Parking Data.csv" (
        copy "..\Parking Data.csv" "Parking Data.csv"
        echo Copied Parking Data.csv successfully.
    ) else (
        echo [ERROR] Please copy 'Parking Data.csv' into this folder before running.
        pause
        exit /b 1
    )
)

echo [1/3] Creating Python Virtual Environment (venv)...
python -m venv venv
call venv\Scripts\activate.bat

echo [2/3] Installing Required Dependencies from requirements.txt...
pip install --upgrade pip
pip install -r requirements.txt

echo [3/3] Launching Flask Application on http://localhost:5000 ...
echo Press Ctrl+C in this terminal to stop the server.
echo.
python app.py

pause
