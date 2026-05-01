# V8 Mercury Architecture

## Position

Mercury is the local backend workspace for V8. It stores raw evidence, cleaned facts, uncertainty, memory candidates, decision logs, action plans, and audit reports.

Mercury is not the final judge. V8 produces structural judgment. Mercury preserves the chain of evidence and makes the judgment reusable, auditable, and revisable.

## Architecture Boundary

| Area | Responsibility | Must Not Do |
| --- | --- | --- |
| V8 method documents | Produce event judgment and structural interpretation | Store operational state |
| Mercury workspace | Store, validate, audit, and replay judgment artifacts | Override raw evidence |
| Skills | Transform one artifact type into the next | Decide and audit the same conclusion alone |
| Scripts | Sync, validate, smoke-test, and start local runtime | Hide manual state changes |
| Templates and schemas | Define required structure | Replace human judgment |
| MarkItDown | Convert external files and URLs into raw markdown | Decide whether converted content is true |

## Artifact Flow

```text
00_raw
  -> 01_segmented
  -> 02_cleaned
  -> 03_uncertain
  -> 04_memory_candidates
  -> 05_decision_logs
  -> 06_action_plans
  -> 07_audit_reports
  -> 10_exports
```

Every important judgment must keep enough artifacts to reconstruct why it was made, what it depends on, and when it should be reviewed.

## Optional Ingestion

MarkItDown is kept as an optional converter. It is not part of the default V8-Mercury flow because most current material is already markdown.

Open it only when external files or URLs need conversion into `00_raw/`:

```powershell
$env:MERCURY_MARKITDOWN_ENABLED="true"
npm run ingest:doc -- <file-or-url> [output-name]
```

The converted markdown is written to `00_raw/` with metadata. Later steps decide how to segment, clean, and audit it. Integration policy is recorded in [config/integrations.json](../config/integrations.json).

## State Model

Use explicit states for every reusable artifact:

| State | Meaning |
| --- | --- |
| `draft` | Created but not reviewed |
| `review_ready` | Complete enough for audit |
| `audited` | Checked by a separate audit step |
| `approved` | Safe to reuse in downstream work |
| `superseded` | Replaced by a newer artifact |
| `rejected` | Kept for traceability but not reusable |

State movement must leave a decision log or audit report. A rejected artifact should not be deleted unless it contains secrets or legally sensitive data.

## Iteration Rule

Small changes should improve one of three things:

1. Reproducibility: another person can run the same path.
2. Auditability: another person can inspect the same evidence.
3. Reversibility: a mistaken conclusion can be corrected without losing history.
