# Mercury Lab Working Memory

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/AGENT-CONTEXT-BUDGET.md
```

This file is the short cross-session handoff. Keep it under 120 lines. Do not paste raw reports here.

## Current Snapshot

- Current public version: `1.0.1`
- Current posture: feature freeze, six-month cooling period
- Core proof: `docs/v0.9-proof-of-audit.md`
- Fast checks: `npm run validate:incr`, `npm run index:incr`, `npm run guide:latest`
- Release gate: `npm run release:gate`
- Bad-memory proof must continue to export `routing_decision: discard`

## Known Open Risks

- Historical artifacts still have some `missing_source_refs`; do not hide this by inventing sources.
- `promote: 0` is acceptable for the current proof-oriented release.
- Long sessions can make small text updates uneconomical if old context is carried forward.
- Skills that require reading full iteration guides by default are a token-cost risk.

## Token Economy Rules

- Start small: read this file and `docs/ITERATION-GUIDE-LATEST.md` before opening long docs.
- Run `validate:incr` and `index:incr` before full scans during exploration.
- Read full `docs/ITERATION-GUIDE-0.9.md` only for disputed v0.9 acceptance criteria.
- For README/changelog/version updates, inspect only the affected sections and release surfaces.
- End long work with a short handoff here instead of relying on conversation memory.

## Next Good Work

- Keep version surfaces aligned.
- Reduce generated-output noise in sample/export flows.
- Continue metadata cleanup where sources are real and already present.
- During `1.0.x`, fix critical bugs only; defer new artifact types, adapters, AI scoring, RAG, or fine-tuning audit features.
