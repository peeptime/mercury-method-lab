const longTermTypes = new Set([
  "memory_candidate",
  "long_term_rule",
  "user_profile_update",
  "project_positioning"
]);

const customerDeliveryTypes = new Set([
  "fde_customer_delivery",
  "customer_delivery",
  "client_delivery"
]);

const absoluteTerms = [
  "always",
  "all",
  "never",
  "must",
  "only",
  "guaranteed",
  "proves",
  "所有",
  "全部",
  "永远",
  "从不",
  "必须",
  "必然",
  "唯一",
  "完全",
  "一定"
];

const unsupportedTerms = [
  "guaranteed",
  "proves",
  "will definitely",
  "必然",
  "一定会",
  "已经证明",
  "无需验证"
];

export function auditPacket(packet) {
  const blockers = [];
  const warnings = [];
  const requiredFixes = [];
  const sourceRefs = normalizeList(packet.source_refs);
  const auditRefs = normalizeList(packet.audit_refs);
  const claim = String(packet.claim || "");
  const type = String(packet.type || "");
  const riskLevel = String(packet.risk_level || "medium");
  const contextText = stringifyContext(packet.context);

  requireField(packet, "id", blockers, requiredFixes);
  requireField(packet, "title", blockers, requiredFixes);
  requireField(packet, "type", blockers, requiredFixes);
  requireField(packet, "claim", blockers, requiredFixes);

  if (!sourceRefs.length) {
    addBlocker(blockers, "missing_source_refs", "high");
    requiredFixes.push("Add concrete source_refs before this claim can enter any durable system.");
  }

  if (!auditRefs.length) {
    addBlocker(blockers, "missing_audit_refs", "medium");
    requiredFixes.push("Add audit_refs or run a human/structural audit before durable use.");
  }

  if (hasAbsoluteLanguage(claim) && !hasStrongEvidence(packet)) {
    addBlocker(blockers, "overgeneralization", "medium");
    requiredFixes.push("Narrow absolute wording or add stronger evidence for the universal claim.");
  }

  if (hasUnsupportedClaim(claim, contextText) && !hasStrongEvidence(packet)) {
    addBlocker(blockers, "unsupported_claim", "high");
    requiredFixes.push("Rewrite the claim as a hypothesis or add external evidence.");
  }

  if (mentionsCircularReasoning(claim, contextText)) {
    addBlocker(blockers, "circular_reasoning", "critical");
    requiredFixes.push("Replace self-referential justification with independent evidence.");
  }

  if (hasUnclearBoundary(packet)) {
    addBlocker(blockers, "unclear_boundary", "medium");
    requiredFixes.push("State the boundary: where this claim applies, and where it does not.");
  }

  if (isStale(packet)) {
    addBlocker(blockers, "stale_context", "medium");
    requiredFixes.push("Refresh time-sensitive context before using this claim.");
  }

  if (longTermTypes.has(type) && riskLevel === "high") {
    addBlocker(blockers, "unsafe_memory_write", "critical");
    requiredFixes.push("Require human review before any long-term memory write.");
  }

  if (customerDeliveryTypes.has(type)) {
    warnings.push("Customer/FDE delivery packets require human review even when structurally complete.");
  }

  if (packet.expected_decision && !["accept", "revise", "quarantine", "discard"].includes(packet.expected_decision)) {
    warnings.push(`Unknown expected_decision in packet: ${packet.expected_decision}`);
  }

  const routingDecision = decide({ blockers, type, riskLevel });
  const humanReviewRequired = customerDeliveryTypes.has(type)
    || blockers.some((blocker) => blocker.severity === "critical")
    || riskLevel === "high";

  return {
    packet_id: packet.id || "",
    packet_title: packet.title || "",
    packet_path: packet.__path || "",
    type,
    claim,
    routing_decision: routingDecision,
    blockers,
    warnings,
    required_fixes: dedupe(requiredFixes),
    confidence: structuralConfidence(blockers, sourceRefs, auditRefs),
    human_review_required: humanReviewRequired,
    source_refs: sourceRefs,
    audit_refs: auditRefs,
    expected_decision: packet.expected_decision || "",
    expected_blockers: normalizeList(packet.expected_blockers)
  };
}

export function auditPackets(packets) {
  const results = packets.map(auditPacket);
  return {
    schema_version: "0.1",
    generated_at: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      accept: count(results, "accept"),
      revise: count(results, "revise"),
      quarantine: count(results, "quarantine"),
      discard: count(results, "discard"),
      human_review_required: results.filter((result) => result.human_review_required).length
    }
  };
}

