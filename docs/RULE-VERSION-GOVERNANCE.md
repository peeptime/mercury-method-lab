# Rule Version Governance

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: src/mercury-audit/rule-versioning.mjs
```

Mercury rules will change. That means a memory accepted under an old rule set cannot be treated as timelessly accepted.

## Current Rule Identity

```yaml
ruleset_version: 2026.05.10.1
sdk_surface: src/mercury-audit/rule-versioning.mjs
default_action_when_missing: re-audit required
```

The rule version is not a marketing version. It is the audit standard used when a route was produced.

## Required Fields For Durable Decisions

| Field | Meaning |
|---|---|
| `packet_id` | Stable id of the audited candidate. |
| `ruleset_version` | Rule version used when the route was assigned. |
| `evaluated_at` | Timestamp of the route. |
| `route` | `accept`, `revise`, `quarantine`, or `discard`. |
| `reviewer` | Human or host-system reviewer state. |
| `notes` | Why the route is still valid or needs review. |

## Re-Audit Triggers

| Trigger | Action |
|---|---|
| Missing `ruleset_version` | Re-audit before any durable use. |
| Older `ruleset_version` | Re-audit or preserve as historical-only. |
| New failure mode added to the same domain | Re-audit affected memories. |
| Source credibility floor changes | Re-audit accepted memories below the new floor. |
| Scenario pack changes risk posture | Re-audit packets in that scenario. |

## Migration Rule

Do not silently rewrite an old route. Store a new decision record with the new `ruleset_version`, link the old route, and state whether the result changed.

## SDK Surface

```js
import { createRuleVersionRecord, needsReaudit } from "mercury-method-lab";

const record = createRuleVersionRecord({ packet_id: "case_012", route: "revise" });
const review = needsReaudit(record);
```

If `needsReaudit(record).required` is true, host systems should block automatic promotion until the packet is re-evaluated.
