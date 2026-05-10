# Iteration Guide 2.0.0 - Portable Evidence Chain

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/V2-WORK-TRAIN.md
```

## What Changed

Mercury 2.0 finishes the evidence-chain work train:

- `v2.0.0-alpha.1` fixed the requirement weighting and work-train plan.
- `v2.0.0-alpha.2` added reproducible local cases and starter integration paths.
- `v2.0.0-alpha.3` exposed the evidence-chain helper, Lite drag attach, and A2A-compatible artifacts.
- `v2.0.0` adds the performance pass and three portable skills.

## Final 2.0 Artifacts

- `scripts/benchmark_v2_paths.mjs`
- `docs/PERFORMANCE-2.0.md`
- `08_skills/mercury-evidence-chain/SKILL.md`
- `08_skills/mercury-memory-gate/SKILL.md`
- `08_skills/mercury-case-capture/SKILL.md`
- `scripts/check_mercury_skills.mjs`

## Validation

```powershell
npm run benchmark:v2
npm run skills:check
npm run sync:skills
npm run release:gate
```

## Stop Rules

- Do not claim external standard status.
- Do not publish fake charter-user records.
- Do not turn Lite capture into approved memory.
- Do not mark any skill output as `human_reviewed: true`.
- Do not add another broad framework name when a case, benchmark, or skill can carry the work.
