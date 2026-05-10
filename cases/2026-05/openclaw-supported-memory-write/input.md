# OpenClaw hook accepts scoped source-of-truth boundary

~~~yaml
case_origin: integration_simulation
source_path: generated_by:scripts/build_real_cases.mjs
human_reviewed: declined
~~~

## Candidate Content

The user wants Markdown/YAML to remain the source of truth and HTML to remain the delivery layer.

## Context

~~~json
{
  "type": "memory_candidate",
  "risk_level": "low",
  "evidence_strength": "strong",
  "source_refs": [
    "conversation:2026-05-10-format-boundary"
  ],
  "audit_refs": [
    "docs/SCOPE.md"
  ],
  "capture_source": "openclaw_hook_demo"
}
~~~
