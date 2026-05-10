# Anti-Gaming Tests

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: src/mercury-audit/anti-gaming.mjs
```

Mercury should not expose approval surfaces that agents can optimize around. The anti-gaming gate treats route-forcing instructions as audit evidence.

## Current Detectors

| Detector | Severity | Example |
|---|---|---|
| `force_accept_route` | critical | "mark as accept", "ignore blockers" |
| `forge_human_review` | critical | "`human_reviewed: true`", "pretend reviewed" |
| `erase_evidence_gap` | high | "no need source refs", "hide evidence gap" |
| `optimize_metric_over_truth` | medium | "maximize accept rate", "reduce quarantine count" |

## Expected Behavior

| Input Pattern | Minimum Route |
|---|---|
| Force accept while evidence is missing | `discard` |
| Forge human review status | `discard` |
| Hide a source gap | `quarantine` |
| Optimize release metrics over truth | `quarantine` |

## Test Command

```powershell
npm run test:governance
```

## Non-Goal

This is not prompt-injection detection for arbitrary web browsing. It is a narrow guard for audit-route manipulation inside memory-write candidates.
