# Mercury Lab Audit Contract

> Version: 0.1.0
> Date: 2026-05-04
> Position: pre-ingestion audit gate for agent memory systems

Mercury Lab is not a second brain, a retrieval engine, or a general skill framework.

It is the narrow audit layer before content enters long-term agent memory such as Mercury Agent, gbrain, or a markdown archive.

## Priority

| Priority | Rule | Why it exists |
|----------|------|---------------|
| P0 | Do not pollute long-term memory | Bad memory compounds across future agent runs |
| P1 | Do not promote unsourced facts | Source sovereignty must survive migration |
| P2 | Do not promote ungraded fragments | The target brain should not guess artifact quality |
| P3 | Do not turn archived insights into reminders | Cold storage is a valid terminal state |
| P4 | Do not write directly into a runtime database | Migration must be reversible and backend-aware |

## Accepted Inputs

Mercury Lab may audit these inputs:

- raw conversation fragments
- cleaned observations
- uncertain hypotheses
- memory candidates
- decision logs
- action plans
- audit reports
- skill or template drafts

## Emitted Decisions

Every candidate exported to a memory backend must be routed to one of four decisions:

| Decision | Meaning | Backend behavior |
|----------|---------|------------------|
| `discard` | Not safe or not useful | Do not import |
| `archive` | Cold storage only | Store as reference, do not recall aggressively |
| `review` | Needs human or red-team review | Keep out of durable memory until resolved |
| `promote` | Safe enough for durable memory | May enter target memory with metadata |

## Non-Negotiable Rules

These rules are not plugin points:

- Raw evidence must not be overwritten.
- A hypothesis must not be stored as fact.
- High-level memory must include `source_refs`.
- High-level memory must include a review path or audit trace.
- `action_plan` must include `intent`.
- `intent=archived` must not trigger reminders.
- Runtime databases must not be written directly without a schema-aware adapter.

## Customizable Surface

These fields may be adapted per backend:

- `target_backend`
- `sample_type` label mapping
- exported JSON or markdown shape
- target path or import queue
- project namespace
- display template

Customization must not bypass the non-negotiable rules.

## Backend Contract

Mercury Lab emits a pre-audit bundle. Backend systems decide whether and how to ingest it.

```text
messy input / artifact
  -> Mercury Lab audit contract
  -> discard | archive | review | promote
  -> target backend import queue
  -> backend-owned storage and retrieval
```

Mercury Lab does not own retrieval, embedding, graph traversal, or long-term recall.

## Target Backends

| Backend | Relationship |
|---------|--------------|
| Mercury Agent | Runtime agent and SQLite-backed Second Brain target |
| gbrain | External agent brain and graph/search target |
| markdown | Portable fallback for reversible archival |

## Export Requirements

A pre-audit export must include:

- `schema_version`
- `generated_at`
- `target_backend`
- `contract_ref`
- `source_index_ref`
- `routing_decision`
- `source_refs`
- `audit_refs`
- `memory_level`
- `confidence`
- `risk`
- `review_at`
- `blockers`

The absence of a blocker is not proof of truth. It only means the candidate passes the current ingestion gate.
