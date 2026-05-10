# Cycle 04 Blueprint

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: user Cycle 04 brief 2026-05-10
```

Cycle 04 is a method-depth release.

It is not a claim that Mercury Method Lab is an industry standard. It is a decision to make the project more useful to people who may build better agents, memory systems, FDE workflows, and audit products than this repository can build by itself.

## Position

Mercury should become:

```text
a reference method for agent-output memory audit
```

not:

```text
a self-appointed certification authority
```

The goal is to make the work citeable, forkable, and testable. A good outcome is that another team can say, "We used the Mercury routing model and FM taxonomy as a starting point," then improve it.

## Cycle 04 Deliverables

| Deliverable | File | Purpose |
|---|---|---|
| Failure-mode taxonomy | `docs/FAILURE-MODES.md` | Move from flat list to five families and boundary rules. |
| Routing theory | `docs/ROUTING-THEORY.md` | Explain why four routes exist and how decisions are made. |
| Coverage matrix | `docs/PROOF-PACK-COVERAGE-MATRIX.md` | Show what Proof Pack 001 covers and what it does not cover. |
| Related work | `docs/RELATED-WORK.md` | Position Mercury beside hallucination detection, fact verification, data quality, provenance, and AI risk work. |
| Agent audit blueprint | `docs/AGENT-AUDIT-BLUEPRINT.md` | Give implementers a practical adoption guide without forcing Mercury's repo structure. |

## What Changes

- Failure modes are organized into top-level families.
- Routing decisions have a decision-axis model.
- Proof Pack 001 is treated as a pilot coverage set, not a complete benchmark.
- Mercury's public story moves from "a tool with a dashboard" toward "a reference method with runnable examples."
- Existing tools remain supporting infrastructure.

## What Does Not Change

- `human_reviewed: true` still requires named human review.
- Capture and Lite Mode still do not promote memory.
- Mercury still does not become a RAG system, agent framework, or SaaS.
- No quantified success metric is introduced.
- No new backend adapter or UI surface is introduced.

## Independent Narrative

Mercury Agent remains one possible upstream source of agent outputs. Mercury Method Lab should describe itself independently:

```text
Evidence-first audit method for deciding which AI-generated claims deserve durable memory.
```

The relationship should be:

```text
agent outputs -> Mercury-style audit -> memory / revision / quarantine / discard
```

not:

```text
Mercury Agent companion project only
```

## Acceptance Criteria

- A fresh reader can find the five failure-mode families without reading every FM entry.
- A fresh implementer can understand the four routing decisions without reading the code.
- Proof Pack 001's gaps are visible instead of hidden.
- Related work names what Mercury borrows and what it does not solve.
- README points to the blueprint and method docs before product-surface details.
- Validation and release gate still pass.

## Open Risks

- The taxonomy is still AI-assisted and not human-approved.
- Proof Pack 001 remains small.
- Inter-rater reliability has not been tested.
- Related work is a first pass, not a literature review.
- External users remain uncollected.

These risks should stay visible. Hiding them would be a Mercury failure mode.
