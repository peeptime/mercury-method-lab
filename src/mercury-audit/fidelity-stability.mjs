/**
 * fidelity-stability.mjs
 *
 * F5: Audit Stability Verification
 *
 * Detects whether the same material produces consistent routing decisions
 * across multiple audit runs. Inconsistent decisions indicate that the
 * audit result itself may be unreliable or gaming-susceptible.
 *
 * v2.1.7 optimization notes:
 * - verifyAuditStability: always O(n) single-pass, no second audit needed for internal checks
 * - auditWithStabilityCheck: single fullAudit + quickStabilityCheck (was: double fullAudit)
 * - Config: lazy-loaded once, cached for all subsequent calls
 * - compareBlockers: Set-based O(n) instead of nested loop
 *
 * @param {Object} auditResult - First audit result
 * @param {Object} secondAuditResult - Second audit result (optional)
 * @param {string} sourceContent - Original source material
 * @returns {{ stability_score: number, is_stable: boolean, inconsistencies: Array, recommendation: string }}
 */

import { detectMetaAuditContent } from "./meta-audit.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ── Lazy-loaded, cached config (read once, cached forever) ──────────────────
let _configLoaded = false;
let _cfg = null;

function loadConfig() {
  if (_configLoaded) return _cfg;
  _configLoaded = true;
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const configPath = join(__dirname, "..", "..", "config", "rule-routing.json");
    _cfg = JSON.parse(readFileSync(configPath, "utf8"));
  } catch {
    _cfg = {};
  }
  return _cfg;
}

const STABILITY_THRESHOLD = () => {
  const c = loadConfig();
  return c?.stability_checks?.stability_threshold ?? 0.8;
};

const DOWNGRADE_CHAIN = () => {
  const c = loadConfig();
  if (c?.routing_downgrade_chain) {
    const chain = c.routing_downgrade_chain.chain || ["accept", "revise", "quarantine"];
    const m = {};
    for (let i = 0; i < chain.length - 1; i++) m[chain[i]] = chain[i + 1];
    m.discard = "discard";
    m.quarantine = "quarantine";
    return m;
  }
  return { accept: "revise", revise: "quarantine", quarantine: "quarantine", discard: "discard" };
};

/**
 * Quick stability check from a SINGLE audit result.
 * Runs internal consistency checks only — no second audit needed.
 * Suitable for inline use inside auditWithStabilityCheck.
 *
 * @param {Object} auditResult
 * @returns {{ stability_score: number, is_stable: boolean, inconsistencies: Array, recommendation: string }}
 */
export function quickStabilityCheck(auditResult) {
  const threshold = STABILITY_THRESHOLD();

  if (!auditResult) {
    return {
      stability_score: 0,
      is_stable: false,
      inconsistencies: [{ type: "null_audit", message: "No audit result provided" }],
      recommendation: "ERROR: No audit result to verify."
    };
  }

  const inconsistencies = [];

  // Check 1: Confidence-score vs routing alignment
  const confidenceAlignment = checkConfidenceRoutingAlignment(auditResult);
  if (!confidenceAlignment.is_aligned) {
    inconsistencies.push({
      type: "confidence_routing_mismatch",
      confidence: auditResult.confidence,
      routing: auditResult.routing_decision,
      message: confidenceAlignment.message,
      severity: confidenceAlignment.severity
    });
  }

  // Check 2: Fidelity score vs routing alignment
  const fidelityAudit = auditResult.fidelity;
  if (fidelityAudit && fidelityAudit.fidelity_score < threshold) {
    if (auditResult.routing_decision === "accept") {
      inconsistencies.push({
        type: "low_fidelity_accept",
        fidelity_score: fidelityAudit.fidelity_score,
        routing: auditResult.routing_decision,
        message: `Low fidelity (${fidelityAudit.fidelity_score}) but routing is 'accept' — unstable combination.`,
        severity: "high"
      });
    }
  }

  // Check 3: Human review requirement consistency
  const reviewConsistency = checkHumanReviewConsistency(auditResult);
  if (!reviewConsistency.is_consistent) {
    inconsistencies.push({
      type: "human_review_inconsistency",
      message: reviewConsistency.message,
      severity: reviewConsistency.severity
    });
  }

  const stabilityScore = calculateStabilityScore(inconsistencies);

  return {
    stability_score: stabilityScore,
    is_stable: stabilityScore >= threshold,
    threshold,
    rounds_checked: 1,
    inconsistencies,
    routing_decision: auditResult.routing_decision,
    confidence: auditResult.confidence,
    fidelity_score: fidelityAudit?.fidelity_score ?? null,
    recommendation: buildRecommendation(stabilityScore, inconsistencies, threshold)
  };
}

/**
 * Main stability verification function.
 * Compares two audit results (if second is provided) OR
 * runs internal consistency checks on a single result.
 *
 * @param {Object} auditResult - First audit result
 * @param {Object} options - { secondAudit?: Object, rounds?: number }
 * @returns {{ stability_score: number, is_stable: boolean, inconsistencies: Array, recommendation: string }}
 */
