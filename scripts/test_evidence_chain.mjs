import assert from "node:assert/strict";
import { audit, buildEvidenceChain, buildMissingEvidence } from "../src/mercury-audit/index.mjs";

const unsupported = audit("The user always wants all AI outputs retained permanently.", {
  id: "evidence_chain_unsupported",
  type: "memory_candidate",
  risk_level: "high",
  source_refs: [],
  audit_refs: []
});

const chain = buildEvidenceChain(unsupported);
assert.equal(chain.routing_decision, "quarantine");
assert.equal(chain.core_claim.includes("always"), true);
assert.equal(chain.missing_evidence.some((gap) => gap.id === "missing_source_refs"), true);
assert.equal(chain.suggested_choices.some((choice) => choice.gap_id === "missing_source_refs"), true);
assert.equal(chain.provenance.human_reviewed, "declined");

const direct = buildEvidenceChain("A draft claim without refs.");
assert.equal(direct.missing_evidence.some((gap) => gap.id === "missing_source_refs"), true);
assert.equal(direct.missing_evidence.some((gap) => gap.id === "missing_audit_refs"), true);

const gaps = buildMissingEvidence({
  failureModes: ["unsafe_memory_write", "overgeneralization"]
});
assert.equal(gaps.length, 2);

console.log("OK evidence chain tests passed");

