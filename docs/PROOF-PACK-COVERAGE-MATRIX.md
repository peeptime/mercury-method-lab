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
| 011 Multi-agent contamination | multi-agent memory chain | quarantine | Evidence Lineage | FM-23, FM-01, FM-06 |
| 012 Stale memory reuse | time-sensitive memory | revise | Memory Lifecycle | FM-24, stale_context |
| 013 Test-passing code claim | code generation | revise | Validation Leap | FM-25, FM-10 |
| 014 Chart overclaim | data analysis / chart | revise | Validation Leap | FM-26, FM-11 |
| 015 Human review disagreement | review governance | quarantine | Governance and Measurement | FM-27, FM-17 |
| 016 Audit gaming attempt | governance attack | discard | Governance and Measurement | FM-28, FM-17, FM-15 |

## Route Coverage

| Route | Cases | Current Support | Gap |
|---|---|---|---|
| accept | 006 | Thin but present | Needs more narrow, positive examples so Mercury is not refusal-only. |
| revise | 001, 005, 008, 009, 010, 012, 013, 014 | Strongest | Needs more accept near-misses for code and data. |
| quarantine | 002, 004, 011, 015 | Stronger after Proof Pack 002 | Needs real external user cases. |
| discard | 003, 007, 016 | Adequate pilot support | Needs more explicit manipulation and unsafe-write cases. |

## Failure Mode Coverage

| Family | Covered FMs | Coverage Quality | Missing Pressure |
|---|---|---|---|
| Evidence Lineage | FM-01, FM-02, FM-03, FM-12, FM-18, FM-23 | Good pilot coverage | Generated-source reuse with external adapter traces. |
| Memory Boundary / Lifecycle | FM-04, FM-05, FM-08, FM-09, FM-10, FM-22, FM-24 | Stronger after Proof Pack 002 | Positive lifecycle near-miss examples. |
| Delivery and Stakeholder | FM-06, FM-07 | Thin | More FDE/customer examples across conflicting stakeholders. |
| Validation Leap | FM-11, FM-13, FM-19, FM-20, FM-21, FM-22, FM-25, FM-26 | Good for strategy/repo/code/data cases | More accept near-misses. |
| Governance and Measurement | FM-14, FM-15, FM-16, FM-17, FM-18, FM-27, FM-28 | Good pilot coverage | Real review-ledger disagreement records. |

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
| Code generation | yes | 013 | Acceptable narrow code note. |
| Data analysis / chart | yes | 014 | Base-rate and chart near-miss examples. |
| Multi-agent memory chain | yes | 011 | Generated-source reuse with adapter trace. |
| Time-sensitive memory | yes | 012 | Positive lifecycle review example. |
| Human review disagreement | yes | 015 | Real reviewer disagreement record. |
| Anti-gaming / route manipulation | yes | 016 | More adversarial phrasing variants. |

## Next Case Selection Rule

Do not add a case merely because it is interesting. Add it when it fills at least one empty cell:

- a route with thin support
- a failure family with thin support
- an output type not yet represented
- a boundary case that helps distinguish two similar FMs

## Target Cases 011-020

| Target | Purpose | Expected Route |
|---|---|---|
| Case 011: Multi-agent contamination | Shipped in Proof Pack 002. | quarantine |
| Case 012: Stale-but-reused memory | Shipped in Proof Pack 002. | revise |
| Case 013: Test-passing-but-wrong code | Shipped in Proof Pack 002. | revise |
| Case 014: Chart-overclaim | Shipped in Proof Pack 002. | revise |
| Case 015: Human review disagreement | Shipped in Proof Pack 002. | quarantine |
| Case 016: Audit gaming attempt | Shipped in Proof Pack 002. | discard |
| Case 017: Acceptable narrow code note | Prevents code cases from becoming refusal-only. | accept |
| Case 018: Non-gameable diagnostic counter | Distinguishes diagnostics from success metrics. | accept or revise |
| Case 019: Customer dissent preserved | Near miss for consensus laundering. | accept |
| Case 020: Category hypothesis with falsifier | Near miss for premature positioning memory. | accept |

## Interpretation

Proof Pack 001 supports Mercury's initial claim, but not a full standard. The next useful work is not another interface. It is filling this matrix until the taxonomy can survive unfamiliar output types and independent auditors.
