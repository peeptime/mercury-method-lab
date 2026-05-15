# Agent Audit Blueprint

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/ROUTING-THEORY.md
```

This blueprint is for teams building agents, memory systems, FDE workflows, or internal AI tools.

It is not a certification claim. It is a practical guide for adding an evidence-first audit gate before AI outputs become durable memory or delivery truth.

## Core Principle

Do not ask "is the AI output useful?"

Ask:

```text
What would break if a future agent treated this output as durable truth?
```

If the answer is "future work, customer delivery, user profile, policy, or project memory," then the output needs an audit route before retention.

## Minimal Audit Contract

Every candidate memory or delivery claim should carry:

| Field | Purpose |
|---|---|
| `claim` | The specific statement seeking durable status. |
| `source_refs` | Inspectable origin material. |
| `audit_refs` | Review path or structural audit record. |
| `failure_modes` | Named refusal points or near misses. |
| `routing_decision` | `accept`, `revise`, `quarantine`, or `discard`. |
| `review_path` | Human or structural review still required. |
| `provenance` | Authorship and review state. |

Without source refs, do not accept.

Without audit refs, do not promote to long-term memory.

Without provenance, do not cite as reviewed.

## Four-Layer Gate

```text
AI output
  -> claim extraction
  -> evidence and provenance check
  -> failure mode classification
  -> routing decision
  -> memory / revision / quarantine / discard path
```

## Recommended Workflow

1. Capture the AI output as source evidence.
2. Extract one candidate claim at a time.
3. Attach source refs before interpreting the claim.
4. Attach audit refs before durable retention.
5. Classify primary failure mode family.
6. Route using `docs/ROUTING-THEORY.md`.
7. Record the decision in a review ledger.

## Routing Policy

| If The Output... | Route |
|---|---|
| Has source refs, audit refs, bounded scope, and no blockers. | accept |
| Is useful but too broad, stale, speculative, or underspecified. | revise |
| Is evidence worth preserving but unsafe for memory. | quarantine |
| Is circular, self-approving, or dangerously misleading. | discard |

## Failure Families

| Family | Use When |
|---|---|
| Evidence Lineage | The source, audit path, or proof loop is broken. |
| Memory Boundary | The claim is too broad, durable, or policy-like. |
| Delivery and Stakeholder | Customer or stakeholder ambiguity is compressed away. |
| Validation Leap | A demo, version, category story, or authority is overused as proof. |
| Governance and Measurement | Review state, provenance, or metrics can be gamed. |

## Implementation Pattern

An implementer does not need Mercury's file structure. They need the control point:

```text
before_write(memory_entry):
  require source_refs
  require audit_refs or quarantine
  classify failure_modes
  choose routing_decision
  record provenance
  only write when routing_decision == accept
```

Repository-local SDK equivalent:

```js
import { auditMemoryWrite, shouldWriteMemory } from "@GlimpseGate/admission-lab";

const result = auditMemoryWrite(memoryCandidate);

if (shouldWriteMemory(result)) {
  await memoryStore.write(result.packet.claim, result.provenance);
} else {
  await quarantineStore.write(result.packet.claim, result.failure_modes);
}
```

## Adoption Levels

| Level | Description | Suitable For |
|---|---|---|
| Level 0: Manual Checklist | Human reviews source refs, audit refs, and route. | Small teams and research projects. |
| Level 1: Structured Packet | Claims use a YAML/JSON packet and deterministic rules. | Agent memory tools and FDE handoffs. |
| Level 2: Review Ledger | Decisions are logged with reviewer, date, and unresolved blockers. | Teams with recurring AI delivery workflows. |
| Level 3: Independent Audit | A second reviewer checks route consistency and disagreement. | High-risk customer, policy, or user-profile memory. |

## Anti-Patterns

- Promoting every helpful AI answer into memory.
- Treating a source citation as audit approval.
- Treating a model's confidence tone as evidence.
- Treating a provenance block as human review.
- Using a fixed promote rate as proof of audit quality.
- Letting the same agent draft, audit, and approve the claim.

## What To Copy

Teams can copy:

- the four routing decisions
- the failure-mode family structure
- the provenance fields
- the review ledger idea
- the proof-pack coverage matrix

Teams should not copy:

- Mercury's exact directory structure unless it fits their workflow
- Mercury's current 22 modes as a supposedly complete taxonomy
- any `human_reviewed: true` claim without real review

## First Pilot

Use one week of AI outputs. Pick ten candidate claims:

- three memory candidates
- two project summary claims
- two customer or stakeholder claims
- one code or data claim
- one strategy claim
- one review/provenance claim

Route them independently, then compare decisions. The first useful result is disagreement, not high agreement. Disagreement shows where the taxonomy needs sharper boundaries.
