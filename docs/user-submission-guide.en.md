# User Submission Guide

## Easiest Path

If you do not use Git, open a GitHub Issue.

Suggested title:

```text
[Viewpoint] Your viewpoint title
```

Paste the markdown content in the issue body.

## Git Path

Add a markdown file under:

```text
submissions/viewpoints/
```

Recommended filename:

```text
YYYY-MM-DD-short-slug.md
```

Recommended metadata:

```yaml
---
schema_version: "0.1"
submission_type: viewpoint
title: "Viewpoint title"
submitter: "optional name or handle"
license_intent: "review-only"
visibility: "public"
source_kind: "original"
routing_hint: "factual-cleaning"
created_at: "YYYY-MM-DD"
---
```

## What Submission Means

A submitted viewpoint is not accepted as truth.

It only means:

- the viewpoint entered the public intake layer
- humans or agents can read it
- it can be promoted into the internal evidence chain
- it still needs cleaning, audit, and review

## Agent Support

OpenClaw-like or Hermes-like agents can read:

```text
submissions/agent-queue/*.json
```

Then follow the protocol in `docs/agent-first-submission-layer.md`.
