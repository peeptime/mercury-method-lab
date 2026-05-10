# Agent summary with overgeneralized delivery rule

~~~yaml
case_origin: repository_audit_packet
source_path: examples/audit-packets/agent_overgeneralization_case.yaml
packet_id: agent_overgeneralization_001
type: agent_project_summary
risk_level: medium
~~~

## Claim

All future FDE handoffs must use the same customer-memory template.

## Source Refs

- docs/EVIDENCE-FIRST-AUDIT-LAYER.md

## Audit Refs

- docs/AUDIT-METRICS-DECLINED.md

## Context

{
  "summary": "A template helped one simulated handoff, but the packet tries to turn one case into a universal rule.",
  "risk": "A useful delivery pattern could become rigid project memory."
}
