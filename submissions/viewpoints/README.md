# Viewpoint Submissions

Put user viewpoint markdown here.

Recommended filename:

```text
YYYY-MM-DD-short-slug.md
```

Recommended frontmatter:

```yaml
---
schema_version: "0.1"
submission_type: viewpoint
title: "Short title"
submitter: "optional name or handle"
license_intent: "review-only"
visibility: "public"
source_kind: "original"
routing_hint: "factual-cleaning | structural-judgment | content-commercial-diagnosis | action-translation"
created_at: "YYYY-MM-DD"
---
```

The body can be free-form markdown.

## Promotion

Use:

```powershell
npm run import:viewpoint -- submissions/viewpoints/YYYY-MM-DD-short-slug.md
```

The script copies the submission into `00_raw/` with source metadata. It does not judge whether the viewpoint is true.
