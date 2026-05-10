import { auditPacket } from "../../scripts/audit-core/audit_rules.mjs";
import { getAuditProfile } from "./profiles.mjs";
import { getAuditStandard } from "./standards.mjs";
import { assessSourceCredibility } from "./source-credibility.mjs";
import { assessLifecycle, lifecycleRequiresReview } from "./lifecycle.mjs";
import { assessDisagreement, mergeReviewerDecision } from "./disagreement.mjs";
import { applyPolicy } from "./policy.mjs";

const routeRank = {
  accept: 0,
  revise: 1,
  quarantine: 2,
  discard: 3
};

export function auditKernel(packet, options = {}) {
  const profile = getAuditProfile(options.profile || options.audit_profile);
  const standard = getAuditStandard(options.standard || options.audit_standard);
  const sourceCredibility = assessSourceCredibility(packet.source_refs, profile.source_floor || standard.source_floor);
  const lifecycle = assessLifecycle(packet, standard);
  const disagreement = assessDisagreement(options.reviews || packet.reviews);

  const structuralResult = auditPacket(packet, options);
  let result = enforceOpenFrameworkControls(structuralResult, {
    packet,
    profile,
    standard,
    sourceCredibility,
    lifecycle,
    disagreement
  });

  result = mergeReviewerDecision(result, disagreement);
  result = applyPolicy(result, options.policy || "standard");

  return {
    ...result,
    kernel: {
      api_version: "0.2.0",
      profile,
      standard,
      source_credibility: sourceCredibility,
      lifecycle,
      disagreement,
      controls: result.kernel_controls || []
    },
    source_credibility: sourceCredibility,
    lifecycle,
    review_disagreement: disagreement
  };
}

function enforceOpenFrameworkControls(result, { packet, profile, standard, sourceCredibility, lifecycle, disagreement }) {
  const controls = [];
  let next = { ...result, warnings: [...result.warnings], required_fixes: [...result.required_fixes] };

  if (!sourceCredibility.passes_floor) {
    controls.push("source_credibility_floor");
    next = escalate(next, "revise");
    next.warnings.push(...sourceCredibility.warnings);
    next.required_fixes.push(`Add a source at or above credibility floor: ${sourceCredibility.floor}.`);
  }

  if (lifecycleRequiresReview(lifecycle)) {
    controls.push("lifecycle_review_required");
    next = escalate(next, "revise");
    next.human_review_required = true;
    next.warnings.push(...lifecycle.warnings);
    next.required_fixes.push("Review lifecycle state before durable memory use.");
  }

  if (standard.require_disagreement_resolution && disagreement.escalation_required) {
    controls.push("disagreement_resolution_required");
    next = escalate(next, "quarantine");
    next.human_review_required = true;
    next.required_fixes.push("Resolve reviewer disagreement before promotion.");
  }

  if (profile.require_human_for_high_risk && String(packet.risk_level || "").toLowerCase() === "high") {
    controls.push("profile_high_risk_review");
    next.human_review_required = true;
  }

  if (profile.minimum_route && routeRank[next.routing_decision] < routeRank[profile.minimum_route]) {
    controls.push(`profile_minimum_route:${profile.minimum_route}`);
    next = escalate(next, profile.minimum_route);
  }

  return {
    ...next,
    required_fixes: dedupe(next.required_fixes),
    warnings: dedupe(next.warnings),
    kernel_controls: controls
  };
}

function escalate(result, minimumRoute) {
  if (!minimumRoute || routeRank[result.routing_decision] >= routeRank[minimumRoute]) {
    return result;
  }
  return {
    ...result,
    routing_decision: minimumRoute,
    decision: minimumRoute
  };
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}
