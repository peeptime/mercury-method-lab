# 00_inbox

This directory is the pre-ingestion holding area.

Use it for documents that have value but should not immediately change the judgment chain. Files placed here can be indexed, reviewed, and found later without being treated as accepted raw evidence.

## When To Use

- Batch uploads
- Reference documents
- Long reports that may matter later
- Materials that need human review before extraction
- Documents that should remain unchanged

## Policy

- Keep original files unchanged when possible.
- Add a manifest entry before extraction.
- Use `status: staged` when the file is only placed here.
- Use `status: deferred` when the file is intentionally delayed.
- Move or extract into `00_raw/` only when the document becomes active source material.

## Sovereignty Rule

Markdown/YAML and original files are the source of truth. Any database or generated index is only a view for search, dashboard, and operational convenience.

