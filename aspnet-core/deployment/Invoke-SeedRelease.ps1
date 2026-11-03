[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$SeederDll,
    [Parameter(Mandatory=$true)][string]$BackendReleasePath,
    [Parameter(Mandatory=$true)][string]$ConfigPath,
    [string]$ClientUrl,
    [ValidateRange(1,3600)][int]$CommandTimeoutSeconds = 120,
    [ValidateSet('Testing','Staging','Production')][string]$Environment
)
$ErrorActionPreference = 'Stop'
$environmentNames = @{ '1' = 'Testing'; '2' = 'Staging'; '3' = 'Production' }
while (-not $Environment) {
    Write-Host 'Select the target environment: 1) Testing  2) Staging  3) Production'
    $selection = Read-Host 'Enter 1, 2, or 3'
    if ($environmentNames.ContainsKey($selection)) {
        $Environment = $environmentNames[$selection]
    } else {
        Write-Host 'Invalid selection. Choose 1, 2, or 3.'
    }
}
$runner = (Resolve-Path -LiteralPath $SeederDll).Path
$release = (Resolve-Path -LiteralPath $BackendReleasePath).Path
$config = (Resolve-Path -LiteralPath $ConfigPath).Path
$offline = Join-Path $release 'app_offline.htm'
if (-not (Test-Path -LiteralPath $offline -PathType Leaf)) {
    throw 'Put the backend in maintenance with app_offline.htm and drain existing requests before seeding.'
}
$arguments = @($runner, '--config', $config, '--content-root', $release,
    '--command-timeout', "$CommandTimeoutSeconds", '--environment', $Environment)
if ($ClientUrl) { $arguments += @('--client-url', $ClientUrl) }
& dotnet @arguments --apply --maintenance-confirmed
if ($LASTEXITCODE -ne 0) {
    throw 'Seeding failed. Keep traffic offline. Investigate the failed database and rerun the same release.'
}
& dotnet @arguments --check
if ($LASTEXITCODE -ne 0) {
    throw 'Readiness verification failed. Keep traffic offline.'
}
Write-Output 'Seed verification passed. app_offline.htm was intentionally retained. Complete deployment checks before restoring traffic.'
