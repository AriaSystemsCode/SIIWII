@echo off
setlocal

set "HOST_PROJECT_DIR=%~dp0"
for %%I in ("%HOST_PROJECT_DIR%..\..") do set "ASPNET_CORE_DIR=%%~fI"
set "ARTIFACTS_DIR=%ASPNET_CORE_DIR%\artifacts"
for %%I in ("%ARTIFACTS_DIR%\host") do set "HOST_OUTPUT_DIR=%%~fI"

if /I not "%HOST_OUTPUT_DIR%"=="%ASPNET_CORE_DIR%\artifacts\host" (
    echo ERROR: Refusing to clean an unexpected Host publish folder: %HOST_OUTPUT_DIR%
    exit /b 1
)

echo Publishing Host, Migrator, and Seeder from the same source revision...

dotnet publish "%HOST_PROJECT_DIR%onetouch.Web.Host.csproj" -c Release -o "%ARTIFACTS_DIR%\host"
if errorlevel 1 goto :failed

echo Removing Host config and generated attachment folders from the published output...
for %%F in (web.config app.config appsettings.json appsettings.Production.json appsettings.Staging.json) do (
    if exist "%HOST_OUTPUT_DIR%\%%F" del /q "%HOST_OUTPUT_DIR%\%%F"
    if errorlevel 1 goto :failed
)

for %%D in (attachments tempattachments) do (
    if exist "%HOST_OUTPUT_DIR%\wwwroot\%%D\" rmdir /s /q "%HOST_OUTPUT_DIR%\wwwroot\%%D"
    if errorlevel 1 goto :failed
)

echo Host publish cleanup completed.

dotnet publish "%ASPNET_CORE_DIR%\src\onetouch.Migrator\onetouch.Migrator.csproj" -c Release -o "%ARTIFACTS_DIR%\migrator"
if errorlevel 1 goto :failed

dotnet publish "%ASPNET_CORE_DIR%\src\onetouch.Seeder\onetouch.Seeder.csproj" -c Release -o "%ARTIFACTS_DIR%\seeder"
if errorlevel 1 goto :failed

echo.
echo Release publish completed successfully:
echo Host:     %ARTIFACTS_DIR%\host
echo Migrator: %ARTIFACTS_DIR%\migrator
echo Seeder:   %ARTIFACTS_DIR%\seeder
exit /b 0

:failed
echo.
echo ERROR: Publish failed. See the output above.
exit /b 1
