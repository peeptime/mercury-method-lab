# Iteration Guide 1.7.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/AUDIT-KERNEL.md
```

## Version

`1.7.0` - Audit Kernel Independence

## Objective

Solve the first migration problem: Mercury must stop looking like a personal method repository with a thin SDK wrapper.

This release moves audit judgment into a portable kernel:

- audit profiles
- audit standards
- source credibility
- memory lifecycle
- reviewer disagreement
- explicit relation to Mercury Agent and neighboring audit/eval tools

## Primary Changes

- `src/mercury-audit/kernel.mjs` orchestrates the portable audit kernel.
- `profiles.mjs`, `standards.mjs`, `source-credibility.mjs`, `lifecycle.mjs`, and `disagreement.mjs` make previously implicit judgment configurable.
- SDK API version moves to `0.2.0`.
- `docs/AUDIT-KERNEL.md` explains the migration from wrapper to kernel.
- `docs/ECOSYSTEM-POSITION.md` maps Mercury beside Langfuse, Promptfoo, Garak, Phoenix, TruLens, Ragas, DeepEval, Giskard, Helicone, and agent security checklists.
- `docs/MERCURY-AGENT-RELATIONSHIP.md` states that Mercury Method Lab is independent, not a fork, plugin, or official Mercury Agent extension.
- `schemas/audit-profile.schema.json`, `schemas/audit-standard.schema.json`, and `schemas/source-credibility.schema.json` document portable configuration contracts.
- `examples/audit-profiles/` and `examples/audit-standards/` provide initial reusable configs.

## What Did Not Change

- No production adapter.
- No public npm publish.
- No new Proof Pack expansion.
- No claim of certification authority.
- No fake human review or external traction.

## Validation

Use:

```powershell
npm run test:sdk
npm run demo:memory-hook
npm run benchmark:audit
npm run cycle:check
npm run release:gate
```

## Next Version Prep

v1.8 should build on this kernel by adding scenario packs and review UX per scene. Do not expand the kernel again unless a scenario pack proves a missing field.
