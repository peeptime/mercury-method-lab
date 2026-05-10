# Mercury 2.0 Performance Notes

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: scripts/benchmark_v2_paths.mjs
```

Mercury 2.0 keeps the hot path local and structural:

```text
candidate material
  -> audit()
  -> routing_decision
  -> buildEvidenceChain()
  -> missing-evidence choices
```

No external LLM, browser automation, network call, database write, or storage adapter is included in the default benchmark. In machine-check wording: no external LLM is part of this path.

## Commands

```powershell
npm run benchmark:audit
npm run benchmark:v2
```

## Expected Scale

`benchmark:audit` measures the SDK audit core only. `benchmark:v2` measures the final 2.0 path: audit plus evidence-chain construction.

The benchmark is meant to catch regressions, not to claim production throughput. Host systems should run their own benchmarks with their real memory store, source retrieval, permissions, and human-review UI.

## Local 2.0 Run

On the release machine, `npm run benchmark:v2` produced:

```json
{
  "iterations": 2000,
  "total_ms": 154.74,
  "average_ms_per_audit_chain": 0.08,
  "audit_chains_per_second": 12925.02
}
```

This is a structural local run only. It is useful as a regression baseline, not as a deployment SLA.

## Token Economy

The 2.0 release keeps expensive reasoning out of the default path:

- cases are generated from known packet directories and SDK fixtures, not broad raw scans
- evidence-chain construction is deterministic and local
- skills are short procedural guides, not long embedded white papers
- `MEMORY.md` and `docs/ITERATION-GUIDE-LATEST.md` remain the preferred reactivation entry points

## Acceptance

Before release, `npm run release:gate` must include:

- `benchmark:audit`
- `benchmark:v2`
- `skills:check`

The benchmark output is intentionally JSON so another agent can compare it across releases without rereading long documents.