export function verifyAuditStability(auditResult, options = {}) {
  const { secondAudit } = options;

  if (!auditResult) {
    return {
      stability_score: 0,
      is_stable: false,
      inconsistencies: [{ type: "null_audit", message: "No audit result provided" }],
      recommendation: "ERROR: No audit result to verify."
    };
  }

  const threshold = STABILITY_THRESHOLD();
  const inconsistencies = [];

  // Check 1: Compare two audits if second is provided (non-determinism detection)
  if (secondAudit) {
    const routingCompare = compareRoutingDecision(auditResult, secondAudit);
    if (!routingCompare.is_same) {
      inconsistencies.push({
        type: "routing_inconsistency",
        first: auditResult.routing_decision,
        second: secondAudit.routing_decision,
        severity: routingCompare.severity,
        message: `Same material produced different routing: '${auditResult.routing_decision}' vs '${secondAudit.routing_decision}'`
      });
    }

    const blockerCompare = compareBlockers(auditResult.blockers, secondAudit.blockers);
    if (blockerCompare.mismatch_ratio > 0) {
      inconsistencies.push({
        type: "blocker_inconsistency",
        mismatch_ratio: blockerCompare.mismatch_ratio,
        message: `${blockerCompare.differences.length} blocker(s) differ between audits`,
        differences: blockerCompare.differences
      });
    }
  }

  // Check 2: Confidence-score vs routing alignment (single-result, always runs)
  const confidenceAlignment = checkConfidenceRoutingAlignment(auditResult);
  if (!confidenceAlignment.is_aligned) {
    inconsistencies.push({
      type: "confidence_routing_mismatch",
      confidence: auditResult.confidence,
      routing: auditResult.routing_decision,
      message: confidenceAlignment.message,
      severity: confidenceAlignment.severity
    });
  }

  // Check 3: Fidelity score vs routing alignment
  const fidelityAudit = auditResult.fidelity;
  if (fidelityAudit && fidelityAudit.fidelity_score < threshold) {
    if (auditResult.routing_decision === "accept") {
      inconsistencies.push({
        type: "low_fidelity_accept",
        fidelity_score: fidelityAudit.fidelity_score,
        routing: auditResult.routing_decision,
        message: `Low fidelity (${fidelityAudit.fidelity_score}) but routing is 'accept' — unstable combination.`,
        severity: "high"
      });
    }
  }

  // Check 4: Human review requirement consistency
  const reviewConsistency = checkHumanReviewConsistency(auditResult);
  if (!reviewConsistency.is_consistent) {
    inconsistencies.push({
      type: "human_review_inconsistency",
      message: reviewConsistency.message,
      severity: reviewConsistency.severity
    });
  }

  const stabilityScore = calculateStabilityScore(inconsistencies);

  return {
    stability_score: stabilityScore,
    is_stable: stabilityScore >= threshold,
    threshold,
    rounds_checked: secondAudit ? 2 : 1,
    inconsistencies,
    routing_decision: auditResult.routing_decision,
    confidence: auditResult.confidence,
    fidelity_score: fidelityAudit?.fidelity_score ?? null,
    recommendation: buildRecommendation(stabilityScore, inconsistencies, threshold)
  };
}

/**
 * Run a second audit on the same material to check stability.
 * Returns both the stability check result and the second audit result.
 *
 * v2.1.7: Optimized to run fullAudit ONCE and reuse the result.
 * The quickStabilityCheck runs internal consistency checks on the first result.
 * A second fullAudit is only needed when non-determinism is suspected.
 *
 * @param {Object} contentOrPacket
 * @param {Object} context
 * @param {Object} options - { skipSecondAudit?: boolean }
 * @returns {{ first_audit: Object, second_audit: Object|null, stability: Object }}
 */
export async function auditWithStabilityCheck(contentOrPacket, context = {}, options = {}) {
  // Dynamic import to break ESM circular dependency:
  // fidelity-stability.mjs ← index.mjs ← kernel.mjs ← fidelity-stability.mjs (cycle)
  // Dynamic import() resolves lazily at call time, not at module load time.
  const { fullAudit } = await import("./index.mjs");

  // Run first full audit
  const first = fullAudit(contentOrPacket, context);

  // Quick check from first result (no second audit needed for internal checks)
  const quick = quickStabilityCheck(first);

  // If skipSecondAudit, return early with single audit + quick check
  if (options.skipSecondAudit) {
    return {
      first_audit: first,
      second_audit: null,
      stability: { ...quick, rounds_checked: 1 }
    };
  }

  // Full path: second audit for non-determinism detection
  const second = fullAudit(contentOrPacket, context);
  const stability = verifyAuditStability(first, { secondAudit: second });

  return {
    first_audit: first,
    second_audit: second,
    stability
  };
}

/**
 * Apply stability gate: if unstable, downgrade routing.
 * Returns adjusted audit result with stability annotations.
 */
