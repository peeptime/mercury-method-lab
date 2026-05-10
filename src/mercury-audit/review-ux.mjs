export function buildScenarioReviewGuidance(result, scenario) {
  const focus = scenario?.review_focus || [];
  const riskNotes = scenario?.risk_notes || [];
  const options = [
    {
      id: "A",
      label: "Accept current route",
      consequence: "Use only within the scenario boundary and preserve provenance."
    },
    {
      id: "B",
      label: "Revise before use",
      consequence: "Add the missing source, boundary, or reviewer note before durable memory."
    },
    {
      id: "C",
      label: "Escalate or quarantine",
      consequence: "Keep the item out of durable memory until a qualified reviewer resolves it."
    }
  ];

  return {
    scenario_id: scenario?.id || "unknown",
    scenario_label: scenario?.label || "Unknown Scenario",
    decision: result.routing_decision,
    plain_language: explainDecision(result.routing_decision),
    focus,
    risk_notes: riskNotes,
    options,
    next_best_action: nextAction(result.routing_decision)
  };
}

function explainDecision(decision) {
  const text = {
    accept: "This can be retained within the stated boundary.",
    revise: "This may be useful, but the wording or evidence needs repair.",
    quarantine: "This may be useful as evidence, but it should not steer memory yet.",
    discard: "This should not remain in the promotion path."
  };
  return text[decision] || "Review required.";
}

function nextAction(decision) {
  const text = {
    accept: "Record the provenance and scope before host storage.",
    revise: "Add missing evidence or narrow the claim.",
    quarantine: "Preserve the source but block memory write.",
    discard: "Archive or remove from the promotion path."
  };
  return text[decision] || "Open human review.";
}
