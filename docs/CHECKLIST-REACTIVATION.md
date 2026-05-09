# Reactivation Checklist

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/ITERATION-HANDOFF-1.0.0.md
```

Use this when Mercury Method Lab is reactivated after the 1.0.x freeze period.

## First Five Minutes

1. Read `MEMORY.md`.
2. Read `docs/ITERATION-GUIDE-LATEST.md`.
3. Read this checklist.
4. Run `npm run validate:incr`.
5. Run `npm run index:incr`.
6. Run `npm run doctor`.
7. For proof-pack work, read `docs/PROOF-PACK-001.md`.
8. Run `npm run release:gate` before committing or releasing.

Do not start by reading the full changelog or old iteration guides.

## Freeze Rules

- `1.0.x` accepts only critical fixes, documentation corrections, validation fixes, and install/release gate repairs.
- Defer new routing behavior, new backend adapters, RAG, AI scoring, and plugin systems to `1.1.0+`.
- Preserve the bad-memory intercept proof with `routing_decision: discard`.
- Do not invent `source_refs`, `audit_refs`, provenance, or human review evidence.

## Files To Inspect First

| Purpose | File |
|---|---|
| Current state | `MEMORY.md` |
| Current iteration target | `docs/ITERATION-GUIDE-LATEST.md` |
| Agent context budget | `docs/AGENT-CONTEXT-BUDGET.md` |
| Proof Pack cases | `docs/PROOF-PACK-001.md` |
| Release gate | `scripts/release_gate.ps1` |
| Minimal workflow | `docs/MINIMAL-WORKFLOW.md` |
| Audit contract | `docs/AUDIT-CONTRACT.md` |

## Release Gate

```powershell
npm run validate:incr
npm run index:incr
npm run release:gate
```

Expected shape:

```text
sync:check OK
validate OK
doctor OK
index OK
export:memory OK
release gate cleans generated bundle
```

If `export:memory` reports `discard: 1`, that is expected for the proof chain.

## Before Any Post-Freeze Release

- Confirm `package.json` and `config/project-meta.json` versions match.
- Confirm `README.md` and `README.en.md` show the same version.
- Add a changelog entry with provenance.
- Run `npm run validate:incr`.
- Run `npm run index:incr`.
- Run `npm run release:gate`.
- Keep generated bundles out of the commit unless explicitly required.

## Blocker Template

```markdown
## [BLOCKER] Reactivation issue

### Step

### Expected

### Actual

### Error output

### Tried

### Needed
```
