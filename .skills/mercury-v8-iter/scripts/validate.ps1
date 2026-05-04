param(
    [switch]$Verbose
)

$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$ErrorActionPreference = "Continue"
$skillRoot = $PSScriptRoot
$projectRoot = "Z:\AI 202604\trae01\v8-mercury-backend"
$passed = 0
$failed = 0

function Test-Check {
    param($Name, $Condition, $Detail = "")
    if ($Condition) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        if ($Detail) { Write-Host "       $Detail" -ForegroundColor Yellow }
        $script:failed++
    }
}

Write-Host "=== mercury-v8-iter Skill Self-Validation ===" -ForegroundColor Cyan
Write-Host ""

# 1. SKILL.md checks
$skillMd = Join-Path $skillRoot "SKILL.md"
Test-Check "SKILL.md exists" (Test-Path $skillMd)
if (Test-Path $skillMd) {
    $content = Get-Content $skillMd -Raw
    Test-Check "Has name field" ($content -match 'name:\s*mercury-v8-iter')
    Test-Check "Has description field" ($content -match 'description:')
    Test-Check "Has allowed_tools" ($content -match 'allowed_tools:')
    Test-Check "Has trigger_eval" ($content -match 'trigger_eval:')
    Test-Check "Has should_trigger samples" ($content -match 'should_trigger:')
    Test-Check "Has should_not_trigger samples" ($content -match 'should_not_trigger:')
    Test-Check "Has forbidden-behaviors section" ($content -match '禁止行为')
    Test-Check "Has provenance declaration" ($content -match 'provenance:')
}

# 2. references/ checks
$refDir = Join-Path $skillRoot "references"
Test-Check "references/ directory exists" (Test-Path $refDir)
if (Test-Path $refDir) {
    $refFiles = Get-ChildItem $refDir -File
    Test-Check "At least 2 reference files" ($refFiles.Count -ge 2)
    Test-Check "repo-structure.md exists" ((Test-Path (Join-Path $refDir "repo-structure.md")))
    Test-Check "audit-reports-index.md exists" ((Test-Path (Join-Path $refDir "audit-reports-index.md")))
}

# 3. _meta.json checks
$meta = Join-Path $skillRoot "_meta.json"
Test-Check "_meta.json exists" (Test-Path $meta)
if (Test-Path $meta) {
    $metaContent = Get-Content $meta -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($metaContent) {
        Test-Check "_meta.json has version" ($null -ne $metaContent.version)
        Test-Check "_meta.json has provenance" ($metaContent.provenance -ne $null)
    }
}

# 4. scripts/ checks
$scriptsDir = Join-Path $skillRoot "scripts"
Test-Check "scripts/ directory exists" (Test-Path $scriptsDir)
if (Test-Path $scriptsDir) {
    $scripts = Get-ChildItem $scriptsDir -File
    Test-Check "At least 1 script" ($scripts.Count -ge 1)
}

# 5. CHANGELOG provenance check
Write-Host ""
Write-Host "--- Project Provenance ---" -ForegroundColor Cyan
$changelog = Join-Path $projectRoot "CHANGELOG.md"
if (Test-Path $changelog) {
    $cl = Get-Content $changelog -Raw
    Test-Check "CHANGELOG has provenance policy" ($cl -match 'Provenance Policy')
    Test-Check "v0.9.0 entry exists" ($cl -match '## 0\.9\.0')
    # Check that the v0.9.0 block has a Provenance line
    if ($cl -match '(?s)## 0\.9\.0.*?(?=## |\z)') {
        $block = $Matches[0]
        Test-Check "v0.9.0 has provenance line" ($block -match 'Provenance:')
    }
}

# 6. ITERATION-GUIDE checks
Write-Host ""
Write-Host "--- Iteration Guide ---" -ForegroundColor Cyan
$guide = Join-Path $projectRoot "docs\ITERATION-GUIDE-0.9.md"
if (Test-Path $guide) {
    $g = Get-Content $guide -Raw
    Test-Check "ITERATION-GUIDE-0.9 has provenance" ($g -match 'provenance:')
    Test-Check "Has P0-X methodology task" ($g -match 'P0-X')
    Test-Check "Has IC Memo appendix" ($g -match 'Opus 4\.7')
    Test-Check "Has 7 reopen-condition tracking" ($g -match '重开条件')
    Test-Check "Has Kill List" ($g -match 'KILL')
}

# 7. Git consistency
Write-Host ""
Write-Host "--- Git ---" -ForegroundColor Cyan
Push-Location $projectRoot
$recentCommit = git log -1 --oneline 2>$null
Pop-Location
if ($recentCommit) {
    Test-Check "Latest commit is v0.9 related" ($recentCommit -match 'v0\.9|ITERATION|changelog')
    Write-Host "       $recentCommit" -ForegroundColor Gray
} else {
    Write-Host "[SKIP] Cannot get git log" -ForegroundColor Yellow
}

# 8. Critical files
Write-Host ""
Write-Host "--- Critical Files ---" -ForegroundColor Cyan
$criticalFiles = @(
    "docs\ITERATION-GUIDE-0.9.md",
    "docs\METHODOLOGY-INTEGRITY.md",
    "docs\MINIMAL-WORKFLOW.md",
    "docs\v0.9-proof-of-audit.md",
    "schemas\audit-export-contract.json",
    "schemas\examples\valid-promote.yaml",
    "schemas\examples\valid-discard.yaml"
)
foreach ($f in $criticalFiles) {
    $fullPath = Join-Path $projectRoot $f
    Test-Check "$f exists" (Test-Path $fullPath)
}

# Summary
Write-Host ""
Write-Host ("=" * 50) -ForegroundColor Cyan
$total = $passed + $failed
Write-Host "Result: $passed/$total passed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
if ($failed -gt 0) {
    exit 1
} else {
    Write-Host "Skill passed self-audit." -ForegroundColor Green
    exit 0
}
