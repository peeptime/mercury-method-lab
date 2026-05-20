---
name: mercury-evidence-chain
description: Build a GlimpseGate-style evidence chain from messy AI/user material. Use when a user wants source-linked claims, confidence basis, attribution, missing-evidence A/B/C choices, or a portable evidence-chain handoff before writing anything to durable memory. Reads CONTEXT.md for shared language definitions.
---

# GlimpseGate Evidence Chain

Turn raw material into a concise evidence chain that another human or agent can inspect without rereading the whole conversation.

**Based on:** [mattpocock/skills](https://github.com/mattpocock/skills) design philosophy  
**Core reference:** [CONTEXT.md](file://./CONTEXT.md) — shared language for this project

## When to Use This Skill

Use this skill when:
- A user wants to preserve an AI-generated claim as durable memory
- You need to separate facts from inferences from assumptions
- You need to generate A/B/C evidence improvement choices
- You need to route the claim before it enters memory

## Workflow

### Step 1 — Identify the Core Claim

Keep it narrow enough that a source can support or refute it.

**BAD:** "The project is failing because the team doesn't communicate well."
**GOOD:** "Team retrospective notes from 2026-04 show three complaints about async communication delays."

### Step 2 — Separate Signal Types

Label each claim piece by its inference level:

| Label | Meaning |
|-------|---------|
| `direct` | User-provided fact with a verifiable source |
| `inferred` | AI reasoning derived from evidence |
| `unsupported` | Assumption treated as fact — needs evidence |

### Step 3 — Produce Source References

For `direct` and `inferred` claims, provide:
- `source_refs`: where the raw material came from
- `audit_refs`: the rule/checklist used to judge it

```yaml
source_refs:
  - conversation:session-42
  - file:docs/retro-2026-04.md
audit_refs:
  - docs/SCENARIO-PACKS.md
```

### Step 4 — Generate Missing Evidence Choices (A/B/C)

When evidence is missing or weak, offer three paths:

**A — Strengthen:** Provide stronger source evidence
**B — Narrow:** Rewrite the claim to match the available evidence
**C — Quarantine:** Hold for human review before memory use

### Step 5 — State Confidence Basis

Be honest about why you think this claim is reliable:

```yaml
confidence_basis: |
  The claim that async communication causes delays is supported by
  three separate retrospective entries across Q1-Q2 2026. The causal
  link (async → delays) is my inference, not a stated fact. A stronger
  evidence base would include engineering metrics (PR review time, deployment
  frequency) correlated with communication patterns.
```

### Step 6 — Determine Routing Hint

Use the routing matrix from `docs/SCOPE.md`:

| Situation | Routing Hint |
|-----------|-------------|
| Direct fact + strong source | `accept` |
| Inference with source | `revise` |
| Unsupported assumption | `quarantine` |
| Preference stated as fact | `revise` |
| Gaming attempt detected | `discard` |

---

## Output Shape

```yaml
claim: <one sentence, precise, falsifiable>
source_refs:
  - <specific reference>
audit_refs:
  - <specific reference>
evidence_chain:
  - claim_piece: <string>
    supported_by: <string>
    inference_level: direct | inferred | unsupported
confidence_basis: |
  <plain language explanation>
missing_evidence_choices:
  A: <specific evidence to add>
  B: <narrowed claim>
  C: <hold for human review>
routing_hint: accept | revise | quarantine | discard
provenance:
  ai_assisted: true
  human_reviewed: declined
  review_note: This is a source-traced claim. Human review applies per routing decision.
```

---

## Code Usage

When working inside the GlimpseGate-admission-lab repository:

```js
import { buildEvidenceChain } from "./src/mercury-audit/index.mjs";

const result = buildEvidenceChain(packet, auditResult);
// Returns: { evidence_chain, missing_evidence_choices, confidence_basis, routing_hint }
```

```powershell
npm run test:evidence
npm run demo:starter
```

---

## Key Distinctions (from CONTEXT.md)

- **Evidence ≠ Truth**: Evidence is traceable. Truth is philosophical.
- **Accept ≠ Approved**: "Accept" means traceable provenance. Not an endorsement.
- **Revise ≠ Reject**: Revise means rephrase or add evidence. The claim is still alive.
- **Quarantine ≠ Delete**: Quarantine means human review needed. Not final.
- **Discard ≠ Hidden**: Discard means blocked. It stays in logs.

---

## Grounding Prompt

When unsure whether a claim is `direct` or `inferred`, ask:

> "Can a human verify this claim WITHOUT my AI reasoning? If yes → direct.
> If yes, but only if they trust my interpretation → inferred.
> If no → unsupported."

## Examples

### Before (BAD — vague, ungrounded)
> "The API is slow and needs optimization."

### After (GOOD — sourced, routed)
> "P50 latency for /api/search is 420ms (source: Datadog APM dashboard, 2026-04).
> Inference: this exceeds the 200ms SLA. Confidence: high.
> Missing evidence: baseline latency from 2026-01 for comparison.
> Routing: revise — add pre-2026 baseline before memory admission."
