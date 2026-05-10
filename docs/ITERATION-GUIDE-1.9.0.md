# Iteration Guide 1.9.0: Proof Governance Expansion

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/PROOF-PACK-002.md
```

## Objective

Move Mercury Method Lab from a portable audit kernel toward a governed, harder-to-game audit framework.

## Added Surfaces

| Surface | Purpose |
|---|---|
| `docs/PROOF-PACK-002.md` | Six harder cases across multi-agent, stale memory, code, chart, disagreement, and gaming. |
| `docs/RULE-VERSION-GOVERNANCE.md` | Rule version records and re-audit triggers. |
| `docs/MEMORY-LIFECYCLE-GOVERNANCE.md` | Accepted memories expire, retire, or become review-due. |
| `docs/ANTI-GAMING-TESTS.md` | Concrete route-forcing and review-forging tests. |
| `docs/HUMAN-REVIEW-DISAGREEMENT.md` | Reviewer conflict as first-class evidence. |
| `src/mercury-audit/anti-gaming.mjs` | Local detector for route manipulation. |
| `src/mercury-audit/rule-versioning.mjs` | SDK helper for ruleset records and re-audit checks. |

## Validation

```powershell
npm run test:governance
npm run test
npm run cycle:check
npm run release:gate
```

## Stop List

- Do not treat Proof Pack 002 as a benchmark.
- Do not claim production security coverage.
- Do not auto-promote stale memory.
- Do not let agents set their own human review state.
- Do not silently migrate old accepted memories to new rules.
