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
  -> simulated memory flow
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
npm run audit:flow
npm run report
npm run test
npm run audit:profile
```

Outputs:

- `dist/audit-results.json`
- `dist/memory-flow/README.md`
- `dist/reports/index.html`
- one HTML report per packet

`dist/` is generated output and is intentionally not versioned.

## Layer Responsibilities

| Layer | Files | Responsibility |
|---|---|---|
| Input | `examples/audit-packets/*.yaml` | Durable packet source of truth. |
| Schema | `scripts/audit-core/audit_schema.mjs` | Required fields and type shape. |
| Rules | `scripts/audit-core/audit_rules.mjs` | Refusal points, routing, fixes, review path. |
| Flow | `scripts/simulate_memory_flow.mjs` | Generated accept/revise/quarantine/discard folders. |
| Report | `scripts/generate_audit_reports.mjs` | Human-readable HTML delivery. |
| Performance | `scripts/profile_audit_packets.mjs` | Local timing profile for parser and rules. |

The performance path uses concurrent packet reads and Git-backed path discovery before falling back to filesystem scanning.
