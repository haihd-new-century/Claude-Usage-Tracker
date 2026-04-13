@echo off
title Claude Usage Tracker - Startup
cd /d "%~dp0"

:: ============================================
:: Claude Usage Tracker - Windows Startup Script
:: ============================================

echo.
echo  Claude Usage Tracker v3.0.3
echo  ===========================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from https://nodejs.org/
    pause
    exit /b 1
)

:: Check pnpm
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] pnpm not found. Installing...
    npm install -g pnpm@10
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install pnpm.
        pause
        exit /b 1
    )
)

:: Check Rust
where rustc >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Rust is not installed or not in PATH.
    echo         Install from https://rustup.rs/
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    pnpm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
)

:: Parse arguments
set "MODE=dev"
if /i "%~1"=="build"   set "MODE=build"
if /i "%~1"=="test"    set "MODE=test"
if /i "%~1"=="check"   set "MODE=check"
if /i "%~1"=="run"     set "MODE=run"

:: Workaround: avoid Windows Defender file locking on Rust target
if not defined CARGO_TARGET_DIR (
    set "CARGO_TARGET_DIR=C:\tmp\cargo-target"
)

if "%MODE%"=="dev" (
    echo [START] Development mode (tauri dev)...
    echo         Press Ctrl+C to stop.
    echo.
    pnpm tauri:dev
)

if "%MODE%"=="build" (
    echo [BUILD] Building release installer...
    echo.
    pnpm tauri:build
    if %errorlevel% equ 0 (
        echo.
        echo [DONE] Build complete. Installers at:
        echo        src-tauri\target\release\bundle\msi\
        echo        src-tauri\target\release\bundle\nsis\
    ) else (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
)

if "%MODE%"=="test" (
    echo [TEST] Running TypeScript check + unit tests...
    echo.
    call npx tsc --noEmit
    if %errorlevel% neq 0 (
        echo [ERROR] TypeScript check failed.
        pause
        exit /b 1
    )
    echo [PASS] TypeScript check OK
    echo.
    call npx vitest run
    if %errorlevel% neq 0 (
        echo [ERROR] Tests failed.
        pause
        exit /b 1
    )
    echo.
    echo [DONE] All tests passed.
)

if "%MODE%"=="check" (
    echo [CHECK] Running TypeScript type check...
    echo.
    npx tsc --noEmit
    if %errorlevel% equ 0 (
        echo [PASS] No type errors found.
    ) else (
        echo [FAIL] Type errors detected.
        pause
        exit /b 1
    )
)

if "%MODE%"=="run" (
    echo [RUN] Launching built app...
    set "EXE_PATH=src-tauri\target\release\Claude Usage Tracker.exe"
    if exist "%EXE_PATH%" (
        start "" "%EXE_PATH%"
    ) else (
        echo [ERROR] Built executable not found. Run "start.bat build" first.
        pause
        exit /b 1
    )
)

echo.
