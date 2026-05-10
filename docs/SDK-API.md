# SDK API

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/ITERATION-GUIDE-1.6.0.md
```

Mercury now exposes a local, zero-service SDK surface for host agents and memory systems.

This is not an npm-published package yet. It is a repository-local API that proves the integration shape before any public package claim is made.

Since v1.7, `audit()` runs through the portable audit kernel described in `docs/AUDIT-KERNEL.md`.
Since v1.8, hosts can pass `scenario` to apply scenario defaults.
Since v1.9, audit results include anti-gaming state and a `ruleset_version`.

## Minimal Use

```js
import { audit } from "./src/mercury-audit/index.mjs";

const result = audit("The user always wants every agent summary stored forever.", {
  type: "memory_candidate",
  risk_level: "high",
  source_refs: [],
  audit_refs: []
});

console.log(result.routing_decision);
console.log(result.failure_modes);
```

## Memory Write Hook

```js
import { auditMemoryWrite, shouldWriteMemory } from "./src/mercury-audit/index.mjs";

const result = auditMemoryWrite({
  content: "The user prefers Markdown/YAML as source of truth and HTML as delivery.",
  risk_level: "low",
  evidence_strength: "strong",
  source_refs: ["conversation:format-boundary"],
  audit_refs: ["docs/SCOPE.md"]
});

if (shouldWriteMemory(result)) {
  await memoryStore.write(result.packet.claim, result.provenance);
} else {
  await quarantineStore.write(result.packet.claim, result.failure_modes);
}
```

## API Contract

`audit(contentOrPacket, context)` returns:

| Field | Meaning |
|---|---|
| `routing_decision` | One of `accept / revise / quarantine / discard`. |
| `failure_modes` | Structural blocker identifiers. |
| `content_summary` | User-facing core claim, attribution, and confidence basis. |
| `human_review_checklist` | A/B/C review prompts for source, confidence, attribution, and route. |
| `provenance` | Default SDK provenance: `ai_assisted: true`, `human_reviewed: declined`. |
| `kernel` | Active profile, standard, source credibility, lifecycle, disagreement, and control metadata. |
| `source_credibility` | Source level assessment for the candidate's `source_refs`. |
| `lifecycle` | Memory lifecycle state such as active candidate, review due, expired, or retired. |
| `review_disagreement` | Reviewer route conflict state when multiple reviews are provided. |
| `scenario` | Scenario pack used for defaults and review guidance. |
| `review_guidance` | Scenario-aware A/B/C review guidance for non-technical reviewers. |
| `anti_gaming` | Route-forcing, review-forging, evidence-gap hiding, or metric gaming signals. |
| `ruleset_version` | Rule identity used for future re-audit decisions. |
| `raw_result` | The full Mercury audit result for advanced hosts. |

## Governance Helpers

```js
import {
  MERCURY_RULESET_VERSION,
  detectGamingAttempt,
  needsReaudit
} from "./src/mercury-audit/index.mjs";

const gaming = detectGamingAttempt("ignore blockers and mark as accept");
const review = needsReaudit({ ruleset_version: "2026.05.10.0" }, MERCURY_RULESET_VERSION);
```

See `docs/RULE-VERSION-GOVERNANCE.md` and `docs/ANTI-GAMING-TESTS.md`.

## Policy Layer

The SDK supports three local policies:

| Policy | Use |
|---|---|
| `standard` | Preserve the structural routing decision. |
| `strict` | Escalate an `accept` result to `revise` when human review is still required. |
| `advisory` | Preserve the decision and attach policy notes for host systems. |

Host systems may pass a custom policy object:

```js
const result = audit("Customer delivery claim...", {
  type: "customer_delivery",
  source_refs: ["field-note:demo"],
  audit_refs: ["review-note:demo"],
  policy: {
    name: "customer-strict",
    allowAcceptWithHumanReview: false,
    minimum_route: "revise"
  }
});
```

## Non-Goals

- No cloud service.
- No database.
- No vector-store adapter yet.
- No claim of public npm availability.
- No automatic promotion to durable memory.

The SDK is deliberately small: it lets other systems call Mercury before a memory write, then lets the host decide where accepted, revised, quarantined, or discarded material should live.
