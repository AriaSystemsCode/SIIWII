@echo off
setlocal

set "ROOT=C:\Hassan\SIIWII\aspnet-core"
set "PROJECT=%ROOT%\src\onetouch.Seeder\onetouch.Seeder.csproj"
set "OUTPUT=%ROOT%\artifacts\seeder"

if not exist "%PROJECT%" (
    echo ERROR: Seeder project not found:
    echo %PROJECT%
    pause
    exit /b 1
)

cd /d "%ROOT%"
if errorlevel 1 (
    echo ERROR: Could not open repository folder:
    echo %ROOT%
    pause
    exit /b 1
)

dotnet publish "%PROJECT%" -c Release -o "%OUTPUT%"
if errorlevel 1 (
    echo.
    echo ERROR: Seeder publish failed.
    pause
    exit /b 1
)

echo.
echo SUCCESS: Seeder published to:
echo %OUTPUT%
pause
exit /b 0