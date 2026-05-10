# Export Guide

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  audit_ref: docs/SCOPE.md
```

Mercury exports audit evidence. It does not own your permanent storage layer.

## Export Formats

| Format | Use |
|---|---|
| Markdown | Human review, GitHub issues, docs, Obsidian, Logseq |
| JSON | Programmatic integration, SDK tests, policy engines |
| HTML | Human-readable audit reports and demos |

## Common Commands

```powershell
npm run audit
npm run report
npm run export:memory -- --include-archive
```

## Recommended Destinations

| Destination | Recommendation |
|---|---|
| GitHub | Store proof packs, standards, review ledgers, and release history. |
| Obsidian / Logseq | Store reviewed Markdown reports and decision notes. |
| Notion / Google Docs | Share human review checklists with non-technical collaborators. |
| Agent memory systems | Ingest only accepted or reviewed outputs; keep quarantine excluded from retrieval. |
| Vector databases | Treat Mercury output as admission evidence, not as a replacement for access control. |

## What Not To Export As Memory

Do not promote these without human review:

- raw captures
- Lite Mode drafts
- packets with `missing_source_refs`
- packets with `unsafe_memory_write`
- packets where `human_reviewed` is `declined` or `pending`

## Portable Review Record

When a human reviewer uses an HTML or Lite checklist, the exported review record should preserve:

```yaml
packet_id:
reviewer:
reviewed_at:
human_reviewed: pending
checklist_choices:
  source-statement:
  confidence-statement:
  attribution-statement:
review_note:
```

Only set `human_reviewed: true` after a named human reviewer accepts the content.
