@echo off
setlocal
title Bells University - Cache Saver

echo ============================================================
echo      BELLS UNIVERSITY TIMETABLE - CACHE SAVER
echo ============================================================
echo.

echo [STEP 1] Detecting .gradle folder...
if not exist "%USERPROFILE%\.gradle" (
    echo ERROR: Could not find .gradle folder in %USERPROFILE%
    pause
    exit /b
)

echo [STEP 2] Creating portable cache ZIP...
echo This may take a few minutes (Compressing %USERPROFILE%\.gradle\caches and wrapper)...

%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -Command "Compress-Archive -Path '%USERPROFILE%\.gradle\caches', '%USERPROFILE%\.gradle\wrapper' -DestinationPath '..\gradle-cache.zip' -Force"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo SUCCESS: gradle-cache.zip created in the setup folder!
    echo ============================================================
) else (
    echo.
    echo FAILED: Compression encountered an error. 
    echo Please manually zip '%USERPROFILE%\.gradle\caches' and 'wrapper'.
)

pause
