---
name: mercury-case-capture
description: Convert AI outputs, audit notes, or review examples into portable Mercury case folders. Use when a user wants a reproducible case with input.md, audit-result.json, review-status.yaml, and no invented evidence.
---

# Mercury Case Capture

Capture a case so it can be audited, reviewed, copied into another project, or used as a lightweight proof example.

## Folder Shape

Create or update one folder:

```text
cases/YYYY-MM/<slug>/
  input.md
  audit-result.json
  review-status.yaml
```

## Capture Rules

1. Preserve the original claim or AI output in `input.md`.
2. Keep missing references missing. Do not invent `source_refs`, `audit_refs`, reviewers, or external users.
3. Put the structural result in `audit-result.json`, including `routing_decision`, `failure_modes`, `blockers`, `warnings`, and `required_fixes`.
4. Put review state in `review-status.yaml`:

```yaml
human_reviewed: declined
reviewer: project_owner_pending
review_required: true
```

5. Prefer realistic cases over polished examples. A useful case may expose uncertainty, disagreement, or quarantine.

## Repo Commands

When working inside Mercury Method Lab, prefer:

```powershell
npm run cases:build
npm run cases:check
```

After capture, the case is evidence for review, not an approved memory.
