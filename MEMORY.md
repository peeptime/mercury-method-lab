# Mercury Lab Working Memory

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  audited_by: Mercury Lab self-audit
  audit_ref: docs/AGENT-CONTEXT-BUDGET.md
```

This file is the short cross-session handoff. Keep it under 120 lines. Do not paste raw reports here.

## Current Snapshot

- Current public version: `1.2.1`
- Current posture: Cycle 02 commitment patch
- Core proof: `docs/v0.9-proof-of-audit.md`
- Current proof pack: `docs/PROOF-PACK-001.md`
- Current runnable audit loop: `npm run audit`, `npm run audit:flow`, `npm run report`, `npm run test`, `npm run audit:profile`
- Fast checks: `npm run cycle:status`, `npm run cycle:check`, `npm run validate:incr`, `npm run index:incr`, `npm run guide:latest`
- Release gate: `npm run release:gate`
- Bad-memory proof must continue to export `routing_decision: discard`

## Known Open Risks

- Historical artifacts still have some `missing_source_refs`; do not hide this by inventing sources.
- `promote: 0` is acceptable for the current proof-oriented release.
- Long sessions can make small text updates uneconomical if old context is carried forward.
- Skills that require reading full iteration guides by default are a token-cost risk.
- Cycle 02 charter users are still `0/3`; do not fabricate external use records.
- Cycle 02 AI-authored artifacts are `human_reviewed: declined` until the project owner reviews them.

## Token Economy Rules

- Start small: read this file, `docs/ITERATION-GUIDE-LATEST.md`, and `docs/CYCLE-02-COMMITMENT.md` before opening long docs.
- Run `npm run cycle:status` before reading Proof Pack or Failure Modes in full.
- Run `validate:incr` and `index:incr` before full scans during exploration.
- Read full `docs/ITERATION-GUIDE-0.9.md` only for disputed v0.9 acceptance criteria.
- For README/changelog/version updates, inspect only the affected sections and release surfaces.
- End long work with a short handoff here instead of relying on conversation memory.

## Next Good Work

- Keep version surfaces aligned.
- Keep Cycle 02 on the `v1.2.x` patch line; do not ship `v1.3.0`.
- Review `docs/PROOF-PACK-001.md` and `docs/FAILURE-MODES.md` for human acceptance or edits.
- Collect three real charter user records in `docs/CHARTER-USER-RECORDS.md`.
- Keep Audit Packets small and evidence-first; do not turn this into a general Agent framework.
- Keep generated `dist/` reports out of commits; regenerate them for local review.
- Defer backend adapters, AI scoring, RAG, or fine-tuning audit features.
