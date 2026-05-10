# Iteration Guide 1.8.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/SCENARIO-PACKS.md
```

## Version

`1.8.0` - Open Scenario Packs

## Objective

Solve the migration problem after v1.7: a portable kernel still needs scenario defaults so teams do not apply the same evidence standard to AI coding, personal memory, investment research, enterprise delivery, and high-risk professional contexts.

## Primary Changes

- `src/mercury-audit/scenarios.mjs` adds five built-in scenario packs.
- `src/mercury-audit/review-ux.mjs` adds scenario-aware review guidance.
- `audit()` accepts `scenario` and automatically applies scenario profile/standard defaults.
- `examples/audit-scenarios/` stores reusable scenario pack examples.
- `schemas/audit-scenario.schema.json` documents the scenario contract.
- `docs/SCENARIO-PACKS.md`, `docs/ADAPTER-CONTRACT.md`, and `docs/REVIEW-UX-GUIDE.md` document migration paths for teams.

## What Did Not Change

- No production adapter.
- No new dashboard surface.
- No new official failure modes.
- No fabricated Proof Pack coverage.

## Validation

Use:

```powershell
npm run test:sdk
npm run cycle:check
npm run release:gate
```

## Next Version Prep

v1.9 should focus on proof and governance: more realistic cases, rule versions, migration/re-audit, and anti-gaming tests.
