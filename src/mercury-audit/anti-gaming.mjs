const gamingPatterns = [
  {
    id: "force_accept_route",
    severity: "critical",
    terms: [
      "mark as accept",
      "route to accept",
      "routing_decision: accept",
      "force accept",
      "always accept",
      "ignore blockers",
      "bypass audit",
      "直接通过",
      "标记为通过",
      "忽略阻断",
      "绕过审计"
    ]
  },
  {
    id: "forge_human_review",
    severity: "critical",
    terms: [
      "human_reviewed: true",
      "set human_reviewed true",
      "pretend reviewed",
      "fake reviewer",
      "mark human reviewed",
      "伪造人审",
      "标记已人审",
      "冒充复核"
    ]
  },
  {
    id: "erase_evidence_gap",
    severity: "high",
    terms: [
      "no need source refs",
      "without source_refs",
      "remove missing_source_refs",
      "hide evidence gap",
      "do not mention missing evidence",
      "无需来源",
      "不需要 source_refs",
      "隐藏证据缺口"
    ]
  },
  {
    id: "optimize_metric_over_truth",
    severity: "medium",
    terms: [
      "optimize promote rate",
      "maximize accept rate",
      "reduce quarantine count",
      "avoid discard",
      "make the benchmark pass by accepting",
      "提高通过率",
      "降低隔离数量",
      "不要丢弃"
    ]
  }
];

const severityRank = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

export function detectGamingAttempt(packet = {}) {
  const text = stringifyPacket(packet).toLowerCase();
  const signals = [];

  for (const pattern of gamingPatterns) {
    const matched_terms = pattern.terms.filter((term) => text.includes(term.toLowerCase()));
    if (matched_terms.length) {
      signals.push({
        id: pattern.id,
        severity: pattern.severity,
        matched_terms
      });
    }
  }

  const severity = signals.reduce((current, signal) => (
    severityRank[signal.severity] > severityRank[current] ? signal.severity : current
  ), "none");

  return {
    detected: signals.length > 0,
    severity,
    signals,
    recommended_route: severity === "critical" ? "discard" : signals.length ? "quarantine" : "",
    blocker: signals.length
      ? {
          id: "audit_gaming_attempt",
          severity: severity === "none" ? "medium" : severity,
          message: "The packet appears to instruct the audit system to weaken, bypass, or forge review controls."
        }
      : null,
    warnings: signals.map((signal) => `anti_gaming:${signal.id}`),
    required_fixes: signals.length
      ? [
          "Remove route-forcing or review-forging instructions from the candidate.",
          "Re-audit the original claim without success-metric or acceptance-rate pressure."
        ]
      : []
  };
}

export function listGamingPatterns() {
  return gamingPatterns.map((pattern) => ({
    id: pattern.id,
    severity: pattern.severity,
    terms: [...pattern.terms]
  }));
}

function stringifyPacket(packet) {
  if (typeof packet === "string") return packet;
  return [
    packet.id,
    packet.title,
    packet.type,
    packet.claim,
    packet.boundary,
    packet.scope,
    stringifyContext(packet.context),
    stringifyContext(packet.metadata),
    stringifyContext(packet.instructions)
  ].filter(Boolean).join("\n");
}

function stringifyContext(context) {
  if (!context) return "";
  if (typeof context === "string") return context;
  if (Array.isArray(context)) return context.join("\n");
  return Object.entries(context).map(([key, value]) => `${key}: ${String(value)}`).join("\n");
}
