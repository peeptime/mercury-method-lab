const policyTable = {
  standard: {
    name: "standard",
    description: "Use the structural routing decision without policy-side escalation.",
    allowAcceptWithHumanReview: true
  },
  strict: {
    name: "strict",
    description: "Escalate accepted items that still require human review into revise.",
    allowAcceptWithHumanReview: false
  },
  advisory: {
    name: "advisory",
    description: "Preserve the structural decision and expose policy notes for host systems.",
    allowAcceptWithHumanReview: true
  }
};

const routeRank = {
  accept: 0,
  revise: 1,
  quarantine: 2,
  discard: 3
};

export function resolvePolicy(policy = "standard") {
  if (typeof policy === "string") {
    return policyTable[policy] || policyTable.standard;
  }
  if (policy && typeof policy === "object") {
    return {
      ...policyTable.standard,
      ...policy,
      name: policy.name || "custom"
    };
  }
  return policyTable.standard;
}

export function applyPolicy(result, policy = "standard") {
  const resolved = resolvePolicy(policy);
  const adjustments = [];
  let decision = result.routing_decision;

  if (!resolved.allowAcceptWithHumanReview
    && decision === "accept"
    && result.human_review_required) {
    decision = "revise";
    adjustments.push("strict_policy_accept_with_human_review_escalated_to_revise");
  }

  if (resolved.minimum_route && routeRank[decision] < routeRank[resolved.minimum_route]) {
    adjustments.push(`minimum_route_${resolved.minimum_route}_applied`);
    decision = resolved.minimum_route;
  }

  return {
    ...result,
    routing_decision: decision,
    decision,
    policy: {
      name: resolved.name,
      original_decision: result.routing_decision,
      applied_decision: decision,
      adjustments,
      description: resolved.description
    }
  };
}

export function listPolicies() {
  return Object.values(policyTable).map((policy) => ({ ...policy }));
}
