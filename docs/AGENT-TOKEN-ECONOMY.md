# Agent Token Economy

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: "Operational guidance for agent cost control; validate after fresh-agent use."
  audited_by: Mercury Lab self-audit
  audit_ref: docs/CYCLE-02-COMMITMENT.md
```

Mercury Lab is meant to sit beside coding agents. It should reduce context waste, not create more of it.

## Fresh-Agent Read Order

Read only:

1. `MEMORY.md`
2. `docs/ITERATION-GUIDE-LATEST.md`
3. `docs/CYCLE-02-COMMITMENT.md`
4. The specific case, packet, or script being changed

Do not open full historical guides, full changelog, or all audit reports unless the current task requires their exact wording.

## Cheap Commands First

```powershell
npm run cycle:status
npm run cycle:check
npm run validate:incr
npm run index:incr
```

Use full validation only after edits:

```powershell
npm run audit
npm run report
npm run audit:flow
npm run test
npm run audit:profile
npm run release:gate
```

## Read Budget Rules

- Prefer heading scans and status scripts before reading long Markdown files.
- When editing a proof case, read that case and its direct refs only.
- When editing a failure mode, read `docs/FAILURE-MODES.md` and the referenced proof case only.
- When updating release surfaces, read `package.json`, `config/project-meta.json`, `CHANGELOG.md` top entry, `README.md` top screen, and `MEMORY.md`.
- End long sessions by updating `MEMORY.md`; do not rely on conversation context as the only handoff.

## Cost Smell Checklist

Stop and shrink context when:

- A small README or changelog edit requires full audit-report reads.
- The agent re-reads the same long file more than once.
- The task starts inventing new concepts instead of citing proof cases.
- The agent tries to mark human review complete without a human reviewer.
- The next command can be answered by `npm run cycle:status`.
