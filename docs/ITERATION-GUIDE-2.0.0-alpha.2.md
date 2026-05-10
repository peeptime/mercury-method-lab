# Iteration Guide 2.0.0-alpha.2

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/REAL-CASES-SUMMARY.md
```

## Purpose

`2.0.0-alpha.2` moves Mercury from preflight planning into reproducible evidence:

- structured local cases under `cases/2026-05/`
- case generator and checker scripts
- OpenClaw-compatible memory-write hook demo
- Starter Kit for the smallest useful SDK path

These cases are not external charter-user records and not human-approved benchmark claims. They are reproducible repository cases that make routing behavior inspectable.

## Run

```powershell
npm run cases:build
npm run cases:check
npm run demo:openclaw
npm run demo:starter
```

## Next Tranche

Use `2.0.0-alpha.3` for:

- evidence-chain SDK helpers
- missing-evidence A/B/C choices
- drag attach in Lite/dashboard surfaces
- A2A-compatible AgentCard and message/task/artifact fixture

## Verification

```powershell
npm run release:gate
```

