# Iteration Guide 1.4.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/CYCLE-04-BLUEPRINT.md
```

Version `1.4.0` is the Method Taxonomy and Routing Blueprint release.

## Objective

Move Mercury Method Lab from "tool with audit scripts" toward "reference method with runnable evidence":

- organize failure modes into a usable taxonomy
- explain the four routing decisions as a decision model
- show Proof Pack 001 coverage and gaps
- relate Mercury to existing verification, provenance, data quality, and risk work
- give implementers a blueprint they can adapt without copying the repo structure

## Primary Files

```text
docs/CYCLE-04-BLUEPRINT.md
docs/FAILURE-MODES.md
docs/ROUTING-THEORY.md
docs/PROOF-PACK-COVERAGE-MATRIX.md
docs/RELATED-WORK.md
docs/AGENT-AUDIT-BLUEPRINT.md
```

## What Did Not Change

- No new dashboard feature.
- No new backend adapter.
- No AI scoring or success metric.
- No claim that Mercury is a certification authority.
- No `human_reviewed: true` without named human review.

## Useful Commands

```powershell
npm run cycle:status
npm run cycle:check
npm run validate:incr
npm run audit
npm run report
npm run release:gate
```

## Next Useful Work

Use `docs/PROOF-PACK-COVERAGE-MATRIX.md` to add cases 011-020. Prefer gaps over volume:

- multi-agent contamination
- stale-but-reused memory
- test-passing-but-wrong code
- chart-overclaim
- human review disagreement

Do not add official failure modes until at least one proof case or boundary case justifies the name.
