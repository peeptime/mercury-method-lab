import { performance } from "node:perf_hooks";
import { audit } from "../src/mercury-audit/index.mjs";

const iterations = Number(process.env.MERCURY_BENCHMARK_ITERATIONS || process.argv[2] || 1000);
const candidates = [
  {
    content: "The user wants AI memory writes to preserve source references before promotion.",
    context: {
      type: "memory_candidate",
      risk_level: "low",
      evidence_strength: "strong",
      source_refs: ["conversation:benchmark-supported"],
      audit_refs: ["docs/SDK-API.md"]
    }
  },
  {
    content: "The user always wants every AI summary stored as durable truth.",
    context: {
      type: "memory_candidate",
      risk_level: "high",
      source_refs: [],
      audit_refs: []
    }
  },
  {
    content: "A customer delivery note may be useful, but it needs explicit human review.",
    context: {
      type: "customer_delivery",
      risk_level: "medium",
      source_refs: ["field-note:benchmark"],
      audit_refs: ["review-note:benchmark"]
    }
  }
];

const counts = {};
const start = performance.now();
for (let index = 0; index < iterations; index += 1) {
  const sample = candidates[index % candidates.length];
  const result = audit(sample.content, sample.context);
  counts[result.routing_decision] = (counts[result.routing_decision] || 0) + 1;
}
const totalMs = performance.now() - start;

const summary = {
  iterations,
  total_ms: round(totalMs),
  average_ms_per_audit: round(totalMs / iterations),
  audits_per_second: round((iterations / totalMs) * 1000),
  routing_counts: counts,
  note: "Local structural benchmark only; no external LLM call is included."
};

console.log(JSON.stringify(summary, null, 2));

function round(value) {
  return Math.round(value * 100) / 100;
}
