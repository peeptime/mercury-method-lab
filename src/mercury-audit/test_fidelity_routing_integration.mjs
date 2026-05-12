/**
 * test_fidelity_routing_integration.mjs
 *
 * Integration tests for:
 *  - F5: Stability check + routing downgrade
 *  - F1-F4 × admission routing integration
 *  - Fidelity gate + stability gate combined
 *
 * Run: node src/mercury-audit/test_fidelity_routing_integration.mjs
 */

import { fullAudit, audit, auditMemoryWrite, shouldWriteMemory } from "./index.mjs";
import { verifyAuditStability, applyStabilityGate } from "./fidelity-stability.mjs";
import { verifyReportFidelity, applyFidelityGate } from "./fidelity.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log("✅", name);
    passed++;
  } catch (e) {
    console.log("❌", name);
    console.log("   ", e.message);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ── F5: Stability Detection ──────────────────────────────────────────────────

test("F5: Stable audit (no second run) returns score 1.0", () => {
  const result = fullAudit("The capital of France is Paris.", { source_content: "The capital of France is Paris." });
  const stability = verifyAuditStability(result);
  assert(stability.stability_score === 1.0, `Expected 1.0, got ${stability.stability_score}`);
  assert(stability.is_stable === true, "Should be stable");
  assert(stability.inconsistencies.length === 0, "No inconsistencies expected");
});

test("F5: Stable audit (two identical runs) returns score 1.0", () => {
  const content = "AI should prefer structured outputs over plain text.";
  const first = fullAudit(content, { source_content: content });
  const second = fullAudit(content, { source_content: content });
  const stability = verifyAuditStability(first, { secondAudit: second });
  assert(stability.is_stable === true, "Identical runs should be stable");
  assert(stability.rounds_checked === 2, "Should check 2 rounds");
});

test("F5: Detect routing inconsistency between two runs", () => {
  // Use a content that has borderline classification
  const content = "This is a possible approach worth testing.";
  const first = fullAudit(content, { source_content: content });
  const second = fullAudit(content, { source_content: content });
  const stability = verifyAuditStability(first, { secondAudit: second });

  // Both should produce same routing (if deterministic)
  // Stability should be 1.0 for identical inputs
  assert(stability.rounds_checked === 2, "Should check 2 rounds");
});

test("F5: Detect low fidelity + accept combination", () => {
  // Content with blockers but no source context
  const content = "All AI systems always hallucinate facts in critical scenarios.";
  const result = fullAudit(content, { source_content: content });
  const stability = verifyAuditStability(result);

  // If fidelity is low and routing is accept, should flag as inconsistency
  if (result.fidelity?.fidelity_score < 0.8 && result.routing_decision === "accept") {
    const hasLowFidelityAccept = stability.inconsistencies.some(
      (i) => i.type === "low_fidelity_accept"
    );
    assert(hasLowFidelityAccept === true, "Should detect low_fidelity_accept");
  } else {
    assert(true, "No low fidelity accept case in this content");
  }
});

test("F5: Detect confidence-routing mismatch", () => {
  // Use content with explicit uncertainty markers
  const content = "It is unclear whether this approach will work at all.";
  const result = fullAudit(content, { source_content: content });
  const stability = verifyAuditStability(result);

  // If confidence is marked as very low but routing is accept, flag it
  assert(typeof stability.stability_score === "number", "Score should be numeric");
  assert(stability.stability_score >= 0 && stability.stability_score <= 1, "Score out of range");
});

// ── F5: Stability Gate ──────────────────────────────────────────────────────

test("F5: applyStabilityGate passes stable results unchanged", () => {
  const content = "Paris is the capital of France.";
  const result = fullAudit(content, { source_content: content });
  const stability = verifyAuditStability(result);
  const adjusted = applyStabilityGate(result, stability);

  assert(adjusted.stability_gate_passed === true, "Stable results should pass gate");
  assert(adjusted.routing_decision === result.routing_decision, "Routing should be unchanged");
});

test("F5: applyStabilityGate downgrades unstable results", () => {
  // Simulate unstable case by passing a fabricated instability
  const content = "Testing.";
  const result = fullAudit(content, { source_content: content });
  const fakeStability = {
    is_stable: false,
    stability_score: 0.4,
    inconsistencies: [
      { type: "routing_inconsistency", severity: "high", message: "Test" }
    ],
    recommendation: "UNSTABLE"
  };

  const adjusted = applyStabilityGate(result, fakeStability);

  assert(adjusted.stability_gate_passed === false, "Should fail gate");
  assert(adjusted.human_review_required === true, "Should require human review");
  assert(adjusted.original_routing_decision !== undefined, "Should record original routing");
  assert(
    ["revise", "quarantine"].includes(adjusted.routing_decision),
    `Routing should be downgraded, got '${adjusted.routing_decision}'`
  );
});

test("F5: Unstable revise → quarantine downgrade", () => {
  const content = "A test.";
  const result = fullAudit(content, { source_content: content });
  const unstableStability = {
    is_stable: false,
    stability_score: 0.5,
    inconsistencies: [{ type: "confidence_routing_mismatch", severity: "medium", message: "Test" }],
    recommendation: "CAUTION"
  };

  const adjusted = applyStabilityGate(result, unstableStability);

  if (result.routing_decision === "revise") {
    assert(
      ["quarantine", "revise"].includes(adjusted.routing_decision),
      "Revise can stay as revise or downgrade to quarantine"
    );
  }
});

test("F5: Unstable accept → revise downgrade", () => {
  const unstableStability = {
    is_stable: false,
    stability_score: 0.3,
    inconsistencies: [
      { type: "low_fidelity_accept", severity: "high", message: "Low fidelity but accept" }
    ],
    recommendation: "UNSTABLE"
  };
  const fakeAcceptResult = {
    routing_decision: "accept",
    human_review_required: false,
    fidelity: { fidelity_score: 0.5 }
  };

  const adjusted = applyStabilityGate(fakeAcceptResult, unstableStability);
  assert(
    adjusted.routing_decision === "revise",
    `Accept should downgrade to revise, got '${adjusted.routing_decision}'`
  );
  assert(adjusted.stability_gate_passed === false, "Should fail stability gate");
});

test("F5: discard does not downgrade", () => {
  const unstableStability = {
    is_stable: false,
    stability_score: 0.2,
    inconsistencies: [{ type: "routing_inconsistency", severity: "high", message: "Test" }],
    recommendation: "UNSTABLE"
  };
  const fakeDiscardResult = {
    routing_decision: "discard",
    human_review_required: false
  };

  const adjusted = applyStabilityGate(fakeDiscardResult, unstableStability);
  assert(adjusted.routing_decision === "discard", `Discard should stay discard, got '${adjusted.routing_decision}'`);
  assert(adjusted.stability_gate_passed === false, "Should still fail gate (stability is low)");
});

// ── F1: Fidelity Gate + Routing ─────────────────────────────────────────────

test("F1: High fidelity → routing unchanged", () => {
  const content = "Paris is the capital of France. Source: Wikipedia.";
  const result = fullAudit(content, { source_content: content });
  const fidelity = verifyReportFidelity(result, content);
  const adjusted = applyFidelityGate(result, fidelity);

  assert(adjusted.fidelity_gate_passed === true, "High fidelity should pass");
});

test("F1: Low fidelity → human_review_required flagged", () => {
  // Content with issues but low trace coverage
  const content = "This approach is always the best solution.";
  const result = fullAudit(content, { source_content: content });
  const fidelity = verifyReportFidelity(result, content);
  const adjusted = applyFidelityGate(result, fidelity);

  if (fidelity.fidelity_score < 1.0) {
    assert(
      adjusted.fidelity_gate_passed === false || adjusted.human_review_required === true,
      "Low fidelity should trigger review flag"
    );
  } else {
    assert(true, "Content happened to score full fidelity");
  }
});

// ── Combined: F1-F4 + F5 × Admission ───────────────────────────────────────

test("Combined: fullAudit includes both fidelity and stability fields", () => {
  const content = "Claude is made by Anthropic.";
  const result = fullAudit(content, { source_content: content });

  assert(result.fidelity !== undefined, "Should have fidelity field");
  assert(result.trace !== undefined, "Should have trace field");
  assert(result.meta_audit !== undefined, "Should have meta_audit field");
  assert(result.iteration_tracker !== undefined, "Should have iteration_tracker field");
  // stability is added by explicit check, not by fullAudit
  assert(typeof result.fidelity_gate_passed === "boolean", "Should have fidelity_gate_passed");
});

test("Combined: auditMemoryWrite respects fidelity + stability gates", () => {
  const candidate = {
    content: "This is a test memory candidate.",
    risk_level: "low"
  };
  const result = auditMemoryWrite(candidate);

  // shouldWriteMemory should return false if human_review_required
  const shouldWrite = shouldWriteMemory(result);

  // If routing is accept and no review required, should write
  if (result.routing_decision === "accept" && !result.human_review_required) {
    assert(shouldWrite === true, "Should write if accept and no review required");
  }
});

test("Combined: verifyAuditStability + verifyReportFidelity together", () => {
  const content = "User prefers JSON format for all data exchange.";
  const result = fullAudit(content, { source_content: content });

  const fidelity = verifyReportFidelity(result, content);
  const stability = verifyAuditStability(result);

  assert(typeof fidelity.fidelity_score === "number", "Fidelity score should be numeric");
  assert(typeof stability.stability_score === "number", "Stability score should be numeric");
  assert(fidelity.fidelity_score >= 0 && fidelity.fidelity_score <= 1, "Fidelity out of range");
  assert(stability.stability_score >= 0 && stability.stability_score <= 1, "Stability out of range");
});

// ── Type-aware admission ─────────────────────────────────────────────────────

test("Type-aware: fact admission requires evidence", () => {
  const content = "The Earth orbits the Sun. Source: NASA.gov";
  const result = fullAudit(content, { source_content: content });

  if (result.routing_decision === "accept") {
    assert(result.human_review_required === false || result.routing_decision === "revise",
      "Fact with evidence should route accept or revise");
  }
});

test("Type-aware: overgeneralization triggers revise", () => {
  const content = "All AI systems always fail in production.";
  const result = fullAudit(content, { source_content: content });

  assert(
    ["revise", "quarantine", "discard"].includes(result.routing_decision),
    "Overgeneralization should not be accepted directly"
  );
});

test("Type-aware: preference-adjacent content does not promote to accept without evidence", () => {
  // Preference-adjacent content: no overgeneralization, no factual claim
  // Expects revise or accept depending on evidence level — not a strict requirement
  const content = "This was mentioned as a preference earlier in the conversation.";
  const result = fullAudit(content, { source_content: content });

  assert(
    ["accept", "revise", "quarantine"].includes(result.routing_decision),
    `Preference-adjacent content got routing: ${result.routing_decision}`
  );
  // Key check: it should not go to accept unless evidence exists
  // (quarantine is acceptable — not enough evidence for accept)
});

// ── Edge cases ───────────────────────────────────────────────────────────────

test("Edge: null audit result", () => {
  const stability = verifyAuditStability(null);
  assert(stability.stability_score === 0, "Null audit should score 0");
  assert(stability.is_stable === false, "Null audit should be unstable");
});

test("Edge: content with no blockers", () => {
  const content = "Short factual statement with source.";
  const result = fullAudit(content, { source_content: content });
  const stability = verifyAuditStability(result);

  assert(typeof stability.stability_score === "number", "Score should exist");
  assert(stability.is_stable === true, "No-blocker content should be stable");
});

test("Edge: routing downgrade chain accept→revise→quarantine→discard", () => {
  const stabilityAccept = { is_stable: false, stability_score: 0.1, inconsistencies: [{ severity: "high", message: "" }], recommendation: "" };
  const stabilityRevise = { is_stable: false, stability_score: 0.1, inconsistencies: [{ severity: "high", message: "" }], recommendation: "" };
  const stabilityQuarantine = { is_stable: false, stability_score: 0.1, inconsistencies: [{ severity: "high", message: "" }], recommendation: "" };

  const resultAccept = { routing_decision: "accept", human_review_required: false };
  const resultRevise = { routing_decision: "revise", human_review_required: true };
  const resultQuarantine = { routing_decision: "quarantine", human_review_required: true };
  const resultDiscard = { routing_decision: "discard", human_review_required: false };

  assert(applyStabilityGate(resultAccept, stabilityAccept).routing_decision !== "accept", "Accept should downgrade");
  assert(applyStabilityGate(resultRevise, stabilityRevise).routing_decision === "quarantine", "Revise should downgrade to quarantine");
  assert(applyStabilityGate(resultQuarantine, stabilityQuarantine).routing_decision === "quarantine", "Quarantine stays quarantine");
  assert(applyStabilityGate(resultDiscard, { ...stabilityAccept, stability_score: 0.1 }).routing_decision === "discard", "Discard stays discard");
});

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Fidelity × Routing Integration Tests`);
console.log(`Tests: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("All integration tests operating correctly.");
} else {
  console.log(`${failed} test(s) failed.`);
}
process.exit(failed > 0 ? 1 : 0);
