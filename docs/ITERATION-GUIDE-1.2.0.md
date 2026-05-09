# Iteration Guide 1.2.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: user request 2026-05-09 layered update
```

## Theme

Layered Audit Delivery.

This version turns the 1.1.0 minimum loop into a fuller audit layer: input validation, richer rule output, flow simulation, report delivery, test coverage, and performance profiling.

## Added Layers

- Schema layer: `scripts/audit-core/audit_schema.mjs`.
- Reference layer: Git-backed known-path lookup for local `source_refs`.
- Result layer: severity summaries, required evidence, suggested revisions, decision reasons, review paths, and routing targets.
- Flow layer: `npm run audit:flow` writes generated memory-flow folders.
- Performance layer: `npm run audit:profile` reports timing across repeated audit runs.

## Boundaries

- Still no model call.
- Still no database.
- Still no dashboard server changes.
- Still no frontend framework.
- HTML remains generated delivery output, not source of truth.

## Validation

```powershell
npm run audit
npm run audit:flow
npm run report
npm run test
npm run audit:profile
npm run release:gate
```