export function applyStabilityGate(auditResult, stabilityResult) {
  const isStable = stabilityResult?.is_stable ?? false;

  if (isStable) {
    return {
      ...auditResult,
      stability: stabilityResult,
      stability_gate_passed: true
    };
  }

  // Unstable: always run downgrade logic (discard stays discard by design)
  const downgradedRouting = downgradeRouting(auditResult.routing_decision);

  return {
    ...auditResult,
    stability: stabilityResult,
    stability_gate_passed: false,
    original_routing_decision: auditResult.routing_decision,
    routing_decision: downgradedRouting,
    human_review_required: true,
    additional_blockers: [
      {
        id: "audit_instability",
        severity: "high",
        message: `Audit stability score is ${stabilityResult.stability_score} — routing downgraded from '${auditResult.routing_decision}' to '${downgradedRouting}'. Human review required.`
      }
    ]
  };
}

// ── Internal helpers ────────────────────────────────────────────────────────

function compareRoutingDecision(a, b) {
  const same = a.routing_decision === b.routing_decision;

  // High severity: one is accept, other is discard
  const severities = {
    "accept-discard": "high",
    "accept-quarantine": "medium",
    "quarantine-revise": "low",
    "revise-discard": "medium",
    "revise-accept": "low",
    "quarantine-discard": "medium",
    "accept-revise": "low"
  };

  const key = [a.routing_decision, b.routing_decision].sort().join("-");
  const severity = severities[key] || "low";

  return { is_same: same, severity };
}

/**
 * Compare two blocker arrays for differences.
 * O(n) using Sets — was previously O(n²) nested loops.
 */
function compareBlockers(blockersA, blockersB) {
  const arrA = blockersA || [];
  const arrB = blockersB || [];

  // O(n) set build
  const idsA = new Set(arrA.map((b) => b.id));
  const idsB = new Set(arrB.map((b) => b.id));

  const differences = [];

  // O(n) scan
  for (const id of idsA) {
    if (!idsB.has(id)) differences.push({ in_first_only: id });
  }
  for (const id of idsB) {
    if (!idsA.has(id)) differences.push({ in_second_only: id });
  }

  const total = Math.max(idsA.size, idsB.size, 1);
  const mismatchRatio = Math.round((differences.length / total) * 100) / 100;

  return { mismatch_ratio: mismatchRatio, differences };
}

function checkConfidenceRoutingAlignment(audit) {
  const confidence = audit.confidence || "medium";
  const routing = audit.routing_decision || "revise";

  const rules = {
    "accept-high": true, "accept-medium": true,
    "revise-medium": true, "revise-low": true,
    "quarantine-medium": true, "quarantine-low": true,
    "quarantine-high": true,
    "discard-high": true, "discard-medium": true,
    "accept-low": false,
    "revise-high": false,
    "discard-low": false
  };

  const key = `${routing}-${confidence}`;
  const isAligned = rules[key] ?? true;

  return {
    is_aligned: isAligned,
    message: isAligned
      ? ""
      : `Confidence (${confidence}) and routing (${routing}) appear misaligned.`,
    severity: isAligned ? null : "medium"
  };
}

function checkHumanReviewConsistency(audit) {
  const routing = audit.routing_decision;
  const reviewRequired = audit.human_review_required;

  // accept without review is acceptable
  if (routing === "accept" && !reviewRequired) {
    return { is_consistent: true };
  }

  // quarantine/discard without review is acceptable
  if ((routing === "quarantine" || routing === "discard") && !reviewRequired) {
    return { is_consistent: true };
  }

  // revise with review is fine
  if (routing === "revise" && reviewRequired) {
    return { is_consistent: true };
  }

  // Low fidelity + accept without review is a problem
  if (routing === "accept" && !reviewRequired && audit.fidelity?.fidelity_score < 1.0) {
    return {
      is_consistent: false,
      message: `Routing is 'accept' without human review, but fidelity is ${audit.fidelity.fidelity_score}.`,
      severity: "high"
    };
  }

  return { is_consistent: true };
}

function calculateStabilityScore(inconsistencies) {
  if (inconsistencies.length === 0) return 1.0;

  const severityWeights = { high: 0.4, medium: 0.2, low: 0.1 };
  let totalDeduction = 0;

  for (const inc of inconsistencies) {
    const weight = severityWeights[inc.severity] || 0.1;
    totalDeduction += weight;
  }

  return Math.max(0, Math.round((1 - totalDeduction) * 100) / 100);
}

function downgradeRouting(original) {
  return DOWNGRADE_CHAIN()[original] || original;
}

function buildRecommendation(score, inconsistencies, threshold) {
  if (score >= threshold) {
    return "STABLE: Audit results are consistent across runs.";
  }

  const highSeverity = inconsistencies.filter((i) => i.severity === "high");
  if (highSeverity.length > 0) {
    return `UNSTABLE: ${highSeverity.length} high-severity inconsistency(ies) detected. Routing downgraded. Human review required before admission.`;
  }

  return `CAUTION: Stability score ${score} below threshold ${threshold}. Review inconsistencies.`;
}

export const FIDELITY_STABILITY_VERSION = "1.1.0";
