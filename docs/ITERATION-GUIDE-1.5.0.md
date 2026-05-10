# Iteration Guide 1.5.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  audit_ref: docs/ITERATION-REQUEST-UI-AUDIT-2026-05-10.md
```

## Version

`1.5.0` - Human Review Checklist UX

## Objective

Make Mercury's review result actionable for humans.

Before this release, an audit could say `human_review_required: true` without telling the reviewer exactly what to confirm next. This release adds content summaries and A/B/C review choices so a human can review source support, confidence, attribution, and routing without guessing.

## Primary Changes

- `scripts/audit-core/audit_rules.mjs` now emits `content_summary`.
- `scripts/audit-core/audit_rules.mjs` now emits `human_review_checklist`.
- `scripts/generate_audit_reports.mjs` renders content summary, A/B/C checklist choices, and a copyable review record.
- `dashboard/lite.html` defaults to a Chinese user-facing layer and folds technical fields behind `查看技术详情`.
- `docs/START-HERE.md` adds a role-based entry point.
- `docs/SCOPE.md` defines the project boundary.
- `docs/EXPORT-GUIDE.md` explains how outputs move into external tools.
- `docs/I18N-UX-POLICY.md` records the language and progressive-disclosure rules.

## What Did Not Change

- No storage backend was added.
- No database or vector-store adapter was added.
- No external user record was fabricated.
- No document was marked `human_reviewed: true`.
- Raw captures remain source evidence, not approved memory.

## Validation

Use:

```powershell
npm run cycle:check
npm run capture:check
npm run dashboard:check
npm run test
npm run validate:incr
npm run release:gate
```

## Next Version Prep

The next version can move from review UX to integration:

- extract a minimal SDK API
- add OWASP AISVS C8 mapping
- add a memory-write hook demo
- add benchmark reporting

Do not mix those into v1.5.x unless the review UX breaks without them.
