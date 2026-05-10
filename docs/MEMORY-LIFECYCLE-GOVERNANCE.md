# Memory Lifecycle Governance

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: src/mercury-audit/lifecycle.mjs
```

Mercury is not a memory store. It defines the gate before a claim enters one. The lifecycle layer tells host systems when an accepted memory should stop being treated as current.

## Lifecycle States

| State | Meaning | Default Route Pressure |
|---|---|---|
| `active_candidate` | No expiry or review trigger has fired. | Preserve normal route. |
| `review_due` | Review date passed or stale window exceeded. | Escalate to at least `revise`. |
| `expired` | Explicit expiry date passed. | Require human review before reuse. |
| `retired` | Context marks the memory deprecated or retired. | Block promotion until replaced. |

## Required Lifecycle Fields

| Field | Use |
|---|---|
| `created_at` | Establishes age. Missing values are warnings. |
| `review_after` | First date when the memory must be checked. |
| `expires_at` | Date after which the memory is not current. |
| `superseded_by` | Optional pointer to replacement memory. |
| `retirement_reason` | Why this memory should no longer steer decisions. |

## Practical Rule

The route `accept` means "acceptable under the current packet and rule context." It does not mean "forever true."

## Host-System Responsibility

A memory system integrating Mercury should store the route and lifecycle record together. Retrieval code should prefer current memories and down-rank, hide, or re-audit expired memories.

## Case Anchor

Proof Pack 002 Case 012 is the canonical stale-memory edge case for this release.
