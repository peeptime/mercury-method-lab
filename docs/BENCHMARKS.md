# Benchmarks

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: scripts/benchmark_audit_sdk.mjs
```

Mercury's current benchmark is a local structural benchmark. It does not call an external LLM and should not be compared to LLM judge latency.

Run:

```powershell
npm run benchmark:audit
```

Optional iteration count:

```powershell
$env:MERCURY_BENCHMARK_ITERATIONS=5000
npm run benchmark:audit
```

Output:

```json
{
  "iterations": 1000,
  "total_ms": 0,
  "average_ms_per_audit": 0,
  "audits_per_second": 0,
  "routing_counts": {},
  "note": "Local structural benchmark only; no external LLM call is included."
}
```

The numeric values are environment-dependent and are not release success metrics. The benchmark exists so host-agent builders can estimate the overhead of putting Mercury before a memory write.

## Token-Cost Boundary

The SDK path is rule-based and local. It spends no model tokens by default.

Token cost appears only when a host system adds external fact retrieval, LLM review, or human-review summarization around Mercury. Those layers should be benchmarked separately.
