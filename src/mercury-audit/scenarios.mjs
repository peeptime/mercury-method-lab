const scenarios = {
  "ai-coding": {
    id: "ai-coding",
    label: "AI Coding",
    output_types: ["code_change", "test_result", "architecture_note", "agent_summary"],
    default_profile: "v8.1-reality-sync",
    default_standard: "mercury-core",
    risk_notes: [
      "Tests can pass while the implementation is still wrong.",
      "Agent summaries can hide skipped files or unverified assumptions."
    ],
    required_evidence: ["diff or commit", "test output", "affected file path"],
    review_focus: ["behavioral change", "test relevance", "unverified assumption"]
  },
  "personal-knowledge": {
    id: "personal-knowledge",
    label: "Personal Knowledge",
    output_types: ["memory_candidate", "preference", "personal_rule"],
    default_profile: "v8.5-correction",
    default_standard: "mercury-core",
    risk_notes: [
      "A one-time preference can be over-promoted into a permanent user rule.",
      "AI-generated summaries can rewrite a user's actual intent."
    ],
    required_evidence: ["direct user statement", "conversation timestamp"],
    review_focus: ["scope", "expiry", "attribution to user vs AI inference"]
  },
  "investment-research": {
    id: "investment-research",
    label: "Investment Research",
    output_types: ["market_claim", "company_claim", "thesis_note"],
    default_profile: "external-auditor",
    default_standard: "high-risk-memory",
    risk_notes: [
      "Narratives can convert speculation into investment conviction.",
      "Old market context can remain persuasive after it expires."
    ],
    required_evidence: ["primary filing or source", "date-bound market context", "counter-evidence"],
    review_focus: ["source date", "claim boundary", "missing dissent"]
  },
  "enterprise-delivery": {
    id: "enterprise-delivery",
    label: "Enterprise Delivery",
    output_types: ["customer_delivery", "fde_customer_delivery", "stakeholder_summary"],
    default_profile: "external-auditor",
    default_standard: "high-risk-memory",
    risk_notes: [
      "Stakeholder ambiguity can be laundered into consensus.",
      "Delivery artifacts can become customer commitments."
    ],
    required_evidence: ["field note", "named reviewer", "stakeholder dissent if present"],
    review_focus: ["speaker attribution", "customer commitment", "dissent preservation"]
  },
  "legal-medical-risk": {
    id: "legal-medical-risk",
    label: "Legal / Medical Risk",
    output_types: ["legal_claim", "medical_claim", "regulated_advice"],
    default_profile: "external-auditor",
    default_standard: "high-risk-memory",
    risk_notes: [
      "AI output can be mistaken for professional advice.",
      "A retained claim can affect future high-stakes decisions."
    ],
    required_evidence: ["primary authority", "qualified human reviewer", "jurisdiction or clinical context"],
    review_focus: ["scope limitation", "qualified review", "do-not-use-as-advice warning"]
  }
};

export function getAuditScenario(scenario = "personal-knowledge") {
  if (typeof scenario === "string") {
    return scenarios[scenario] || scenarios["personal-knowledge"];
  }
  if (scenario && typeof scenario === "object") {
    return {
      ...scenarios["personal-knowledge"],
      ...scenario,
      id: scenario.id || "custom-scenario",
      label: scenario.label || "Custom Scenario"
    };
  }
  return scenarios["personal-knowledge"];
}

export function listAuditScenarios() {
  return Object.values(scenarios).map((scenario) => ({ ...scenario }));
}

export function scenarioDefaults(scenario) {
  const resolved = getAuditScenario(scenario);
  return {
    profile: resolved.default_profile,
    standard: resolved.default_standard
  };
}
