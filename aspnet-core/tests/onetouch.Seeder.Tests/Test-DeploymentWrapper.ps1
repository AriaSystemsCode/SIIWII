$ErrorActionPreference = 'Stop'
$wrapper = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../deployment/Invoke-SeedRelease.ps1'))
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('onetouch-seed-test-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $fixture
$runner = Join-Path $fixture 'fake.dll'
$config = Join-Path $fixture 'fake.json'
$marker = Join-Path $fixture 'app_offline.htm'
[IO.File]::WriteAllText($runner, '')
[IO.File]::WriteAllText($config, '{}')
$global:onetouchSeederWrapperTestState = @{ Attempts = 0; Outcomes = @(0, 0) }
# Shadow dotnet: these tests never launch a runtime or open a database.
function dotnet {
    $global:LASTEXITCODE = $global:onetouchSeederWrapperTestState.Outcomes[$global:onetouchSeederWrapperTestState.Attempts]
    $global:onetouchSeederWrapperTestState.Attempts++
}
function Invoke-Fixture {
    & $wrapper -SeederDll $runner -BackendReleasePath $fixture -ConfigPath $config
}
function Assert-True($condition, $message) {
    if (-not $condition) { throw "FAIL: $message" }
    Write-Output "PASS: $message"
}
try {
    $rejected = $false
    try { Invoke-Fixture } catch { $rejected = $true }
    Assert-True ($rejected -and $global:onetouchSeederWrapperTestState.Attempts -eq 0) 'no maintenance marker prevents execution'
    [IO.File]::WriteAllText($marker, 'maintenance')

    Invoke-Fixture
    Assert-True ($global:onetouchSeederWrapperTestState.Attempts -eq 2) 'success runs apply then check'
    Assert-True (Test-Path -LiteralPath $marker) 'success retains maintenance marker'

    $global:onetouchSeederWrapperTestState.Attempts = 0
    $global:onetouchSeederWrapperTestState.Outcomes = @(1)
    $rejected = $false
    try { Invoke-Fixture } catch { $rejected = $true }
    Assert-True ($rejected -and $global:onetouchSeederWrapperTestState.Attempts -eq 1) 'failed apply stops before readiness check'
    Assert-True (Test-Path -LiteralPath $marker) 'apply failure retains maintenance marker'

    $global:onetouchSeederWrapperTestState.Attempts = 0
    $global:onetouchSeederWrapperTestState.Outcomes = @(0, 2)
    $rejected = $false
    try { Invoke-Fixture } catch { $rejected = $true }
    Assert-True ($rejected -and $global:onetouchSeederWrapperTestState.Attempts -eq 2) 'failed readiness check fails deployment'
    Assert-True (Test-Path -LiteralPath $marker) 'readiness failure retains maintenance marker'
}
finally {
    # Delete only the exact files created by this test, never recursively.
    foreach ($file in @($runner, $config, $marker)) {
        if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file }
    }
    Remove-Item -LiteralPath $fixture
    Remove-Variable -Name onetouchSeederWrapperTestState -Scope Global
}
