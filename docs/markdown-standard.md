# Markdown Standard

## Goal

Markdown files should be easy for humans to read and easy for local agents to parse.

## Required Shape

Every new operational markdown file should use this order:

```markdown
# Title

## Artifact Metadata

- schema_version: 0.1
- type:
- status:
- owner_role:
- source_refs:
- created_at:
- review_at:

## Conclusion

## Evidence

## Uncertainty

## Risks

## Next Actions
```

Use only the sections that fit the artifact type, but keep the order stable.

## Style Rules

- Start with one `#` heading.
- Keep section names stable.
- Put conclusion before evidence when the file is a decision or audit.
- Put original material before interpretation when the file is raw or cleaned evidence.
- Use relative links inside `v8-mercury-backend/`.
- Do not store real API keys, tokens, cookies, private keys, or bearer strings.
- Use `schema_version: 0.1` until the schema changes.

## Artifact Types

| Type | Directory |
| --- | --- |
| `raw` | `00_raw/` |
| `segmented` | `01_segmented/` |
| `cleaned` | `02_cleaned/` |
| `uncertain` | `03_uncertain/` |
| `memory_candidate` | `04_memory_candidates/` |
| `decision_log` | `05_decision_logs/` |
| `action_plan` | `06_action_plans/` |
| `audit_report` | `07_audit_reports/` |
| `export` | `10_exports/` |

