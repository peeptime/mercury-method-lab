# i18n UX Policy

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  audit_ref: docs/ITERATION-REQUEST-UI-AUDIT-2026-05-10.md
```

Mercury can keep technical fields in English, but user-visible guidance should be readable in the user's language.

## Default Rule

For Chinese users, the first visible layer should be Chinese.

Technical fields remain stable English identifiers.

## Layers

| Layer | Language rule |
|---|---|
| User-visible labels and buttons | Chinese first; English allowed as secondary. |
| Routing decisions | Bilingual, for example `quarantine / 隔离待复核`. |
| Technical fields | English only: `packet_hash`, `source_refs`, `audit_refs`. |
| Hover/help text | Chinese explanation with the English field name when useful. |
| Raw YAML/JSON | Do not translate field names. |

## Progressive Disclosure

The default user layer shows:

- routing decision
- content summary
- one or two key blockers
- Human Review Checklist

The technical layer shows:

- all blockers
- raw source refs and audit refs
- provenance
- packet hash
- full JSON/YAML

## Encoding Rule

All new files must be UTF-8.

If Chinese text appears as mojibake in a public file, treat it as a release blocker for user-facing surfaces.
