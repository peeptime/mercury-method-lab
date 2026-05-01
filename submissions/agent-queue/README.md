# Agent Queue

This directory is for agent-readable envelopes.

OpenClaw, Hermes-like agents, or future runtimes can inspect these files and decide whether to:

- validate a submission
- promote it into `00_raw/`
- run a route from `config/rule-routing.json`
- create a memory candidate
- request human review

Queue files should be JSON and should not contain secrets.

Example:

```json
{
  "schema_version": "0.1",
  "task_type": "promote-submission",
  "source_path": "submissions/viewpoints/2026-05-01-example.md",
  "preferred_route": "factual-cleaning",
  "requested_outputs": ["raw_artifact", "routing_recommendation"],
  "human_review_required": true
}
```
