---
name: mercury-memory-gate
description: Audit a candidate memory before durable storage. Use when deciding whether an AI-generated conclusion, user preference, project rule, agent summary, or delivery note should be accepted, revised, quarantined, or discarded before entering long-term memory.
---

# Mercury Memory Gate

Use this skill as a pre-storage gate. It decides whether a memory candidate deserves to be retained, not whether it sounds useful.

## Routing Rules

1. Require `source_refs`. Without source references, do not `accept`.
2. Require `audit_refs` for durable memory writes. Without audit references, choose `revise` or `quarantine`.
3. Treat absolute claims such as `always`, `never`, `only`, `must`, `all`, `only`, `must`, and `always` as overgeneralization unless evidence is strong.
4. Raise strictness for `memory_candidate`, `long_term_rule`, `user_profile_update`, and `project_positioning`.
5. Mark high-risk customer, legal, medical, investment, or enterprise-delivery material as `human_review_required`.
6. Never flip provenance to true on behalf of an AI:

```yaml
human_reviewed: declined
reviewer: project_owner_pending
```

## Decision Output

```yaml
routing_decision: accept | revise | quarantine | discard
failure_modes:
blockers:
warnings:
required_fixes:
required_evidence:
human_review_required:
memory_write_allowed: true | false
provenance:
  ai_assisted: true
  human_reviewed: declined
```

## Repo Commands

When working inside Mercury Method Lab, prefer:

```powershell
npm run test:sdk
npm run demo:memory-hook
npm run demo:openclaw
```

Use `auditMemoryWrite()` and `shouldWriteMemory()` from `src/mercury-audit/index.mjs` when code access is available.
