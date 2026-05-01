$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Port = 4788
$ExpectedVersion = "2026.04.26-f"
$BaseUrl = "http://127.0.0.1:$Port"
$DashboardUrl = "$BaseUrl/?v=20260426f"
$HealthUrl = "$BaseUrl/api/health"
$OverviewUrl = "$BaseUrl/api/overview"
$LogPath = Join-Path $Root "data/dashboard-launch.log"
$ServerOutPath = Join-Path $Root "data/dashboard-server.out.log"
$ServerErrPath = Join-Path $Root "data/dashboard-server.err.log"

function Write-LaunchLog {
  param([string]$Message)
  $line = "$(Get-Date -Format o) $Message"
  Add-Content -Path $LogPath -Value $line -Encoding UTF8
}

function Get-Health {
  try {
    $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ne 200) {
      return $null
    }
    return $response.Content | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Test-ExpectedHealth {
  $health = Get-Health
  if (-not $health) {
    return $false
  }
  return ($health.ok -eq $true -and $health.app -eq "mercury-dashboard" -and $health.version -eq $ExpectedVersion)
}

function Get-PortOwner {
  try {
    return Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
  } catch {
    return $null
  }
}

function Test-SameMercuryRoot {
  try {
    $response = Invoke-WebRequest -Uri $OverviewUrl -UseBasicParsing -TimeoutSec 2
    $overview = $response.Content | ConvertFrom-Json
    if (-not ($overview.ok -and $overview.root)) {
      return $false
    }
    return ((Resolve-Path $overview.root).Path -eq (Resolve-Path $Root).Path)
  } catch {
    return $false
  }
}

New-Item -ItemType Directory -Path (Split-Path -Parent $LogPath) -Force | Out-Null
Write-LaunchLog "launcher start root=$Root expected=$ExpectedVersion"

if (-not (Test-ExpectedHealth)) {
  $owner = Get-PortOwner
  if ($owner) {
    $health = Get-Health
    $isMercury = (($health -and $health.app -eq "mercury-dashboard") -or (Test-SameMercuryRoot))

    if ($isMercury) {
      Write-LaunchLog "stopping stale mercury process pid=$($owner.OwningProcess)"
      Stop-Process -Id $owner.OwningProcess -Force
      Start-Sleep -Milliseconds 900
    } else {
      Write-LaunchLog "port occupied by non-mercury pid=$($owner.OwningProcess)"
      Write-Host "Port $Port is already used by another process: $($owner.OwningProcess)"
      Write-Host "Mercury GUI was not started."
      exit 1
    }
  }

  Write-LaunchLog "starting dashboard server"
  $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dashboard" -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $ServerOutPath -RedirectStandardError $ServerErrPath -PassThru
  Write-LaunchLog "started dashboard command pid=$($process.Id)"

  $healthy = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-ExpectedHealth) {
      $healthy = $true
      break
    }
    if ($process.HasExited) {
      Write-LaunchLog "node exited early code=$($process.ExitCode)"
      break
    }
  }

  if (-not $healthy) {
    Write-LaunchLog "dashboard failed health check"
    Write-Host "Mercury GUI failed to start."
    Write-Host "Launch log: $LogPath"
    Write-Host "Server stdout: $ServerOutPath"
    Write-Host "Server stderr: $ServerErrPath"
    Write-Host "Run this manually to inspect the error:"
    Write-Host "cd `"$Root`""
    Write-Host "npm run dashboard"
    exit 1
  }
}

Write-LaunchLog "opening $DashboardUrl"
Start-Process $DashboardUrl
