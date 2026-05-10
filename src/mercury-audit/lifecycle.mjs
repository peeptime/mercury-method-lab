export function assessLifecycle(packet = {}, standard = {}) {
  const now = new Date();
  const createdAt = parseDate(packet.created_at || packet.createdAt);
  const expiresAt = parseDate(packet.expires_at || packet.expiresAt);
  const reviewAfter = parseDate(packet.review_after || packet.reviewAfter);
  const contextText = stringifyContext(packet.context).toLowerCase();
  const staleAfterDays = Number(standard.stale_after_days || 90);
  const ageDays = createdAt ? Math.floor((now - createdAt) / 86400000) : null;
  const warnings = [];
  let state = "active_candidate";

  if (!createdAt) {
    warnings.push("missing_created_at");
  }
  if (expiresAt && expiresAt < now) {
    state = "expired";
    warnings.push("memory_expired");
  } else if (reviewAfter && reviewAfter < now) {
    state = "review_due";
    warnings.push("review_due");
  } else if (ageDays !== null && ageDays > staleAfterDays) {
    state = "review_due";
    warnings.push("stale_by_standard");
  }
  if (contextText.includes("deprecated") || contextText.includes("retired")) {
    state = "retired";
    warnings.push("context_marks_retired");
  }
  if (contextText.includes("stale") || contextText.includes("outdated")) {
    warnings.push("context_marks_stale");
    if (state === "active_candidate") state = "review_due";
  }

  return {
    state,
    age_days: ageDays,
    stale_after_days: staleAfterDays,
    created_at: createdAt ? createdAt.toISOString() : "",
    expires_at: expiresAt ? expiresAt.toISOString() : "",
    review_after: reviewAfter ? reviewAfter.toISOString() : "",
    warnings
  };
}

export function lifecycleRequiresReview(lifecycle) {
  return ["review_due", "expired", "retired"].includes(lifecycle?.state);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stringifyContext(context) {
  if (!context) return "";
  if (typeof context === "string") return context;
  return Object.values(context).join("\n");
}
