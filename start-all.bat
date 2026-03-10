@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul
color 0A
cls

echo.
echo ======================================================================
echo   DSS Antigravity - Full Stack Run
echo ======================================================================
echo.

set scriptDir=%~dp0

REM Check if Node.js is installed
where /q node
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Install from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where /q python
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Install from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Node.js and Python found
echo.

REM Create .env file for backend if not exists
if not exist "%scriptDir%backend-nestjs\.env" (
    echo [Setup] Creating .env file...
    (
        echo MONGODB_URI=mongodb://localhost:27017/DSS2
        echo ML_API_URL=http://localhost:5000
        echo PORT=3001
        echo NODE_ENV=development
    ) > "%scriptDir%backend-nestjs\.env"
)

echo.
echo Starting all services...
echo.

REM Start Backend
echo [1/3] Backend (NestJS) on port 3001...
start "DSS Backend" cmd /k "cd /d %scriptDir%backend-nestjs && set PORT=3001 && npm run start:dev"

timeout /t 3 /nobreak

REM Start Frontend
echo [2/3] Frontend (React) on port 3000...
start "DSS Frontend" cmd /k "cd /d %scriptDir%frontend-react && npm start"

timeout /t 3 /nobreak

REM Start ML API
echo [3/3] ML API (Python) on port 5000...
cd /d "%scriptDir%ml-python"
if not exist "venv" (
    echo [Setup] Creating Python virtual environment...
    python -m venv venv
)

start "DSS ML API" cmd /k "cd /d %scriptDir%ml-python && venv\Scripts\activate.bat && python predict_api.py"

REM Show summary
timeout /t 2 /nobreak
cls

echo.
echo ======================================================================
echo   All Services Started
echo ======================================================================
echo.
echo ENDPOINTS:
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo   ML API:   http://localhost:5000
echo.
echo DATABASE:
echo   MongoDB: mongodb://localhost:27017/DSS2
echo.
echo NEXT STEPS:
echo   1. Wait for all services to start (30-60 seconds)
echo   2. Open http://localhost:3000 in your browser
echo.

