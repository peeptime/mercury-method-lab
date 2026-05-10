# Unsupported long-term memory candidate

~~~yaml
case_origin: repository_audit_packet
source_path: examples/audit-packets/memory_pollution_case.yaml
packet_id: memory_pollution_001
type: memory_candidate
risk_level: high
~~~

## Claim

The user always prefers HTML over Markdown for all future project outputs.

## Source Refs

- none

## Audit Refs

- docs/AGENT-CONTEXT-BUDGET.md

## Context

{
  "summary": "The user asked for HTML as a delivery/reporting layer, but project policy still keeps Markdown/YAML as source of truth.",
  "risk": "Overwriting durable user preference memory with an overgeneralized rule."
}
