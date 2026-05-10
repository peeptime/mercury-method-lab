# Iteration Request: Human Review UX And Entry Clarity

```yaml
provenance:
  authors: project_owner
  captured_by: Codex
  ai_assisted: true
  human_reviewed: declined
  source_kind: user_iteration_request
  audit_window: 2026-05-10
```

This file records the accepted user feedback that drives v1.5.0.

The source guidance is treated as high-quality direction. The implementation should not re-litigate whether the direction matters; it should translate the priorities into a testable release while preserving Mercury's audit boundaries.

## Priority Summary

| Priority | Problem | Core Fix |
|---|---|---|
| P0 | Interaction relies on free typing, wasting agent prediction ability. | Replace primary human-review input with A/B/C choices plus custom fallback. |
| P0 | Human Review says review is required, but the next step is unclear. | Generate a Human Review Checklist precise enough for a reviewer to act. |
| P1 | Entry path is unclear. | Add `docs/START-HERE.md` with role-based routing. |
| P1 | Technical parameters are exposed too early. | Use progressive disclosure: default conclusion first, technical details later. |
| P1 | Chinese and English are mixed in user-visible surfaces. | Define i18n rules; Chinese is the default visible layer for Chinese users. |
| P2 | Content summary is missing. | Extract core claim, attribution, and confidence basis. |
| P2 | Storage recommendations can exceed project scope. | Add `docs/SCOPE.md`; recommend ecosystem tools without becoming a storage layer. |

## v1.5.0 Scope

v1.5.0 should ship the user-facing review loop:

- content summary
- Human Review Checklist
- A/B/C checklist options
- role-based entry docs
- progressive disclosure in Lite Mode and HTML reports
- project scope boundary
- export guidance

## Deferred To v1.6.0

The following are intentionally deferred:

- SDK / API package
- policy engine
- OWASP AISVS C8 mapping
- memory-write hook demo
- benchmark reporting

These are integration-layer work. They should follow after the Human Review UX is stable.

## Non-Goals

- Do not add a storage backend.
- Do not add database configuration UI.
- Do not turn Mercury into a second brain.
- Do not mark review as complete automatically.
- Do not present Mercury as a certification authority.
