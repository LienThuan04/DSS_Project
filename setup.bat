@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul
color 0A
cls

echo.
echo ======================================================================
echo   DSS Antigravity - SETUP & INITIALIZATION
echo ======================================================================
echo.

set scriptDir=%~dp0

REM ========================================================================
REM CHECK REQUIREMENTS
REM ========================================================================
echo [Check] Verifying requirements...
echo.

where /q node
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Install from https://nodejs.org/
    pause
    exit /b 1
)

where /q python
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Install from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
echo [OK] Python found
echo.

REM ========================================================================
REM DETECT PACKAGE MANAGER (pnpm or npm)
REM ========================================================================
set PACKAGE_MANAGER=npm

where /q pnpm
if errorlevel 0 (
    set PACKAGE_MANAGER=pnpm
    echo [OK] pnpm detected - using pnpm for faster installs
    goto skip_npm_detect
)

echo [OK] Using npm (default)

:skip_npm_detect
echo.

REM ========================================================================
REM BACKEND SETUP
REM ========================================================================
echo ======================================================================
echo [1/4] BACKEND SETUP
echo ======================================================================
echo.

cd /d "%scriptDir%backend-nestjs"

if "%PACKAGE_MANAGER%"=="pnpm" (
    echo [Backend] Installing dependencies with pnpm...
    call pnpm install
) else (
    echo [Backend] Installing dependencies with npm...
    call npm install
)

if errorlevel 1 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed
echo.

REM Create .env for backend
if not exist ".env" (
    echo [Backend] Creating .env file...
    (
        echo MONGODB_URI=mongodb://localhost:27017/DSS2
        echo ML_API_URL=http://localhost:5000
        echo PORT=3001
        echo NODE_ENV=development
    ) > ".env"
    echo [OK] Backend .env created
)

cd /d "%scriptDir%"
echo.

REM ========================================================================
REM FRONTEND SETUP
REM ========================================================================
echo ======================================================================
echo [2/4] FRONTEND SETUP
echo ======================================================================
echo.

cd /d "%scriptDir%frontend-react"

if "%PACKAGE_MANAGER%"=="pnpm" (
    echo [Frontend] Installing dependencies with pnpm...
    call pnpm install --force
) else (
    echo [Frontend] Installing dependencies with npm...
    call npm install --legacy-peer-deps
)

if errorlevel 1 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed
echo.

REM Create .env for frontend
if not exist ".env.local" (
    echo [Frontend] Creating .env.local file...
    (
        echo REACT_APP_API_URL=http://localhost:3001/api
    ) > ".env.local"
    echo [OK] Frontend .env.local created
)

cd /d "%scriptDir%"
echo.

REM ========================================================================
REM ML PYTHON SETUP & MODEL TRAINING
REM ========================================================================
echo ======================================================================
echo [3/4] ML PYTHON SETUP ^& MODEL TRAINING
echo ======================================================================
echo.

cd /d "%scriptDir%ml-python"

REM Create Python virtual environment if not exists
if not exist "venv" (
    echo [ML] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)

REM Activate venv and install requirements
echo [ML] Installing Python dependencies...
call venv\Scripts\activate.bat

pip install -q -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Python dependencies installation failed!
    call venv\Scripts\deactivate.bat
    pause
    exit /b 1
)

echo [OK] Python dependencies installed
echo.

REM Data preprocessing
echo [ML] Running data preprocessing...
python data_preprocessing.py

if errorlevel 1 (
    echo [ERROR] Data preprocessing failed!
    call venv\Scripts\deactivate.bat
    pause
    exit /b 1
)

echo [OK] Data preprocessing completed
echo.

REM Train model
echo [ML] Training machine learning model...
echo This may take a few minutes...
echo.

python train_model.py

if errorlevel 1 (
    echo [ERROR] Model training failed!
    call venv\Scripts\deactivate.bat
    pause
    exit /b 1
)

echo [OK] Model training completed
echo.

REM Deactivate virtual environment
call venv\Scripts\deactivate.bat

cd /d "%scriptDir%"
echo.

REM ========================================================================
REM COMPLETION
REM ========================================================================
echo ======================================================================
echo [4/4] SETUP COMPLETE
echo ======================================================================
echo.
echo [OK] All dependencies installed successfully!
echo [OK] ML model trained successfully!
echo.
echo Starting full stack application in 3 seconds...
echo.

timeout /t 3 /nobreak

REM ========================================================================
REM RUN START-ALL.BAT
REM ========================================================================
echo.
call start-all.bat
