@echo off
setlocal
echo ========================================================
echo   SwissNat SL - Android APK Builder
echo ========================================================
echo.

echo [1/3] Building Web Production Assets (Vite)...
call npm.cmd run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Web build failed. Please fix build errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Syncing assets with Capacitor Android...
call npx.cmd cap sync android
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compiling Android APK with Gradle...
cd /d "%~dp0android"
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================================
    echo [NOTE] Gradle build requires Android SDK.
    echo If you have Android Studio installed, you can simply run:
    echo     npm run open:android
    echo And click "Build > Build Bundle(s) / APK(s) > Build APK(s)".
    echo ========================================================
    cd /d "%~dp0"
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   SUCCESS! Debug APK Generated:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================================
cd /d "%~dp0"
pause
