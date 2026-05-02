$ErrorActionPreference = "Stop"

if (-not $env:ARK_API_KEY) {
  Write-Error "Missing ARK_API_KEY"
}

$model = if ($env:ARK_MODEL) { $env:ARK_MODEL } else { "doubao-seed-2.0-code" }

$env:DEFAULT_PROVIDER = "openai"
$env:OPENAI_API_KEY = $env:ARK_API_KEY
$env:OPENAI_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3"
$env:OPENAI_MODEL = $model
$env:OPENAI_ENABLED = "true"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$workspaceRoot = Split-Path -Parent $root
$configPath = Join-Path $root "config\upstream-mercury-agent.json"
$runtimeConfig = Get-Content -Raw $configPath | ConvertFrom-Json
$npmCache = Join-Path $workspaceRoot ".npm-cache"
$packageSpec = "$($runtimeConfig.runtime.package)@$($runtimeConfig.runtime.pinned_version)"

npx.cmd --yes --cache $npmCache $packageSpec start --foreground
