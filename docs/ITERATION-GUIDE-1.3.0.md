# Iteration Guide 1.3.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/PRODUCT-SURFACE-PRESSURE-TEST.md
```

Version `1.3.0` is the Product Surface Pressure Test.

## Objective

Make Mercury Lab usable before the user reads the README:

- first-run onboarding
- 7-category settings panel
- icons and clearer button microcopy
- recoverable error UI
- in-app and system notification path
- Lite Mode single-file audit entry
- dashboard product checks in CI/release gate

## What Did Not Change

- Mercury is still not a general Agent framework.
- Lite Mode still defaults to `human_reviewed: declined`.
- Product preferences are not project memory.
- Cycle 02 proof/failure/review checks still run.

## Validation

```powershell
npm run dashboard:check
npm run cycle:check
npm run audit
npm run report
npm run test
npm run release:gate
```
