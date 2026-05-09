# Review Ledger

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: "This ledger is AI-assisted and records review state; it does not grant human approval to itself."
  audited_by: Mercury Lab self-audit
  audit_ref: docs/METHODOLOGY-INTEGRITY.md
```

This ledger prevents `human_reviewed: pending` from becoming invisible trust.

Use:

- `true` only when a named human actually reviewed and accepted the artifact.
- `declined` when the artifact is not human-approved, when review was rejected, or when an AI-only session cannot honestly claim review.
- `pending` only as a short-lived queue state with an owner and next action.

## Cycle 02 Entries

| Date | Artifact | Review State | Reviewer | Finding | Next Action |
|---|---|---|---|---|---|
| 2026-05-09 | `docs/CYCLE-02-COMMITMENT.md` | declined | project_owner_pending | AI-assisted commitment draft; useful as constraint, not human-approved policy. | Owner may accept, edit, or reject. |
| 2026-05-09 | `docs/PROOF-PACK-001.md` | declined | project_owner_pending | Cases 002-010 are grounded in repo artifacts but not human-reviewed. | Owner review should decide which cases become canonical. |
| 2026-05-09 | `docs/FAILURE-MODES.md` | declined | project_owner_pending | 22 modes are case-grounded but still AI-assisted taxonomy. | Owner review should rename, merge, or remove modes. |
| 2026-05-09 | `docs/CHARTER-USER-RECORDS.md` | declined | project_owner_pending | Contains templates and empty slots only; no fake users. | Fill after real non-author users test Mercury. |
| 2026-05-09 | `docs/AGENT-TOKEN-ECONOMY.md` | declined | project_owner_pending | Low-token guidance is operationally useful but still AI-authored. | Validate after next fresh-agent session. |
| 2026-05-09 | `08_skills/cycle-02-curator/SKILL.md` | declined | project_owner_pending | Skill is designed to reduce context spend and prevent feature expansion. | Test with a fresh agent before marking reviewed. |

## Pre-Cycle Carryover

| Artifact | Prior State | Current Handling |
|---|---|---|
| `docs/EVIDENCE-FIRST-AUDIT-LAYER.md` | `human_reviewed: pending` | Not silently approved; remains queued for owner review. |
| `CHANGELOG.md` entries 1.0.0-1.2.0 | `humanReviewed: pending` | Not retroactively approved; use this ledger before citing them as human-reviewed. |
| `MEMORY.md` | `human_reviewed: pending` | Updated as working handoff, not canonical review. |

## Review Checklist

When a human reviews an artifact, record:

- What changed after review.
- What was rejected or narrowed.
- Whether the artifact can be cited as policy, case evidence, or draft-only context.
- Whether future agents may use it without re-opening the full source.
