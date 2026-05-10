# Iteration Guide 1.6.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/SDK-API.md
```

## Version

`1.6.0` - Pre-Storage Audit SDK

## Objective

Move Mercury from a repository-only method into a small integration reference that another agent or memory system can call before writing durable memory.

This release does not try to become a full product or SaaS. It creates the minimum standard-bearing bridge:

```text
host memory candidate -> Mercury SDK -> routing decision -> host store/quarantine
```

## Primary Changes

- `src/mercury-audit/index.mjs` exposes `audit`, `auditMemoryWrite`, `createAuditPacket`, and `shouldWriteMemory`.
- `src/mercury-audit/policy.mjs` adds `standard`, `strict`, and `advisory` policies.
- `examples/integration-demo/memory-write-hook.mjs` shows a host write hook accepting one candidate and blocking one candidate.
- `scripts/test_sdk_api.mjs` fixes the SDK contract in tests.
- `scripts/benchmark_audit_sdk.mjs` reports local structural audit overhead without external model calls.
- `docs/SDK-API.md`, `docs/OWASP-AISVS-C8-MAPPING.md`, `docs/INTEGRATION-DEMO.md`, and `docs/BENCHMARKS.md` define the integration and standard-mapping layer.

## What Did Not Change

- No public npm publish.
- No external database or vector-store adapter.
- No cloud service.
- No automatic memory promotion.
- No fabricated external charter user or human review state.

## Validation

Use:

```powershell
npm run test:sdk
npm run demo:memory-hook
npm run benchmark:audit
npm run cycle:check
npm run release:gate
```

## Next Version Prep

Possible future work:

- a real mem0/Zep/LangMem adapter after the local SDK contract stays stable
- a W3C PROV export shape
- more proof cases for code, chart, data, stale-memory, and multi-agent contamination
- external review of the OWASP C8 mapping

Avoid expanding dashboard UI until at least one integration path has external feedback.
