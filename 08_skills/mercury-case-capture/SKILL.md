---
name: mercury-case-capture
description: Convert AI outputs, audit notes, or review examples into portable GlimpseGate case folders. Use when a user wants a reproducible case with input.md, audit-result.json, review-status.yaml, and no invented evidence. Each case becomes a proof example for routing, failure mode, or integration review.
---

# GlimpseGate Case Capture

Capture a case so it can be audited, reviewed, copied into another project, or used as a lightweight proof example.

**Core reference:** [CONTEXT.md](file://./CONTEXT.md) — shared language for this project

## When to Use This Skill

- After running an audit and wanting to preserve the result
- When building a proof case for a routing decision
- When creating test fixtures for integration demos
- When documenting a failure mode with a real example

## Folder Shape

Create or update one folder per case:

```
cases/YYYY-MM/<slug>/
├── input.md           # Original AI output or user claim
├── audit-result.json  # Structural audit result
├── review-status.yaml # Provenance and review state
└── evidence/
    ├── source.md      # Relevant source material (optional)
    └── notes.md       # Any additional context (optional)
```

## Capture Rules

### Rule 1 — Preserve the original exactly
`input.md` must be a verbatim copy of the original AI output or user claim.
Do not clean it up, rephrase it, or "improve" it.

### Rule 2 — Keep missing references missing
Do not invent `source_refs`, `audit_refs`, reviewers, or external users.
If the original had no source, the captured case has no source.
This is a feature, not a bug — it documents a real evidence gap.

### Rule 3 — Include the structural result
`audit-result.json` must contain the full audit result:

```json
{
  "routing_decision": "revise",
  "failure_modes": [{"type": "overgeneralization", "signal": "always"}],
  "blockers": [{"id": "missing-source", "description": "No source_refs provided"}],
  "warnings": [],
  "required_fixes": ["Add source_refs or narrow claim"],
  "human_review_required": false,
  "memory_write_allowed": false
}
```

### Rule 4 — Record review state honestly
`review-status.yaml` must reflect reality:

```yaml
human_reviewed: declined
reviewer: project_owner_pending
review_required: true
routing_decision: revise
capture_date: 2026-05-20
capture_context: "Built from failed integration test case"
```

### Rule 5 — Prefer imperfect reality over polished fiction
A case that exposes uncertainty, disagreement, or quarantine is more useful than a perfect "accept" case.
The purpose is evidence, not endorsement.

## Repo Commands

When working inside GlimpseGate-admission-lab:

```powershell
npm run cases:build   # Build cases from audit-packet fixtures
npm run cases:check  # Validate case folder structure
```

After capture, the case is evidence for review and proof, NOT an approved memory.

---

## Case Types

| Type | Purpose | Example |
|------|---------|---------|
| `routing-demo` | Shows a routing decision in action | A claim routed to quarantine with blockers |
| `failure-mode` | Proves a known failure pattern | Overgeneralization caught by the audit |
| `integration-proof` | Verifies SDK behavior in context | memory-write hook working end-to-end |
| `review-template` | Human review checklist generation | quarantine → review UX |

---

## Quality Checklist

Before marking a case as complete, verify:

- [ ] `input.md` is a verbatim copy — no edits
- [ ] `audit-result.json` is the actual result, not a desired result
- [ ] `review-status.yaml` has honest provenance (not fabricated)
- [ ] Missing references are noted as missing, not filled in
- [ ] The case demonstrates a real pattern, not an invented scenario
