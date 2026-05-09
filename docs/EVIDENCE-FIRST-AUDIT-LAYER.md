# Evidence-First Audit Layer

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: user iteration brief 2026-05-09
```

Mercury Method Lab is not an agent framework. It is the audit layer that runs after agents, FDE workflows, or long-term memory systems produce candidate claims.

The question is:

> Does this AI-generated claim have enough evidence to enter long-term memory, project decisions, or customer delivery?

## Minimal Loop

```text
Audit Packet YAML
  -> structural audit rules
  -> routing decision
  -> JSON audit result
  -> HTML report for humans
```

Markdown/YAML remain the source of truth. HTML is the delivery layer.

## Audit Packet

An audit packet is a small YAML file under `examples/audit-packets/` with:

```yaml
id:
title:
type:
claim:
source_refs:
audit_refs:
context:
risk_level:
```

The key fields are `claim`, `source_refs`, and `audit_refs`. A claim without sources cannot enter durable memory.

## Routing Decisions

| Decision | Meaning |
|---|---|
| `accept` | Structurally safe enough for durable memory or delivery. |
| `revise` | Useful, but wording or evidence needs correction. |
| `quarantine` | Keep isolated; do not write into long-term systems. |
| `discard` | Too unsupported, circular, or polluting to preserve as reusable memory. |

## Current Blockers

- `missing_source_refs`
- `missing_audit_refs`
- `circular_reasoning`
- `unsupported_claim`
- `overgeneralization`
- `unclear_boundary`
- `stale_context`
- `unsafe_memory_write`

These are refusal points, not success metrics.

## Commands

```powershell
npm run audit
npm run report
npm run test
```

Outputs:

- `dist/audit-results.json`
- `dist/reports/index.html`
- one HTML report per packet

`dist/` is generated output and is intentionally not versioned.
