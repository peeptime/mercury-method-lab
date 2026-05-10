const profiles = {
  "v8.1-reality-sync": {
    id: "v8.1-reality-sync",
    label: "Reality Sync",
    posture: "evidence-first",
    description: "Default posture: preserve useful claims only when source, audit path, and boundary are visible.",
    minimum_route: "accept",
    require_human_for_high_risk: true,
    source_floor: "traceable"
  },
  "v8.0-breakthrough": {
    id: "v8.0-breakthrough",
    label: "Breakthrough Scout",
    posture: "hypothesis-friendly",
    description: "Allows novel claims to stay as hypotheses, but does not let them enter durable memory without audit refs.",
    minimum_route: "revise",
    require_human_for_high_risk: true,
    source_floor: "traceable"
  },
  "v8.5-correction": {
    id: "v8.5-correction",
    label: "Correction Gate",
    posture: "strict-correction",
    description: "Used when prior memory may be wrong; escalates weak or stale evidence into quarantine.",
    minimum_route: "revise",
    require_human_for_high_risk: true,
    source_floor: "primary_or_direct"
  },
  "external-auditor": {
    id: "external-auditor",
    label: "External Auditor",
    posture: "independent-review",
    description: "Assumes project-owner claims need independent support before durable use.",
    minimum_route: "revise",
    require_human_for_high_risk: true,
    source_floor: "primary_or_direct"
  }
};

export function getAuditProfile(profile = "v8.1-reality-sync") {
  if (typeof profile === "string") {
    return profiles[profile] || profiles["v8.1-reality-sync"];
  }
  if (profile && typeof profile === "object") {
    return {
      ...profiles["v8.1-reality-sync"],
      ...profile,
      id: profile.id || "custom-profile",
      label: profile.label || "Custom Profile"
    };
  }
  return profiles["v8.1-reality-sync"];
}

export function listAuditProfiles() {
  return Object.values(profiles).map((profile) => ({ ...profile }));
}
