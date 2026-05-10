const routeRank = {
  accept: 0,
  revise: 1,
  quarantine: 2,
  discard: 3
};

export function assessDisagreement(reviews = []) {
  const normalized = normalizeReviews(reviews);
  const routes = new Set(normalized.map((review) => review.routing_decision).filter(Boolean));
  const reviewers = new Set(normalized.map((review) => review.reviewer).filter(Boolean));
  const hasConflict = routes.size > 1;
  const highestRoute = [...routes].sort((a, b) => routeRank[b] - routeRank[a])[0] || "";

  return {
    review_count: normalized.length,
    reviewer_count: reviewers.size,
    routes: [...routes],
    has_disagreement: hasConflict,
    escalation_required: hasConflict || normalized.some((review) => review.escalate === true),
    recommended_route: hasConflict ? highestRoute : ([...routes][0] || ""),
    reviews: normalized
  };
}

export function mergeReviewerDecision(baseResult, disagreement) {
  if (!disagreement?.escalation_required) return baseResult;
  const nextRoute = disagreement.recommended_route || baseResult.routing_decision;
  return {
    ...baseResult,
    routing_decision: routeRank[nextRoute] > routeRank[baseResult.routing_decision]
      ? nextRoute
      : baseResult.routing_decision,
    human_review_required: true,
    warnings: [
      ...baseResult.warnings,
      "review_disagreement_requires_resolution"
    ]
  };
}

function normalizeReviews(reviews) {
  if (!Array.isArray(reviews)) return [];
  return reviews.map((review, index) => ({
    reviewer: review.reviewer || `reviewer_${index + 1}`,
    routing_decision: review.routing_decision || review.decision || "",
    note: review.note || "",
    escalate: review.escalate === true
  }));
}
