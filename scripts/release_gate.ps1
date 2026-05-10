param(
  [switch]$Full,
  [switch]$DryRun,
  [switch]$CleanKnownGenerated
)

$ErrorActionPreference = "Stop"

function Find-RepoRoot {
  $current = (Get-Location).Path
  while ($true) {
    if (Test-Path -LiteralPath (Join-Path $current "package.json")) {
      return $current
    }
    $parent = Split-Path -Parent $current
    if ($parent -eq $current -or [string]::IsNullOrWhiteSpace($parent)) {
      throw "No package.json found in current directory or parents."
    }
    $current = $parent
  }
}

function Has-Script($scripts, [string]$name) {
  return $null -ne $scripts.PSObject.Properties[$name]
}

function Invoke-NpmScript($name, [string[]]$extraArgs = @()) {
  if ($DryRun) {
    $suffix = if ($extraArgs.Count) { " -- $($extraArgs -join ' ')" } else { "" }
    Write-Host "[dry-run] npm run $name$suffix"
    return
  }

  Write-Host "==> npm run $name $($extraArgs -join ' ')".Trim()
  if ($extraArgs.Count) {
    & npm run $name -- @extraArgs
  } else {
    & npm run $name
  }
  if ($LASTEXITCODE -ne 0) {
    throw "npm script failed: $name"
  }
}

$root = Find-RepoRoot
Set-Location -LiteralPath $root

$package = Get-Content -LiteralPath "package.json" -Encoding UTF8 -Raw | ConvertFrom-Json
$scripts = $package.scripts
if (-not $scripts) {
  throw "package.json has no scripts object."
}

Write-Host "Release gate root: $root"
Write-Host "Package: $($package.name)@$($package.version)"

$cheapOrder = @(
  "guide:latest",
  "sync:check",
  "cycle:status",
  "cycle:check",
  "dashboard:check",
  "validate:incr",
  "index:incr",
  "audit",
  "report",
  "audit:flow",
  "test",
  "validate",
  "doctor",
  "lint",
  "typecheck",
  "check",
  "build",
  "index"
)

$seen = @{}
foreach ($script in $cheapOrder) {
  if ((Has-Script $scripts $script) -and -not $seen.ContainsKey($script)) {
    Invoke-NpmScript $script
    $seen[$script] = $true
  }
}

if (Has-Script $scripts "export:memory") {
  Invoke-NpmScript "export:memory" @("--include-archive")
}

if ($Full) {
  foreach ($script in @("test", "test:unit", "test:integration", "e2e")) {
    if ((Has-Script $scripts $script) -and -not $seen.ContainsKey($script)) {
      Invoke-NpmScript $script
      $seen[$script] = $true
    }
  }
}

if ($CleanKnownGenerated) {
  $knownOutputs = @(
    "10_exports/memory-preaudit-bundle.json",
    "dist",
    "coverage"
  )
  foreach ($output in $knownOutputs) {
    $path = Join-Path $root $output
    if (Test-Path -LiteralPath $path) {
      Write-Host "Cleaning generated output: $output"
      Remove-Item -LiteralPath $path -Recurse -Force
    }
  }
}

Write-Host "Release gate completed."
