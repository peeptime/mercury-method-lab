# Demo: Run The Audit Gate

This demo shows the shortest path from a messy AI claim to a routing decision.

## What You Need

- Node.js 20+
- PowerShell

## 1. Install And Check

```powershell
npm install
npm run validate
```

Expected output:

```text
OK validated ... files
```

## 2. Rebuild The Sample Index

```powershell
npm run index
```

Expected output files:

- `11_indexes/source-index.json`
- `11_indexes/sample-index.json`

Expected terminal shape:

```text
Indexed ... records
Wrote 11_indexes/source-index.json
Wrote 11_indexes/sample-index.json
```

## 3. Export Routing Decisions

```powershell
npm run export:memory -- --include-archive --out 10_exports/demo-preaudit-bundle.json
```

Expected output file:

- `10_exports/demo-preaudit-bundle.json`

Expected terminal shape:

```json
{
  "ok": true,
  "target_backend": "markdown",
  "output": "10_exports/demo-preaudit-bundle.json"
}
```

## 4. Inspect The Bad-Memory Intercept

Open these files in order:

- `00_raw/2026-05-03-20260503t141705z-ai变现路子审计-v8-2维度迁移分析.md`
- `04_memory_candidates/2026-05-04-ai-monetization-bad-memory.md`
- `07_audit_reports/2026-05-04-bad-memory-intercept-audit.md`
- `05_decision_logs/2026-05-04-bad-memory-intercept-decision.md`
- `docs/v0.9-proof-of-audit.md`

The important line is:

```yaml
routing_decision: discard
```

## What Happened

The raw input was only a list of AI monetization paths. A plausible analysis produced a tempting conclusion about two “migratable” capabilities. The bad candidate turned that into a confident long-term memory.

Mercury Lab blocks it because the candidate has no durable source trace, no audit trace, and no review path.

## If You Get Stuck

If `npm run index` fails, run `npm run validate` first and fix the named file.

If `export:memory` says `sample-index.json` is missing, run `npm run index`.

If the bundle exports zero promoted records, that is acceptable for this demo. The goal is to prove the gate can route unsafe memory away from durable recall.
