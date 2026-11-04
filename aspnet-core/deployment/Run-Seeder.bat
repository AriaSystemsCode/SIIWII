@echo off
setlocal EnableExtensions DisableDelayedExpansion

set "SEED_DLL=C:\Deploy\onetouch-seeder\onetouch.Seeder.dll"
set "BACKEND_ROOT=C:\inetpub\wwwroot\OneTouchTest"
set "CONFIG=%BACKEND_ROOT%\appsettings.Production.json"
set "EXPECTED_SEED_VERSION=19"
set "CHECK_LOG=%TEMP%\onetouch-seed-check-%RANDOM%.log"
set "ENVIRONMENT="

if not exist "%SEED_DLL%" goto missing_files
if not exist "%CONFIG%" goto missing_files
if not exist "%BACKEND_ROOT%\Assets\" goto missing_files

where dotnet >nul 2>&1
if errorlevel 1 goto missing_files

if not exist "%BACKEND_ROOT%\app_offline.htm" goto maintenance_missing

:choose_environment
echo Select the target environment:
echo   1. Testing
echo   2. Staging
echo   3. Production
set "ENVIRONMENT_CHOICE="
set /p "ENVIRONMENT_CHOICE=Enter 1, 2, or 3: "
if "%ENVIRONMENT_CHOICE%"=="1" set "ENVIRONMENT=Testing"
if "%ENVIRONMENT_CHOICE%"=="2" set "ENVIRONMENT=Staging"
if "%ENVIRONMENT_CHOICE%"=="3" set "ENVIRONMENT=Production"
if not defined ENVIRONMENT goto choose_environment

echo This run targets every Aria.Master client row marked %ENVIRONMENT%.
echo Checking Seeder and database status...
dotnet "%SEED_DLL%" --config "%CONFIG%" --environment "%ENVIRONMENT%" --check --command-timeout 300 > "%CHECK_LOG%" 2>&1
set "CHECK_EXIT=%ERRORLEVEL%"
type "%CHECK_LOG%"

if not "%CHECK_EXIT%"=="0" if not "%CHECK_EXIT%"=="2" goto failed
findstr /R /C:"version=%EXPECTED_SEED_VERSION% " "%CHECK_LOG%" >nul
if errorlevel 1 goto wrong_version
del /q "%CHECK_LOG%" >nul 2>&1

if "%CHECK_EXIT%"=="0" goto ready

echo Applying required seed version %EXPECTED_SEED_VERSION% to %ENVIRONMENT% databases...
dotnet "%SEED_DLL%" --config "%CONFIG%" --content-root "%BACKEND_ROOT%" --environment "%ENVIRONMENT%" --apply --maintenance-confirmed --command-timeout 300
if errorlevel 1 goto failed

echo Verifying Seeder status...
dotnet "%SEED_DLL%" --config "%CONFIG%" --environment "%ENVIRONMENT%" --check --command-timeout 300 > "%CHECK_LOG%" 2>&1
set "CHECK_EXIT=%ERRORLEVEL%"
type "%CHECK_LOG%"
if not "%CHECK_EXIT%"=="0" goto failed
findstr /R /C:"version=%EXPECTED_SEED_VERSION% " "%CHECK_LOG%" >nul
if errorlevel 1 goto wrong_version
del /q "%CHECK_LOG%" >nul 2>&1

:ready
echo SUCCESS: all selected %ENVIRONMENT% databases are ready at seed version %EXPECTED_SEED_VERSION%.
echo app_offline.htm remains in place. Complete deployment checks before restoring traffic.
pause
exit /b 0

:missing_files
echo ERROR: Seeder DLL, production settings, backend Assets folder, or dotnet is missing.
goto failed

:maintenance_missing
echo ERROR: Put the backend in maintenance by placing app_offline.htm in %BACKEND_ROOT% before seeding.
goto failed

:wrong_version
echo ERROR: The published Seeder does not report required seed version %EXPECTED_SEED_VERSION%.
goto failed

:failed
if exist "%CHECK_LOG%" del /q "%CHECK_LOG%" >nul 2>&1
echo FAILED: Keep the selected environment offline and inspect the message above.
pause
exit /b 1
