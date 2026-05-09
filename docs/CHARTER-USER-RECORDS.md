# Charter User Records

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: "This file intentionally contains no fabricated external user feedback."
  audited_by: Mercury Lab self-audit
  audit_ref: docs/CYCLE-02-COMMITMENT.md
```

Cycle 02 requires three real non-author, non-AI user records.

This file is a ledger and intake template. It is not a substitute for real users.

## Status

```yaml
required_records: 3
real_records_collected: 0
status: external_pending
fabrication_policy: "Do not create simulated charter users to satisfy this requirement."
```

## Record Slots

| Slot | User Type | Status | Input Received | Routed Through Mercury | Feedback Recorded |
|---|---|---|---|---|---|
| CU-001 | non-author human | recruiting | no | no | no |
| CU-002 | non-author human | recruiting | no | no | no |
| CU-003 | non-author human | recruiting | no | no | no |

## Intake Template

```yaml
charter_user_id:
date:
relationship_to_project:
ai_output_submitted:
  source_format:
  permission_to_store:
  sensitive_information_removed:
mercury_packet:
  source_refs:
  audit_refs:
  routing_decision:
  blockers:
  required_fixes:
feedback:
  what_was_annoying:
  what_was_surprising:
  what_would_make_it_useful_again:
review:
  human_reviewed:
  reviewer:
  review_note:
```

## Ground Rules

- The user must be a real person other than the project author.
- The submitted AI output must come from the user's real workflow or a clearly described test task.
- Sensitive data should be removed before committing anything.
- If the user does not permit storing the raw output, store only a redacted packet with a note that the source is held outside the repository.
- Feedback must include friction, not only praise.
