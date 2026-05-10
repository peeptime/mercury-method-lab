const sourceLevels = [
  {
    id: "primary_or_direct",
    rank: 5,
    labels: ["official", "primary", "direct_user", "field_note", "signed_review"],
    description: "Primary source, direct user statement, field note, or named review record."
  },
  {
    id: "traceable",
    rank: 4,
    labels: ["repo_artifact", "conversation", "transcript", "audit_report", "commit", "issue"],
    description: "Traceable artifact whose origin can be inspected."
  },
  {
    id: "secondary",
    rank: 3,
    labels: ["third_party", "article", "paper", "benchmark", "external_report"],
    description: "External secondary source; useful but not direct evidence by itself."
  },
  {
    id: "ai_generated",
    rank: 2,
    labels: ["ai_summary", "agent_output", "model_output", "llm_judge"],
    description: "AI-generated material; never sufficient as sole durable-memory evidence."
  },
  {
    id: "unknown",
    rank: 1,
    labels: ["unknown", "missing"],
    description: "No clear source class."
  }
];

const floorRank = new Map(sourceLevels.map((level) => [level.id, level.rank]));

export function classifySourceRef(ref = "") {
  const text = String(ref).toLowerCase();
  if (!text) return { level: "unknown", rank: 1, ref };
  if (/(official|primary|direct_user|field-note|field_note|signed-review|signed_review)/.test(text)) {
    return { level: "primary_or_direct", rank: 5, ref };
  }
  if (/(conversation|transcript|commit|github|repo|docs\/|audit|review-ledger|issue|pr:|pull)/.test(text)) {
    return { level: "traceable", rank: 4, ref };
  }
  if (/(paper|arxiv|article|benchmark|external|report|owasp|nist|w3c)/.test(text)) {
    return { level: "secondary", rank: 3, ref };
  }
  if (/(ai|agent|llm|model|summary|generated)/.test(text)) {
    return { level: "ai_generated", rank: 2, ref };
  }
  return { level: "unknown", rank: 1, ref };
}

export function assessSourceCredibility(sourceRefs = [], floor = "traceable") {
  const refs = normalizeList(sourceRefs);
  const classified = refs.map(classifySourceRef);
  const bestRank = classified.reduce((max, item) => Math.max(max, item.rank), 0);
  const requiredRank = floorRank.get(floor) || floorRank.get("traceable");
  const soleAiGenerated = classified.length > 0 && classified.every((item) => item.level === "ai_generated");
  const warnings = [];

  if (!classified.length) {
    warnings.push("source_credibility_missing");
  }
  if (soleAiGenerated) {
    warnings.push("source_is_only_ai_generated");
  }
  if (bestRank < requiredRank) {
    warnings.push(`source_floor_not_met:${floor}`);
  }

  return {
    floor,
    best_rank: bestRank,
    floor_rank: requiredRank,
    passes_floor: bestRank >= requiredRank && !soleAiGenerated,
    sole_ai_generated: soleAiGenerated,
    sources: classified,
    warnings
  };
}

export function listSourceLevels() {
  return sourceLevels.map((level) => ({ ...level }));
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)].filter(Boolean);
}
