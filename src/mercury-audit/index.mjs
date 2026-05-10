import { createHash } from "node:crypto";
import { auditPacket } from "../../scripts/audit-core/audit_rules.mjs";
import { applyPolicy, listPolicies, resolvePolicy } from "./policy.mjs";

export const MERCURY_AUDIT_API_VERSION = "0.1.0";

export { applyPolicy, listPolicies, resolvePolicy };

export function createAuditPacket(content, context = {}) {
  const claim = String(content || "").trim();
  const id = context.id || `sdk_${hashText(`${claim}\n${JSON.stringify(context)}`).slice(0, 12)}`;

  return {
    id,
    title: context.title || "SDK memory write candidate",
    type: context.type || "memory_candidate",
    claim,
    source_refs: normalizeRefs(context.source_refs ?? context.sourceRefs),
    audit_refs: normalizeRefs(context.audit_refs ?? context.auditRefs),
    risk_level: context.risk_level || context.riskLevel || "medium",
    context: {
      capture_source: context.capture_source || context.source || "sdk_api",
      host_system: context.host_system || context.hostSystem || "",
      intended_store: context.intended_store || context.intendedStore || "",
      metadata: context.metadata || {}
    },
    evidence_strength: context.evidence_strength || context.evidenceStrength || "",
    boundary: context.boundary || context.scope || ""
  };
}

export function audit(contentOrPacket, context = {}) {
  const packet = isAuditPacket(contentOrPacket)
    ? normalizePacket(contentOrPacket, context)
    : createAuditPacket(contentOrPacket, context);
  const knownPaths = new Set(context.knownPaths || context.known_paths || []);
  const structuralResult = auditPacket(packet, { knownPaths });
  const policyResult = applyPolicy(structuralResult, context.policy || "standard");

  return {
    api_version: MERCURY_AUDIT_API_VERSION,
    packet,
    decision: policyResult.routing_decision,
    routing_decision: policyResult.routing_decision,
    reasons: buildReasons(policyResult),
    failure_modes: policyResult.blockers.map((blocker) => blocker.id),
    blockers: policyResult.blockers,
    warnings: policyResult.warnings,
    required_fixes: policyResult.required_fixes,
    required_evidence: policyResult.required_evidence,
    content_summary: policyResult.content_summary,
    human_review_checklist: policyResult.human_review_checklist,
    human_review_required: policyResult.human_review_required,
    confidence: policyResult.confidence,
    provenance: buildProvenance(packet, context),
    policy: policyResult.policy,
    raw_result: policyResult
  };
}

export function auditMemoryWrite(candidate = {}) {
  if (!candidate.content && !candidate.claim) {
    throw new Error("auditMemoryWrite requires candidate.content or candidate.claim.");
  }

  return audit(candidate.claim || candidate.content, {
    ...candidate,
    type: candidate.type || "memory_candidate",
    risk_level: candidate.risk_level || candidate.riskLevel || "high",
    capture_source: candidate.capture_source || "memory_write_hook"
  });
}

export function shouldWriteMemory(auditResult) {
  return auditResult.routing_decision === "accept" && !auditResult.human_review_required;
}

function normalizePacket(packet, context) {
  return {
    ...packet,
    source_refs: normalizeRefs(packet.source_refs ?? context.source_refs ?? context.sourceRefs),
    audit_refs: normalizeRefs(packet.audit_refs ?? context.audit_refs ?? context.auditRefs),
    risk_level: packet.risk_level || context.risk_level || context.riskLevel || "medium",
    context: packet.context || context.metadata || {}
  };
}

function buildReasons(result) {
  const blockerReasons = result.blockers.map((blocker) => `${blocker.id}:${blocker.severity}`);
  return blockerReasons.length ? blockerReasons : [result.decision_reason];
}

function buildProvenance(packet, context) {
  return {
    ai_assisted: true,
    human_reviewed: "declined",
    reviewer: context.reviewer || "host_system_pending",
    source_refs: normalizeRefs(packet.source_refs),
    audit_refs: normalizeRefs(packet.audit_refs),
    generated_by: "mercury-audit-sdk",
    generated_at: new Date().toISOString()
  };
}

function isAuditPacket(value) {
  return Boolean(value && typeof value === "object" && value.claim);
}

function normalizeRefs(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)].filter(Boolean);
}

function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}
