# Scope

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  audit_ref: docs/AGENT-AUDIT-BLUEPRINT.md
```

This document defines what Mercury Method Lab does and does not do.

The goal is to keep Mercury sharp: an evidence-first audit method for AI-generated claims before durable memory.

## Mercury Does

- Capture AI conversations as source evidence.
- Convert candidate claims into Audit Packets.
- Run structural audit before durable use.
- Route claims as `accept`, `revise`, `quarantine`, or `discard`.
- Generate Human Review Checklists with A/B/C choices.
- Produce Markdown, JSON, and HTML reports.
- Preserve provenance, review state, source refs, audit refs, blockers, and routing decisions.
- Provide an implementer blueprint for agent systems.

## Mercury Does Not

- It does not choose your database.
- It does not run a second brain.
- It does not replace Obsidian, Notion, Logseq, mem0, Zep, Letta, or LangChain.
- It does not write directly into external memory stores.
- It does not auto-promote captures into durable memory.
- It does not claim certification authority.
- It does not convert AI confidence into a success metric.
- It does not mark `human_reviewed: true` without named human review.

## Boundary

Mercury owns this path:

```text
capture -> audit packet -> structural audit -> routing decision -> report/checklist
```

External systems own this path:

```text
accepted report -> storage backend -> retrieval -> application behavior
```

Mercury can export to those systems, but it should not become those systems.

## Ecosystem Recommendation

Use Mercury for the audit gate. Use other tools for durable storage:

- Obsidian / Logseq for local knowledge bases.
- Notion / Google Docs for team review.
- GitHub for versioned standards and proof packs.
- mem0 / Zep / Letta / LangMem for agent memory, after an audit gate.
- Databases and vector stores for production retrieval, after admission control.

## Default Rule

If a feature does not help answer "Should this AI-generated claim be remembered?", it is probably outside Mercury's scope.
