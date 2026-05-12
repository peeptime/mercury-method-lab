import assert from "node:assert/strict";
import { audit, buildAdmissionContract, buildEvidenceChain, buildMissingEvidence } from "../src/mercury-audit/index.mjs";

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
assert.equal(chain.suggested_choices[0].options.every((option) => option.admission_policy), true);
assert.equal(chain.provenance.human_reviewed, "declined");

const contract = buildAdmissionContract(chain, {
  gap_id: "missing_source_refs",
  choice_id: "B",
  reviewer: "project_owner_pending"
});
assert.equal(contract.selected_choice.choice_id, "B");
assert.equal(contract.admitted_object.object_type, "interpretation");
assert.equal(contract.future_usage_policy.can_use_as_fact, false);
assert.equal(contract.future_usage_policy.can_participate_in_reasoning, true);
assert.equal(contract.forbidden_uses.includes("factual_citation"), true);
assert.equal(contract.source_material.preserved_as_source, true);
assert.equal(contract.model_framing.framing_is_memory_object, true);
assert.equal(contract.user_judgment.human_reviewed, "declined");

const unresolvedContract = buildAdmissionContract(chain, {
  gap_id: "unsafe_memory_write",
  choice_id: "C"
});
assert.equal(unresolvedContract.admitted_object.object_type, "open_question");
assert.equal(unresolvedContract.future_usage_policy.can_participate_in_reasoning, false);

const direct = buildEvidenceChain("A draft claim without refs.");
assert.equal(direct.missing_evidence.some((gap) => gap.id === "missing_source_refs"), true);
assert.equal(direct.missing_evidence.some((gap) => gap.id === "missing_audit_refs"), true);

const gaps = buildMissingEvidence({
  failureModes: ["unsafe_memory_write", "overgeneralization"]
});
assert.equal(gaps.length, 2);

console.log("OK evidence chain tests passed");
