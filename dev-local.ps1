# Starts the Tauri app with STATS_SERVER_URL pointed at the local python_server.
# The port is read from python_server/.env (API_PORT), defaulting to 8000.
# The variable is set only for this process and its children (yarn tauri dev).

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$envFile = Join-Path $repoRoot "python_server\.env"
$port = 8000

if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
        if ($line -match '^\s*API_PORT\s*=\s*(\d+)\s*$') {
            $port = [int]$Matches[1]
            break
        }
    }
}

$env:STATS_SERVER_URL = "http://localhost:$port"
Write-Host "STATS_SERVER_URL=$env:STATS_SERVER_URL"

Set-Location $repoRoot
yarn tauri dev
