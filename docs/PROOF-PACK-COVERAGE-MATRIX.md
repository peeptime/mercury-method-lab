# Proof Pack Coverage Matrix

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/PROOF-PACK-001.md
```

Proof Pack 001 is a pilot set, not a complete benchmark. Its job is to expose whether the current failure modes and routing decisions have enough case support to guide future work.

## Case Coverage

| Case | Output Type | Route | Primary FM Family | Failure Modes |
|---|---|---|---|---|
| 001 Meshy BlackBox narrative | product / strategy narrative | revise | Validation Leap | FM-11, FM-12, FM-13 |
| 002 Format preference memory | user preference / memory | quarantine | Memory Boundary | FM-01, FM-04, FM-05 |
| 003 Agent closeout summary | agent project summary | discard | Evidence Lineage | FM-01, FM-02, FM-03 |
| 004 FDE customer consensus | customer delivery | quarantine | Delivery and Stakeholder | FM-02, FM-06, FM-07 |
| 005 Template becomes policy | process template | revise | Memory Boundary | FM-08, FM-09, FM-10 |
| 006 Source-of-truth split | project decision | accept | None triggered | boundary_preserved |
| 007 Quantified audit metric | governance metric | discard | Governance and Measurement | FM-14, FM-15 |
| 008 AI collaboration review | provenance / review | revise | Governance and Measurement | FM-16, FM-17, FM-18 |
| 009 Category strategy | positioning / strategy | revise | Validation Leap | FM-19, FM-22 |
| 010 Release velocity | repo maturity signal | revise | Validation Leap | FM-20, FM-21, FM-22 |

## Route Coverage

| Route | Cases | Current Support | Gap |
|---|---|---|---|
| accept | 006 | Thin but present | Needs more narrow, positive examples so Mercury is not refusal-only. |
| revise | 001, 005, 008, 009, 010 | Strongest | Needs more non-text output examples. |
| quarantine | 002, 004 | Adequate pilot support | Needs multi-agent and stale-memory cases. |
| discard | 003, 007 | Adequate pilot support | Needs code/data cases where removal is justified. |

## Failure Mode Coverage

| Family | Covered FMs | Coverage Quality | Missing Pressure |
|---|---|---|---|
| Evidence Lineage | FM-01, FM-02, FM-03, FM-12, FM-18 | Good pilot coverage | Multi-agent source contamination and generated-source reuse. |
| Memory Boundary | FM-04, FM-05, FM-08, FM-09, FM-10, FM-22 | Good pilot coverage | Stale-but-reused durable memory. |
| Delivery and Stakeholder | FM-06, FM-07 | Thin | More FDE/customer examples across conflicting stakeholders. |
| Validation Leap | FM-11, FM-13, FM-19, FM-20, FM-21, FM-22 | Good for strategy/repo cases | Code, data, chart, and product analytics outputs. |
| Governance and Measurement | FM-14, FM-15, FM-16, FM-17, FM-18 | Good pilot coverage | Inter-rater review and audit disagreement records. |

## Output Type Coverage

| Output Type | Covered? | Case(s) | Next Target |
|---|---|---|---|
| AI memory candidate | yes | 002 | More positive accept examples. |
| Agent project summary | yes | 003 | Multi-agent handoff case. |
| FDE/customer delivery | yes | 004 | Real external user or field note. |
| Project policy / template | yes | 005, 006 | Boundary near-miss examples. |
| Governance metric | yes | 007 | Non-gameable diagnostic counter example. |
| Provenance/review artifact | yes | 008 | Human review disagreement example. |
| Strategy / category memo | yes | 001, 009, 010 | External comparison case. |
| Code generation | no | none | Test-passing-but-wrong case. |
| Data analysis / chart | no | none | Chart-overclaim or base-rate case. |
| Multi-agent memory chain | no | none | Agent A output stored by Agent B case. |
| Time-sensitive memory | no | none | Stale-but-reused claim case. |

## Next Case Selection Rule

Do not add a case merely because it is interesting. Add it when it fills at least one empty cell:

- a route with thin support
- a failure family with thin support
- an output type not yet represented
- a boundary case that helps distinguish two similar FMs

## Target Cases 011-020

| Target | Purpose | Expected Route |
|---|---|---|
| Case 011: Multi-agent contamination | Tests whether source lineage survives agent-to-agent transfer. | quarantine |
| Case 012: Stale-but-reused memory | Tests time boundary and expiry handling. | revise or quarantine |
| Case 013: Test-passing-but-wrong code | Tests code output where tests are insufficient evidence. | revise |
| Case 014: Chart-overclaim | Tests data visualization and summary-statistic overreach. | revise |
| Case 015: Acceptable narrow code note | Prevents code cases from becoming refusal-only. | accept |
| Case 016: Human review disagreement | Tests review ledger and inter-rater disagreement. | quarantine |
| Case 017: Non-gameable diagnostic counter | Distinguishes diagnostics from success metrics. | accept or revise |
| Case 018: Customer dissent preserved | Near miss for consensus laundering. | accept |
| Case 019: Category hypothesis with falsifier | Near miss for premature positioning memory. | accept |
| Case 020: Agent capture not promoted | Tests Lite/dropzone capture boundary. | quarantine |

## Interpretation

Proof Pack 001 supports Mercury's initial claim, but not a full standard. The next useful work is not another interface. It is filling this matrix until the taxonomy can survive unfamiliar output types and independent auditors.
