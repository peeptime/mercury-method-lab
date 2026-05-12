import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import { audit, auditMemoryWrite, buildAdmissionContract, buildEvidenceChain } from "../src/mercury-audit/index.mjs";

const iterations = Number(process.env.MERCURY_V2_BENCHMARK_ITERATIONS || process.argv[2] || 2000);
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const samples = [
  {
    content: "The user wants Markdown/YAML to remain the source of truth and HTML to remain the delivery layer.",
    context: {
      type: "memory_candidate",
      risk_level: "low",
      evidence_strength: "strong",
      source_refs: ["conversation:format-boundary"],
      audit_refs: ["docs/SCOPE.md"]
    }
  },
  {
    content: "The user always wants every AI output written into long-term memory.",
    context: {
      type: "memory_candidate",
      risk_level: "high",
      source_refs: [],
      audit_refs: []
    }
  },
  {
    content: "The integration demo is production-ready because the local test passed.",
    context: {
      scenario: "ai-coding",
      type: "agent_summary",
      risk_level: "medium",
      source_refs: ["test:local-output"],
      audit_refs: ["docs/PROOF-PACK-002.md"],
      boundary: "A local test is evidence for the tested path only."
    }
  },
  {
    content: "A customer delivery claim should be reviewed before reuse in future proposals.",
    context: {
      scenario: "enterprise-delivery",
      type: "customer_delivery",
      risk_level: "high",
      source_refs: ["field-note:customer-summary"],
      audit_refs: ["docs/SCENARIO-PACKS.md"]
    }
  }
];

const routingCounts = {};
const chainCounts = { total_claims: 0, total_missing_choices: 0, total_admission_contracts: 0 };
const start = performance.now();

for (let index = 0; index < iterations; index += 1) {
  const sample = samples[index % samples.length];
  const result = sample.context.type === "memory_candidate"
    ? auditMemoryWrite({ content: sample.content, ...sample.context })
    : audit(sample.content, sample.context);
  const chain = buildEvidenceChain(result.packet, result);
  const contract = buildAdmissionContract(chain, { choice_id: index % 3 === 0 ? "A" : index % 3 === 1 ? "B" : "C" });

  routingCounts[result.routing_decision] = (routingCounts[result.routing_decision] || 0) + 1;
  chainCounts.total_claims += chain.core_claim ? 1 : 0;
  chainCounts.total_missing_choices += chain.suggested_choices.length;
  chainCounts.total_admission_contracts += contract.contract_version ? 1 : 0;
}

const totalMs = performance.now() - start;
const summary = {
  version: packageJson.version,
  benchmark: "v2_audit_evidence_chain_admission_contract",
  iterations,
  total_ms: round(totalMs),
  average_ms_per_audit_chain_contract: round(totalMs / iterations),
  audit_chain_contracts_per_second: round((iterations / totalMs) * 1000),
  routing_counts: routingCounts,
  evidence_chain_counts: chainCounts,
  note: "Local structural benchmark only; no external LLM, browser, network, or storage adapter call is included."
};

console.log(JSON.stringify(summary, null, 2));

function round(value) {
  return Math.round(value * 100) / 100;
}
