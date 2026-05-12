/**
 * fidelity.mjs
 *
 * F1: Report-Source Fidelity Verification
 *
 * Verifies that each "unresolved problem" in an audit report
 * actually exists in the source material without resolution.
 * Prevents generating false "unresolved" claims about content
 * that has already addressed the problem in later rounds.
 */

import { detectMetaAuditContent, extractProblemResolutionPairs } from "./meta-audit.mjs";

/**
 * Main fidelity verification function.
 * Takes an audit report and source content, returns fidelity report.
 *
 * @param {Object} auditResult - Mercury audit result
 * @param {string} sourceContent - Original source content
 * @returns {{ fidelity_score: number, claims: Array, unverified_claims: Array, verified_claims: Array }}
 */
export function verifyReportFidelity(auditResult, sourceContent) {
  const text = String(sourceContent || "");
  const blockers = auditResult.blockers || [];
  const warnings = auditResult.warnings || [];

  const claims = [];
  const verifiedClaims = [];
  const unverifiedClaims = [];

  // If source is meta-audit content, check against resolution pairs
  const metaDetection = detectMetaAuditContent(text);

  if (metaDetection.is_meta) {
    const pairs = extractProblemResolutionPairs(text);
    const resolvedProblems = new Set(
      pairs.filter((p) => p.resolved).map((p) => p.problem)
    );

    for (const blocker of blockers) {
      const finding = checkBlockerAgainstSource(blocker, text, resolvedProblems);
      claims.push(finding);
      if (finding.verified) {
        verifiedClaims.push(finding);
      } else {
        unverifiedClaims.push(finding);
      }
    }
  } else {
    // Standard material: each blocker is assessed normally
    for (const blocker of blockers) {
      const finding = {
        blocker_id: blocker.id,
        claim: blocker.message,
        verified: true,
        verified_against: "standard_material",
        source_quote: null,
        note: "Standard material: no multi-round resolution detected."
      };
      claims.push(finding);
      verifiedClaims.push(finding);
    }
  }

  const fidelityScore = claims.length === 0
    ? 1.0
    : Math.round((verifiedClaims.length / claims.length) * 100) / 100;

  return {
    fidelity_score: fidelityScore,
    total_claims: claims.length,
    verified_claims: verifiedClaims,
    unverified_claims: unverifiedClaims,
    meta_audit_detected: metaDetection.is_meta,
    meta_detection: metaDetection,
    recommendation: fidelityScore < 1.0
      ? "REVIEW_REQUIRED: Some claims could not be verified against source. Review unverified_claims."
      : "VERIFIED: All claims verified against source."
  };
}

/**
 * Check a single blocker against source content.
 */
function checkBlockerAgainstSource(blocker, sourceText, resolvedProblems) {
  const blockerText = blocker.message || blocker.id || "";

  // Try to find the problem concept in source
  const keywords = extractKeywords(blockerText);
  const sourceMatches = findSourceMatches(keywords, sourceText);

  if (sourceMatches.length === 0) {
    return {
      blocker_id: blocker.id,
      claim: blockerText,
      verified: false,
      verified_against: "no_source_match",
      source_quote: null,
      note: `No source match found for keywords: ${keywords.join(", ")}`
    };
  }

  // Check if any match is in resolved section
  const unresolvedMatches = sourceMatches.filter((m) => !resolvedProblems.has(m.text));

  if (unresolvedMatches.length === 0) {
    return {
      blocker_id: blocker.id,
      claim: blockerText,
      verified: false,
      verified_against: "all_resolved",
      source_quote: sourceMatches[0]?.text || null,
      note: "All source matches are in resolved sections. Claim may be stale."
    };
  }

  return {
    blocker_id: blocker.id,
    claim: blockerText,
    verified: true,
    verified_against: "unresolved_content",
    source_quote: unresolvedMatches[0]?.text || null,
    match_positions: unresolvedMatches.map((m) => m.position)
  };
}

/**
 * Extract searchable keywords from blocker text.
 */
function extractKeywords(text) {
  // Remove common stop words and extract content-bearing words
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "no", "not",
    "的", "是", "在", "了", "和", "与", "或", "及", "被"
  ]);

  const words = String(text)
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return [...new Set(words)];
}

/**
 * Find keyword matches in source text.
 */
function findSourceMatches(keywords, sourceText) {
  const matches = [];

  for (const keyword of keywords) {
    let pos = 0;
    while (true) {
      const idx = sourceText.toLowerCase().indexOf(keyword.toLowerCase(), pos);
      if (idx === -1) break;

      // Extract surrounding context (±100 chars)
      const start = Math.max(0, idx - 100);
      const end = Math.min(sourceText.length, idx + keyword.length + 100);
      const snippet = sourceText.slice(start, end).replace(/\n+/g, " ").trim();

      matches.push({
        keyword,
        position: idx,
        text: snippet
      });

      pos = idx + 1;
      if (matches.length > 5) break; // Cap per keyword
    }
  }

  return matches;
}

/**
 * Generates a fidelity-adjusted audit result.
 * If fidelity is low, flags results as needing review.
 */
export function applyFidelityGate(auditResult, fidelityReport) {
  if (fidelityReport.fidelity_score >= 1.0) {
    return {
      ...auditResult,
      fidelity: fidelityReport,
      fidelity_gate_passed: true
    };
  }

  // Fidelity score < 1.0: flag as needing human review
  return {
    ...auditResult,
    fidelity: fidelityReport,
    fidelity_gate_passed: false,
    human_review_required: true,
    additional_blockers: [
      {
        id: "report_fidelity_low",
        severity: "high",
        message: `Report fidelity score is ${fidelityReport.fidelity_score} — ${fidelityReport.unverified_claims.length} claim(s) could not be verified against source.`
      }
    ]
  };
}