function decide({ blockers, type, riskLevel }) {
  const ids = new Set(blockers.map((blocker) => blocker.id));
  if (ids.has("circular_reasoning") && ids.has("missing_source_refs")) {
    return "discard";
  }
  if (ids.has("missing_source_refs") && ids.has("missing_audit_refs") && ids.has("unsupported_claim")) {
    return "discard";
  }
  if (ids.has("unsafe_memory_write") || (riskLevel === "high" && ids.has("missing_audit_refs"))) {
    return "quarantine";
  }
  if (longTermTypes.has(type) && ids.has("missing_audit_refs")) {
    return "quarantine";
  }
  if (ids.has("missing_source_refs")) {
    return "quarantine";
  }
  if (blockers.length) {
    return "revise";
  }
  return "accept";
}

function requireField(packet, field, blockers, requiredFixes) {
  if (packet[field] === undefined || packet[field] === "" || (Array.isArray(packet[field]) && !packet[field].length)) {
    addBlocker(blockers, `missing_${field}`, "high");
    requiredFixes.push(`Add required field: ${field}.`);
  }
}

function addBlocker(blockers, id, severity) {
  if (blockers.some((blocker) => blocker.id === id)) {
    return;
  }
  blockers.push({
    id,
    severity,
    message: blockerMessage(id)
  });
}

function blockerMessage(id) {
  const messages = {
    circular_reasoning: "The claim is justified by itself or by another unverified AI conclusion.",
    conflicting_evidence: "The packet acknowledges evidence that conflicts with the claim.",
    missing_audit_refs: "No audit reference supports durable use of the claim.",
    missing_claim: "The packet has no auditable claim.",
    missing_id: "The packet has no stable id.",
    missing_source_refs: "No source reference supports the claim.",
    missing_title: "The packet has no human-readable title.",
    missing_type: "The packet has no packet type.",
    overgeneralization: "The claim uses absolute language without strong evidence.",
    stale_context: "The context is time-sensitive or stale.",
    unclear_boundary: "The packet does not say where the claim applies or stops applying.",
    unsafe_memory_write: "The claim is high-risk and targets durable memory or project positioning.",
    unsupported_claim: "The claim goes beyond the supplied evidence."
  };
  return messages[id] || "Audit blocker.";
}

function hasAbsoluteLanguage(claim) {
  const normalized = claim.toLowerCase();
  return absoluteTerms.some((term) => normalized.includes(term.toLowerCase()));
}

function hasUnsupportedClaim(claim, contextText) {
  const normalized = `${claim}\n${contextText}`.toLowerCase();
  return unsupportedTerms.some((term) => normalized.includes(term.toLowerCase()));
}

function hasStrongEvidence(packet) {
  const sourceRefs = normalizeList(packet.source_refs);
  const auditRefs = normalizeList(packet.audit_refs);
  if (packet.evidence_strength === "strong") {
    return sourceRefs.length > 0 && auditRefs.length > 0;
  }
  return sourceRefs.length >= 2 && auditRefs.length >= 2 && String(packet.risk_level || "") === "low";
}

function mentionsCircularReasoning(claim, contextText) {
  const normalized = `${claim}\n${contextText}`.toLowerCase();
  return normalized.includes("because the ai said so")
    || normalized.includes("self-referential")
    || normalized.includes("circular")
    || normalized.includes("循环论证")
    || normalized.includes("自证");
}

function hasUnclearBoundary(packet) {
  if (packet.boundary || packet.scope) {
    return false;
  }
  const type = String(packet.type || "");
  return type === "project_positioning" || type === "fde_customer_delivery";
}

function isStale(packet) {
  const contextText = stringifyContext(packet.context).toLowerCase();
  return contextText.includes("stale") || contextText.includes("过期") || contextText.includes("outdated");
}

function structuralConfidence(blockers, sourceRefs, auditRefs) {
  if (!sourceRefs.length || blockers.some((blocker) => blocker.severity === "critical")) {
    return "low";
  }
  if (!auditRefs.length || blockers.length) {
    return "medium";
  }
  return "high";
}

function stringifyContext(context) {
  if (!context) return "";
  if (typeof context === "string") return context;
  return Object.values(context).join("\n");
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)].filter(Boolean);
}

function dedupe(values) {
  return [...new Set(values)];
}

function count(results, decision) {
  return results.filter((result) => result.routing_decision === decision).length;
}
