---
name: mercury-evidence-chain
description: Build a Mercury-style evidence chain from messy AI/user material. Use when a user wants source-linked claims, confidence basis, attribution, missing-evidence A/B/C choices, or a portable evidence-chain handoff before writing anything to durable memory.
---

# Mercury Evidence Chain

Turn raw material into a concise evidence chain that another human or agent can inspect without rereading the whole conversation.

## Workflow

1. Identify the core claim. Keep it narrow enough that a source can support or refute it.
2. Separate direct evidence from AI inference. Label user-provided facts, source excerpts, AI summaries, and assumptions differently.
3. Produce `source_refs` for observed material and `audit_refs` for the rule, checklist, or review basis used to judge it.
4. State the confidence basis in plain language. Do not inflate confidence because the claim sounds coherent.
5. Generate missing-evidence choices as A/B/C options:
   - A: provide stronger source evidence
   - B: narrow or rewrite the claim
   - C: quarantine the claim until review
6. Keep provenance explicit:

```yaml
human_reviewed: declined
reviewer: project_owner_pending
```

## Output Shape

```yaml
claim:
source_refs:
audit_refs:
evidence_chain:
  - claim_piece:
    supported_by:
    inference_level: direct | inferred | unsupported
confidence_basis:
missing_evidence_choices:
  A:
  B:
  C:
routing_hint: accept | revise | quarantine | discard
provenance:
  ai_assisted: true
  human_reviewed: declined
```

## Repo Commands

When working inside Mercury Method Lab, prefer:

```powershell
npm run test:evidence
npm run demo:starter
```

Use `buildEvidenceChain()` from `src/mercury-audit/evidence-chain.mjs` when code access is available.
