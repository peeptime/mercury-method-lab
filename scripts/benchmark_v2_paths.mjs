/**
 * benchmark_v2_paths.mjs
 *
 * v2.1.6 Performance Benchmark
 *
 * Benchmarks all 5 core SDK functions individually and as an end-to-end pipeline.
 * Saves a baseline record to data/benchmark-baseline.json for trend comparison.
 *
 * Usage:
 *   node scripts/benchmark_v2_paths.mjs [iterations]
 *   MERCURY_V2_BENCHMARK_ITERATIONS=5000 node scripts/benchmark_v2_paths.mjs
 */

import { performance } from "node:perf_hooks";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { audit, auditMemoryWrite, buildAdmissionContract, buildEvidenceChain, verifyAuditStability, applyStabilityGate } from "../src/mercury-audit/index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const baselinePath = join(root, "data", "benchmark-baseline.json");
const iterations = Number(process.env.MERCURY_V2_BENCHMARK_ITERATIONS || process.argv[2] || 2000);

// ── Test fixtures ───────────────────────────────────────────────
const memoryCandidate = {
  content: "The user wants Markdown/YAML to remain the source of truth and HTML to remain the delivery layer.",
  type: "memory_candidate",
  risk_level: "low",
  evidence_strength: "strong",
  source_refs: ["conversation:format-boundary"],
  audit_refs: ["docs/SCOPE.md"]
};

const agentSummary = {
  content: "Integration demo is production-ready because local test passed.",
  scenario: "ai-coding",
  type: "agent_summary",
  risk_level: "medium",
  source_refs: ["test:local-output"],
  audit_refs: ["docs/PROOF-PACK-002.md"],
  boundary: "A local test is evidence for the tested path only."
};

const customerDelivery = {
  content: "Customer delivery claim should be reviewed before reuse in future proposals.",
  scenario: "enterprise-delivery",
  type: "customer_delivery",
  risk_level: "high",
  source_refs: ["field-note:customer-summary"],
  audit_refs: ["docs/SCENARIO-PACKS.md"]
};

const fixtures = [memoryCandidate, agentSummary, customerDelivery];

// ── Per-function benchmark helper ────────────────────────────────
function benchmark(name, fn, warmup = 3) {
  // Warmup
  for (let w = 0; w < warmup; w++) fn(fixtures[w % fixtures.length]);
  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(fixtures[i % fixtures.length]);
  }
  const totalMs = performance.now() - start;
  return {
    name,
    iterations,
    total_ms: round(totalMs),
    avg_ms: round(totalMs / iterations),
    ops_per_sec: round((iterations / totalMs) * 1000),
  };
}

// ── Run individual benchmarks ───────────────────────────────────
const auditResult = benchmark("audit", (ctx) => audit(ctx.content, ctx));
const memoryWriteResult = benchmark("auditMemoryWrite", (ctx) => auditMemoryWrite(ctx));
const evidenceChainResult = benchmark("buildEvidenceChain", (ctx) => {
  const r = auditMemoryWrite(ctx);
  return buildEvidenceChain(r.packet, r);
});
const admissionContractResult = benchmark("buildAdmissionContract", (ctx) => {
  const r = auditMemoryWrite(ctx);
  const chain = buildEvidenceChain(r.packet, r);
  return buildAdmissionContract(chain, { choice_id: "A" });
});
const stabilityResult = benchmark("verifyAuditStability", (ctx) => {
  const r1 = auditMemoryWrite(ctx);
  const r2 = auditMemoryWrite(ctx);
  return verifyAuditStability(r1, { secondAudit: r2 });
});

// ── Pipeline benchmark (full end-to-end) ───────────────────────
function runPipeline(ctx) {
  const r = auditMemoryWrite(ctx);
  const chain = buildEvidenceChain(r.packet, r);
  const contract = buildAdmissionContract(chain, { choice_id: "A" });
  const stability = verifyAuditStability(r, { secondAudit: r });
  applyStabilityGate(r, stability);
  return contract;
}

const pipelineResult = benchmark("full_pipeline", runPipeline);

// ── Load previous baseline ──────────────────────────────────────
let previous = null;
try {
  if (existsSync(baselinePath)) {
    previous = JSON.parse(readFileSync(baselinePath, "utf8"));
  }
} catch { /* ignore */ }

// ── Compare with previous baseline ─────────────────────────────
function diff(current, prev) {
  if (!prev) return null;
  const pct = round(((current.avg_ms - prev.avg_ms) / prev.avg_ms) * 100);
  return { previous_avg_ms: prev.avg_ms, change_pct: pct, direction: pct > 0 ? "slower" : pct < 0 ? "faster" : "same" };
}

const results = {
  version: JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version,
  timestamp: new Date().toISOString(),
  node_version: process.version,
  iterations,
  functions: {
    audit: auditResult,
    auditMemoryWrite: memoryWriteResult,
    buildEvidenceChain: evidenceChainResult,
    buildAdmissionContract: admissionContractResult,
    verifyAuditStability: stabilityResult,
    full_pipeline: pipelineResult,
  },
  comparison: {
    vs_previous: {
      audit: diff(auditResult, previous?.functions?.audit),
      auditMemoryWrite: diff(memoryWriteResult, previous?.functions?.auditMemoryWrite),
      buildEvidenceChain: diff(evidenceChainResult, previous?.functions?.buildEvidenceChain),
      buildAdmissionContract: diff(admissionContractResult, previous?.functions?.buildAdmissionContract),
      verifyAuditStability: diff(stabilityResult, previous?.functions?.verifyAuditStability),
      full_pipeline: diff(pipelineResult, previous?.functions?.full_pipeline),
    }
  },
  note: "Local structural benchmark. No external LLM, browser, network, or storage adapter included."
};

// ── Save baseline ───────────────────────────────────────────────
try {
  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(baselinePath, JSON.stringify({ timestamp: results.timestamp, functions: results.functions }, null, 2), "utf8");
} catch { /* ignore */ }

// ── Print results ──────────────────────────────────────────────
console.log(JSON.stringify(results, null, 2));

// Pretty-print summary table
console.log("\n" + "─".repeat(70));
console.log("  Function               avg_ms    ops/sec    vs_prev");
console.log("─".repeat(70));
for (const [name, r] of Object.entries(results.functions)) {
  const d = results.comparison.vs_previous[name];
  const prev = d ? `  ${d.change_pct > 0 ? "+" : ""}${d.change_pct}%` : "        -";
  console.log(`  ${name.padEnd(22)} ${String(r.avg_ms).padStart(7)}ms  ${String(r.ops_per_sec).padStart(7)}/s${prev}`);
}
console.log("─".repeat(70));
console.log(`  Iterations: ${iterations}  |  Node: ${process.version}  |  v${results.version}`);
console.log("");

function round(v) { return Math.round(v * 100) / 100; }
