const standards = {
  "mercury-core": {
    id: "mercury-core",
    label: "Mercury Core",
    description: "Source refs, audit refs, provenance, and routing before durable memory.",
    require_source_refs: true,
    require_audit_refs_for_memory: true,
    require_boundary_for_policy: true,
    source_floor: "traceable",
    stale_after_days: 90
  },
  "high-risk-memory": {
    id: "high-risk-memory",
    label: "High-Risk Memory",
    description: "Stricter admission for customer, legal, medical, finance, user-profile, and policy memory.",
    require_source_refs: true,
    require_audit_refs_for_memory: true,
    require_boundary_for_policy: true,
    source_floor: "primary_or_direct",
    stale_after_days: 30,
    require_disagreement_resolution: true
  },
  "draft-research": {
    id: "draft-research",
    label: "Draft Research",
    description: "Allows uncertain material to remain in revise state while preserving evidence gaps.",
    require_source_refs: true,
    require_audit_refs_for_memory: false,
    require_boundary_for_policy: true,
    source_floor: "traceable",
    stale_after_days: 180
  }
};

export function getAuditStandard(standard = "mercury-core") {
  if (typeof standard === "string") {
    return standards[standard] || standards["mercury-core"];
  }
  if (standard && typeof standard === "object") {
    return {
      ...standards["mercury-core"],
      ...standard,
      id: standard.id || "custom-standard",
      label: standard.label || "Custom Standard"
    };
  }
  return standards["mercury-core"];
}

export function listAuditStandards() {
  return Object.values(standards).map((standard) => ({ ...standard }));
}
