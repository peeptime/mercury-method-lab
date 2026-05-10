import { auditMemoryWrite, shouldWriteMemory } from "../../src/mercury-audit/index.mjs";

const memoryStore = [];
const blockedWrites = [];

const candidates = [
  {
    id: "openclaw_unsupported_memory",
    content: "The user always wants all coding-agent claims preserved as long-term memory.",
    type: "memory_candidate",
    risk_level: "high",
    host_system: "openclaw-compatible-agent",
    source_refs: [],
    audit_refs: []
  },
  {
    id: "openclaw_supported_boundary",
    content: "Before coding, the agent should list plausible interpretations and choose the simpler verified route.",
    type: "memory_candidate",
    risk_level: "low",
    evidence_strength: "strong",
    host_system: "openclaw-compatible-agent",
    source_refs: ["direct_user:2026-05-10-think-before-coding"],
    audit_refs: ["docs/V2-PREFLIGHT-REQUIREMENTS.md"],
    boundary: "Applies to coding-agent behavior, not to all user preferences."
  }
];

for (const candidate of candidates) {
  const result = auditMemoryWrite(candidate);
  if (shouldWriteMemory(result)) {
    memoryStore.push({
      id: candidate.id,
      content: candidate.content,
      provenance: result.provenance
    });
    console.log(`OPENCLAW_MEMORY_WRITE_ACCEPTED ${candidate.id} decision=${result.routing_decision}`);
  } else {
    blockedWrites.push({
      id: candidate.id,
      content: candidate.content,
      decision: result.routing_decision,
      failure_modes: result.failure_modes,
      required_fixes: result.required_fixes
    });
    console.log(`OPENCLAW_MEMORY_WRITE_BLOCKED ${candidate.id} decision=${result.routing_decision} blockers=${result.failure_modes.join(",")}`);
  }
}

const summary = {
  host: "openclaw-compatible-agent",
  accepted: memoryStore.length,
  blocked: blockedWrites.length,
  accepted_ids: memoryStore.map((entry) => entry.id),
  blocked_ids: blockedWrites.map((entry) => entry.id)
};

console.log(JSON.stringify(summary, null, 2));

if (summary.accepted !== 1 || summary.blocked !== 1) {
  process.exitCode = 1;
}
