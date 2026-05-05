# Latest Iteration Guide

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/ITERATION-GUIDE-0.9.md
```

This is the low-context entrypoint for iteration work. Read the full `docs/ITERATION-GUIDE-0.9.md` only when a task needs detailed acceptance criteria or historical audit rationale.

## Current Version

`1.0.0` — feature freeze for the six-month cooling period.

## Current Objective

Keep the project stable and cheap to reactivate:

- first screen understandable in 30 seconds
- demo runnable with concrete commands
- release gate runnable with one command
- bad-memory intercept preserved with `routing_decision: discard`
- future agents start from `MEMORY.md`, this file, and `docs/CHECKLIST-REACTIVATION.md`

## Current Stop List

- Do not add new artifact types.
- Do not add backend adapters.
- Do not add AI scoring, AI self-audit, RAG, or fine-tuning audit features.
- Do not rewrite `00_raw` to make later conclusions cleaner.
- Do not invent `source_refs` or `audit_refs`.
- Do not add non-critical features during `1.0.x`.

## Read Policy

- Start with `MEMORY.md`, this file, and the file directly touched by the user request.
- For release work, prefer `README.md`, `DEMO.md`, `CHANGELOG.md`, `package.json`, and `config/project-meta.json`.
- For audit-contract work, read `docs/AUDIT-CONTRACT.md`.
- For methodology/provenance work, read `docs/METHODOLOGY-INTEGRITY.md`.
- For detailed v0.9 history, read `docs/ITERATION-GUIDE-0.9.md` by section, not as the default first step.

## Validation

```powershell
npm run validate
npm run index
npm run export:memory -- --include-archive
npm run sync:check
npm run release:gate
```
