# Agent-First Submission Layer

## Decision

The user submission layer should be agent-first, not CRUD-first.

This means the project should avoid building a large traditional backend around forms, accounts, queues, dashboards, and admin panels before the workflow proves itself.

Instead, use:

- markdown submissions
- small metadata frontmatter
- agent-readable queue envelopes
- thin import scripts
- explicit routing policy
- human review gates

## Why

Traditional requirement systems often turn an early reasoning project into a low-value web app backlog.

Mercury Method Lab should keep the high-value layer:

```text
submission -> route -> raw artifact -> clean -> decide -> audit -> memory/export
```

The interface can stay simple as long as agents and humans share the same protocol.

## Supported Actors

| Actor | How It Uses The Layer |
| --- | --- |
| Human user | Writes markdown in `submissions/viewpoints/` or opens a GitHub Issue. |
| Maintainer | Runs import scripts and reviews promoted artifacts. |
| OpenClaw-like local agent | Reads `submissions/agent-queue/*.json`, promotes files, and runs routes. |
| Hermes-like agent | Treats submissions as task envelopes and writes review artifacts. |
| GitHub Actions | Validates metadata, filename shape, and forbidden secrets. |

## Directory Contract

```text
submissions/
  viewpoints/
    *.md
  agent-queue/
    *.json
```

`submissions/` is a staging zone. It is not memory and not truth.

## Submission Metadata

Viewpoint markdown should include frontmatter:

```yaml
---
schema_version: "0.1"
submission_type: viewpoint
title: "Short title"
submitter: "optional name or handle"
license_intent: "review-only"
visibility: "public"
source_kind: "original"
routing_hint: "factual-cleaning"
created_at: "YYYY-MM-DD"
---
```

## Agent Envelope

Agents should use a queue envelope:

```json
{
  "schema_version": "0.1",
  "task_type": "promote-submission",
  "source_path": "submissions/viewpoints/example.md",
  "preferred_route": "factual-cleaning",
  "requested_outputs": ["raw_artifact", "routing_recommendation"],
  "human_review_required": true
}
```

## Promotion Rule

Promotion means copying a submission into `00_raw/` with metadata. It does not mean approving it.

After promotion:

1. Run factual cleaning or the route selected by `config/rule-routing.json`.
2. Keep uncertainty visible.
3. Create memory candidates only when reusable value exists.
4. Require audit for high-risk claims.

## OpenClaw / Hermes Guidance

Agents may:

- read submission frontmatter
- read queue envelopes
- run `npm run import:viewpoint -- <path>`
- create raw artifacts
- recommend a route
- create draft downstream artifacts

Agents must not:

- mark submissions as true
- import third-party text into durable memory without source review
- skip human review when `human_review_required` is true
- delete source submissions after promotion
- write directly into runtime memory from submissions

## Minimalism Rule

Do not build a database-backed submission portal until at least three repeated workflows prove that markdown + queue envelopes are insufficient.
