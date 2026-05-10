# Iteration Guide 2.0.0-alpha.1

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/V2-PREFLIGHT-REQUIREMENTS.md
```

## Purpose

`2.0.0-alpha.1` is the evidence-chain preflight release.

It does not claim the 2.0 capability set is complete. It fixes the operating contract for the larger 2.0 train:

- current project-owner requirements control the 2.0 work
- `docs/ITERATION-STRATEGY-V2.md` is lower-weight historical diagnosis, not a hard-freeze policy
- releases are allowed when they carry real capability, evidence, or user-facing value
- the next tranche must move from planning into structured cases and runnable external-call demos

## Read First

1. `MEMORY.md`
2. `docs/V2-PREFLIGHT-REQUIREMENTS.md`
3. `docs/V2-WORK-TRAIN.md`
4. `docs/ITERATION-STRATEGY-V2.md` only for gap diagnosis

## Next Tranche

Use `2.0.0-alpha.2` for:

- `docs/REAL-CASES-SUMMARY.md`
- `cases/YYYY-MM/<case-id>/input.md`
- `cases/YYYY-MM/<case-id>/audit-result.json`
- `cases/YYYY-MM/<case-id>/review-status.yaml`
- `examples/integration-demo/openclaw-hook.mjs`
- `examples/starter-kit/`

## Verification

```powershell
npm run validate:incr
npm run cycle:status
npm run cycle:check
npm run release:gate
```

