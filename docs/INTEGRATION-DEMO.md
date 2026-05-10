# Integration Demo

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/SDK-API.md
```

The v1.6.0 demo proves the smallest useful host integration:

```text
AI output -> Mercury audit -> memory write OR quarantine
```

Run:

```powershell
npm run demo:memory-hook
```

Expected shape:

```text
MEMORY_WRITE_BLOCKED demo_unsupported_memory decision=quarantine ...
MEMORY_WRITE_ACCEPTED demo_supported_memory decision=accept
```

## What It Demonstrates

- Host systems can call Mercury without reading the repository's internal directory structure.
- Unsupported durable-memory claims are blocked before they reach the store.
- Supported, bounded claims can pass with provenance attached.
- Quarantine is a first-class route, not an error state.

## What It Does Not Demonstrate

- It does not connect to mem0, Zep, Letta, LangMem, or a vector database.
- It does not claim production readiness.
- It does not run LLM-based fact verification.
- It does not decide enterprise policy.

The demo is intentionally small so a framework maintainer can see the control point in under five minutes.
