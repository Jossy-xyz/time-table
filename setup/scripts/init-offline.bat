@echo off
setlocal enabledelayedexpansion
title Bells University - Smart Initializer
set "GRADLE_ZIP=gradle-8.14.4-all.zip"
set "GRADLE_URL=https://services.gradle.org/distributions/!GRADLE_ZIP!"

echo ============================================================
echo      BELLS UNIVERSITY TIMETABLE - SMART INITIALIZER
echo ============================================================
echo.

:: 1. Setup C:\Gradle for the distribution
echo [STEP 1] Checking local Gradle distribution storage...
if not exist "C:\Gradle" (
    mkdir "C:\Gradle"
    echo Created directory C:\Gradle
)

:: 2. Check for the zip
echo [STEP 2] Verifying Gradle distribution (!GRADLE_ZIP!)...
set "foundZip="
if exist "..\gradle-dist\!GRADLE_ZIP!" (
    set "foundZip=..\gradle-dist\!GRADLE_ZIP!"
) else (
    for %%F in ("..\gradle-dist\*.zip") do set "foundZip=%%F"
)

if defined foundZip (
    echo Found distribution: !foundZip!
    copy "!foundZip!" "C:\Gradle\" /Y
) else (
    echo WARNING: !GRADLE_ZIP! not found in setup\gradle-dist.
    set /p "choice=Would you like to try downloading it now? (Y/N): "
    if /i "!choice!"=="Y" (
        echo Downloading !GRADLE_ZIP! to C:\Gradle...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '!GRADLE_URL!' -OutFile 'C:\Gradle\!GRADLE_ZIP!'"
        if !ERRORLEVEL! EQU 0 (
            echo Download successful!
        ) else (
            echo ERROR: Download failed. Please download manually and place in C:\Gradle\
        )
    ) else (
        echo Please ensure !GRADLE_ZIP! is in C:\Gradle\ before running the backend.
    )
)

:: 3. Handle Cache Restoration
echo.
echo [STEP 3] Checking for library cache (gradle-cache.zip)...
if exist "..\gradle-cache.zip" (
    echo Found gradle-cache.zip! Extracting to %USERPROFILE%\.gradle...
    if not exist "%USERPROFILE%\.gradle" mkdir "%USERPROFILE%\.gradle"
    powershell -Command "Expand-Archive -Path '..\gradle-cache.zip' -DestinationPath '%USERPROFILE%\.gradle' -Force"
    if !ERRORLEVEL! EQU 0 (
        echo Cache restored successfully!
    ) else (
        echo ERROR: Failed to extract cache.
    )
) else (
    echo Note: gradle-cache.zip not found. 
    echo TIP: If this is your first time setting up on a new machine without a cache zip,
    echo      the backend will need an internet connection for the first run.
)

:: 4. Frontend Node Modules Check
echo.
echo [STEP 4] Checking Frontend dependencies (node_modules)...
if not exist "..\..\Timetable-generator\node_modules" (
    echo WARNING: node_modules folder is missing in Timetable-generator.
    set /p "nchoice=Would you like to run 'npm install' now? (Y/N): "
    if /i "!nchoice!"=="Y" (
        echo Running npm install...
        cd /d "..\..\Timetable-generator" && npm install
        cd /d "%~dp0"
    )
) else (
    echo Frontend dependencies are already present.
)

echo.
echo ============================================================
echo INITIALIZATION COMPLETE
echo ============================================================
echo NEXT STEPS:
echo 1. Ensure Java (JDK 25) is installed on this machine.
echo 2. Open terminal in 'Backend\untitled2'.
echo 3. Run: .\gradlew.bat bootRun --offline
echo ============================================================
pause
