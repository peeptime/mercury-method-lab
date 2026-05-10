# Real Cases Summary

~~~yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/V2-PREFLIGHT-REQUIREMENTS.md
~~~

This is a structured local case foundation for Mercury 2.0. These are not external charter-user records and not human-approved benchmark claims. They are reproducible repository cases that keep input, audit result, and review status together.

## Summary

- total_cases: 10
- accept: 2
- revise: 3
- quarantine: 4
- discard: 1
- case_root: `cases/2026-05/`

## Case Table

| Case | Origin | Decision | Failure Modes |
|---|---|---|---|
| agent-overgeneralization-001 | repository_audit_packet | revise | overgeneralization |
| agent-project-summary-001 | repository_audit_packet | discard | missing_source_refs, missing_audit_refs, circular_reasoning |
| fde-customer-delivery-001 | repository_audit_packet | quarantine | missing_audit_refs |
| memory-pollution-001 | repository_audit_packet | quarantine | missing_source_refs, overgeneralization, unsafe_memory_write |
| valid-project-decision-001 | repository_audit_packet | accept | none |
| openclaw-unsupported-memory-write | integration_simulation | quarantine | missing_source_refs, missing_audit_refs, overgeneralization, unsafe_memory_write |
| openclaw-supported-memory-write | integration_simulation | accept | none |
| ai-coding-test-passing-but-wrong | sdk_structural_case | revise | none |
| time-sensitive-memory-expiry | sdk_structural_case | revise | none |
| multi-agent-source-laundering | sdk_structural_case | quarantine | missing_audit_refs |

## Use

Run:

~~~powershell
npm run cases:build
npm run cases:check
~~~

Each case folder contains:

- `input.md`
- `audit-result.json`
- `review-status.yaml`

Missing evidence remains missing. The generator does not invent source refs or named human review.
