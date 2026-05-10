# Human Review Disagreement

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: src/mercury-audit/disagreement.mjs
```

Human review is not a binary stamp. Reviewers can disagree, and that disagreement is part of the evidence.

## Disagreement Workflow

| Step | Action |
|---|---|
| 1 | Preserve each reviewer route and rationale. |
| 2 | Check whether the disagreement changes durable-memory risk. |
| 3 | If routes conflict, keep the packet at `quarantine` until resolved. |
| 4 | Name the adjudicator or explicitly leave the item unresolved. |
| 5 | Record the final route with the active `ruleset_version`. |

## Required Disagreement Record

```yaml
packet_id:
reviewers:
  - id:
    route:
    rationale:
adjudicator:
final_route:
ruleset_version:
unresolved: true
```

## Why This Exists

Without a disagreement mechanism, the project can accidentally choose the convenient reviewer and call the result "human reviewed." That is review theater.

## Case Anchor

Proof Pack 002 Case 015 is the canonical disagreement case for this release.
