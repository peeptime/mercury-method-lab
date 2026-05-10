# Adapter Contract

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/SDK-API.md
```

Mercury still does not ship production adapters for mem0, Zep, Letta, LangMem, or custom vector stores.

This contract defines the minimum shape an adapter should satisfy.

## Adapter Placement

```text
host memory candidate
  -> adapter normalizes content
  -> Mercury audit()
  -> host receives routing_decision
  -> host writes, revises, quarantines, or discards
```

## Input Contract

Adapters must provide:

| Field | Requirement |
|---|---|
| `content` or `claim` | Specific candidate memory text. |
| `type` | Host memory type or scenario-specific type. |
| `source_refs` | Traceable origin, not only AI summary. |
| `audit_refs` | Review or validation reference when available. |
| `scenario` | One of the scenario pack ids or a custom scenario object. |
| `risk_level` | `low / medium / high`. |

## Output Contract

Adapters must respect:

| Mercury Output | Adapter Action |
|---|---|
| `accept` | Host may write, with provenance and scope. |
| `revise` | Host should request repair before durable write. |
| `quarantine` | Host must isolate from normal retrieval. |
| `discard` | Host should keep only audit evidence or delete from promotion path. |

## Adapter Non-Negotiables

- Do not treat `accept` as permanent truth.
- Do not write `revise`, `quarantine`, or `discard` to normal long-term memory.
- Do not strip `provenance`.
- Do not hide `human_review_required`.
- Do not downgrade a stricter Mercury route without a named reviewer record.

This makes future real adapters possible without prematurely tying Mercury to one memory vendor.
