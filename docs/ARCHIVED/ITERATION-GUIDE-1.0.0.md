# Iteration Guide 1.0.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/ITERATION-HANDOFF-1.0.0.md
```

Mercury Method Lab `1.0.0` is a feature-freeze release for the six-month cooling period.

## Purpose

- Keep the audit gate runnable.
- Preserve the bad-memory intercept proof.
- Reduce future agent context cost.
- Provide a short reactivation path for 2026-10 to 2026-12.

## Start Here

- Current state: `MEMORY.md`
- Low-context guide: `docs/ITERATION-GUIDE-LATEST.md`
- Reactivation checklist: `docs/CHECKLIST-REACTIVATION.md`
- Context budget: `docs/AGENT-CONTEXT-BUDGET.md`
- Release gate: `npm run release:gate`

## Freeze Boundary

`1.0.x` accepts only critical bug fixes, documentation corrections, validation repairs, install repairs, and release-gate repairs.

Defer new backends, new routing behavior, RAG, AI scoring, plugin systems, and broad UI features to later minor versions.
