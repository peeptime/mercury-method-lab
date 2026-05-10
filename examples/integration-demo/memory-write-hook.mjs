import { auditMemoryWrite, shouldWriteMemory } from "../../src/mercury-audit/index.mjs";

const store = [];
const quarantine = [];

const candidates = [
  {
    id: "demo_unsupported_memory",
    content: "The user always wants every future agent output stored permanently.",
    type: "memory_candidate",
    risk_level: "high",
    source_refs: [],
    audit_refs: []
  },
  {
    id: "demo_supported_memory",
    content: "The user wants Markdown/YAML to remain the source of truth and HTML to remain a delivery layer.",
    type: "memory_candidate",
    risk_level: "low",
    evidence_strength: "strong",
    source_refs: ["conversation:2026-05-10-format-boundary"],
    audit_refs: ["docs/SCOPE.md"]
  }
];

for (const candidate of candidates) {
  const result = auditMemoryWrite(candidate);
  if (shouldWriteMemory(result)) {
    store.push({
      id: candidate.id,
      content: candidate.content,
      provenance: result.provenance
    });
    console.log(`MEMORY_WRITE_ACCEPTED ${candidate.id} decision=${result.routing_decision}`);
  } else {
    quarantine.push({
      id: candidate.id,
      content: candidate.content,
      decision: result.routing_decision,
      failure_modes: result.failure_modes
    });
    console.log(`MEMORY_WRITE_BLOCKED ${candidate.id} decision=${result.routing_decision} blockers=${result.failure_modes.join(",")}`);
  }
}

console.log(JSON.stringify({
  accepted: store.length,
  blocked: quarantine.length,
  accepted_ids: store.map((entry) => entry.id),
  blocked_ids: quarantine.map((entry) => entry.id)
}, null, 2));

if (store.length !== 1 || quarantine.length !== 1) {
  process.exitCode = 1;
}
