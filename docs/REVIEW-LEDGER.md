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
| 2026-05-10 | `v1.7.0` Audit Kernel Independence | declined | project_owner_pending | Kernel modules make profiles, standards, source credibility, lifecycle, and disagreement portable, but built-in defaults are still AI-assisted and not externally reviewed. | Review profile/standard names and relationship disclosure before treating them as canonical. |
| 2026-05-10 | `v1.6.0` Pre-Storage Audit SDK | declined | project_owner_pending | Local SDK/API, policy layer, memory-write hook demo, benchmark, and OWASP C8 mapping make Mercury easier to integrate, but they are still AI-assisted reference artifacts rather than a reviewed public package or compliance claim. | Project owner should review the SDK contract and OWASP mapping before presenting them as stable external guidance. |
| 2026-05-10 | `v1.5.0` Human Review Checklist UX | declined | project_owner_pending | Review guidance now produces content summaries and A/B/C checklist choices, but these choices are prompts for human judgment, not proof that review happened. | A named human reviewer must still record the final decision before any artifact is marked `human_reviewed: true`. |
| 2026-05-10 | `docs/CYCLE-04-BLUEPRINT.md` + method-depth docs | declined | project_owner_pending | Cycle 04 reframes Mercury as a reference method and implementer blueprint, but the taxonomy, routing theory, coverage matrix, and related-work map are AI-assisted drafts. | Project owner should review before treating v1.4.0 as human-approved method policy. |
| 2026-05-10 | `docs/CYCLE-02-COMMITMENT.md` -> `v1.3.0` | declined | project_owner_pending | `acknowledged_violation`: v1.3.0 contradicted the original `forbidden_version_lines`. The product-surface unfreeze is recorded as a project-owner/Codex decision, not proof that the Cycle 02 commitment was honored. | Keep README provenance declined; use v1.3.x only for patch-level product/Lite intake fixes until a real Cycle variable advances. |
| 2026-05-10 | `README.md` / `README.en.md` | declined | project_owner_pending | README previously claimed project-level `human_reviewed: true` while referenced sub-artifacts remained declined. Project-level provenance now follows the lowest-reviewed referenced component. | Do not mark README true until referenced docs have named human review. |
| 2026-05-10 | `docs/THREE-MINUTE-START.md` + Lite/dropzone capture path | declined | project_owner_pending | Low-friction capture is useful, but it only preserves source evidence; it does not grant audit approval or memory promotion. | Test with a real user before treating the entry path as validated. |
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
