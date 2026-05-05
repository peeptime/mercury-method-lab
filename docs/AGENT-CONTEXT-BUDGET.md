# Agent Context Budget

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: MEMORY.md
```

## Problem

A small text update can become expensive when it runs inside a long accumulated agent session. The cost usually comes from carried context, repeated full-file reads, and multiple rewrite passes, not from the final edit itself.

## Diagnosis For The 1605k Token Case

The pasted diagnosis is directionally correct:

- Long session carryover was likely the main cost driver.
- Full reads of large audit and changelog files amplified the cost.
- Rewriting the same release narrative in multiple passes compounded the context.

Two caveats:

- A total-token number is not enough for cost accounting; separate input, cached input, output, and reasoning tokens.
- A memory file helps only if it stays short. A large `MEMORY.md` becomes another context sink.

## Default Budget Classes

| Task | Target Read Scope | Expected Shape |
|---|---|---|
| README or changelog wording | touched sections + `MEMORY.md` | one-pass edit |
| version bump | package/config/readme/changelog surfaces | sync + check |
| release hardening | release surfaces + validation summaries | small metadata/script edits |
| new audit report | report summary + audit index | append summary, avoid full history |
| new methodology decision | latest guide + relevant contract section | decision log or short doc |

## Session Split Rule

Split the work when a task crosses one of these boundaries:

- analysis/report ingestion
- implementation/editing
- release verification
- push/PR publishing

End each segment by updating `MEMORY.md` with only the current state, remaining risks, and next command.

## Read Policy

1. Read `MEMORY.md` first.
2. Read `docs/ITERATION-GUIDE-LATEST.md` second for iteration tasks.
3. Read the directly touched file.
4. Use search to locate sections before opening long files.
5. Read full long docs only when the answer depends on their detailed wording.

## Incremental Commands

Use these before full scans during exploration:

```powershell
npm run validate:incr
npm run index:incr
npm run guide:latest
```

Use `npm run release:gate` before commits or releases.

## Write Policy

- Prefer one small patch over repeated rewrites.
- Preserve raw evidence and historical uncertainty.
- Do not generate release bundles unless a release gate needs them.
- Clean generated verification outputs after inspection unless they are intentional artifacts.

## Cost Report Template

When a run looks expensive, report:

```text
task:
total_tokens:
input_tokens:
cached_input_tokens:
output_tokens:
reasoning_tokens:
largest_context_sources:
avoidable_reads:
next_prevention:
```

This prevents blaming the wrong part of the workflow.
