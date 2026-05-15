# Audit Kernel

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/ITERATION-GUIDE-1.7.0.md
```

Mercury's v1.7 kernel separates the author's local workflow from the portable audit mechanism.

The SDK no longer exposes only a thin wrapper around scripts. It now runs a kernel made of five explicit layers:

```text
audit packet
  -> structural audit
  -> source credibility
  -> lifecycle state
  -> reviewer disagreement
  -> profile / standard / policy enforcement
```

## Kernel Modules

| Module | Purpose |
|---|---|
| `profiles.mjs` | Defines audit postures such as reality sync, correction, and external auditor. |
| `standards.mjs` | Defines evidence floors, stale windows, and disagreement requirements. |
| `source-credibility.mjs` | Classifies sources as primary/direct, traceable, secondary, AI-generated, or unknown. |
| `lifecycle.mjs` | Marks memory candidates as active, review due, expired, or retired. |
| `disagreement.mjs` | Detects reviewer route conflict and escalates unresolved disagreement. |
| `kernel.mjs` | Runs all layers and returns one portable audit result. |

## Why This Matters

Before v1.7, Mercury could say "use the SDK," but most judgment still lived in the repository's scripts and docs.

After v1.7, a host team can bring its own:

- audit profile
- audit standard
- source floor
- reviewer records
- lifecycle timing

The Mercury discipline remains the same: no durable memory without source, audit path, routing decision, and provenance.

## Minimal Example

```js
import { audit } from "@GlimpseGate/admission-lab";

const result = audit("The customer approved the migration plan.", {
  type: "customer_delivery",
  source_refs: ["field-note:customer-call"],
  audit_refs: ["signed-review:delivery-lead"],
  profile: "external-auditor",
  standard: "high-risk-memory",
  reviews: [
    { reviewer: "delivery-lead", routing_decision: "accept" },
    { reviewer: "security-reviewer", routing_decision: "quarantine" }
  ]
});

console.log(result.routing_decision);
console.log(result.kernel.disagreement.escalation_required);
```

## Non-Claims

- The kernel is not a legal, medical, or financial compliance system.
- Built-in profiles and standards are examples, not universal defaults.
- Source credibility is a deterministic heuristic, not truth verification.
- Reviewer disagreement detection records conflict; it does not replace human judgment.
