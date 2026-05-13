/**
 * intake-feedback.mjs — v2.1.5
 * Quick Audit feedback module: structured scoring + routing hint for pasted content.
 *
 * Provides lightweight content analysis without LLM calls.
 * Used by dashboard /api/intake-feedback and Lite Mode.
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Claim Extractors ────────────────────────────────────────────────────────

/**
 * Extract discrete factual claims from plain text.
 * Returns an array of { claim, indicator, position } objects.
 */
export function extractClaims(text) {
  if (!text || text.trim().length < 20) return [];

  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  return sentences.map((sentence, index) => {
    const indicator = classifyClaimIndicator(sentence);
    return {
      claim: sentence,
      indicator, // "factual" | "opinion" | "speculative" | "procedural"
      position: index,
      charCount: sentence.length,
    };
  });
}

/**
 * Classify the epistemic indicator of a sentence.
 */
function classifyClaimIndicator(sentence) {
  const lower = sentence.toLowerCase();

  const factualSignals = [
    /\b(is|are|was|were|will be|has been|have been)\s+\w+\s+(in|on|at|by|for|with|through|from|to)\b/,
    /\b(according to|published|reported|documented|measured|recorded|observed)\b/,
    /\bpercent|%|percentage|\d+(\.\d+)?\s*(x|times|billion|million|thousand|kg|mb|gb)\b/i,
    /\b(pmcid|doi|arxiv|patent|isbn|https?)\b/i,
  ];

  const speculativeSignals = [
    /\b(might|may|could|possibly|perhaps|probably|likely|unlikely)\b/i,
    /\b(if |when |assuming |supposing )\b/i,
    /\b(seems to|appears to|looks like|potentially)\b/i,
    /\b(future|eventually|will likely|may eventually)\b/i,
  ];

  const opinionSignals = [
    /\b(i think|i believe|i feel|in my opinion|from my perspective)\b/i,
    /\b(the best|the worst|clearly|obviously|definitely)\b/i,
    /\b(should|must|ought to|need to)\s+(be|have|do|not)\b/i,
    /\b(good|bad|better|worse|ideal|wrong)\b/i,
  ];

  const proceduralSignals = [
    /\b(step|stage|phase|process|method|approach|workflow)\b/i,
    /\b(first|then|next|finally|after|before|during)\b/i,
    /\b(how to|how do|instructions|guide|manual|checklist)\b/i,
  ];

  for (const pattern of factualSignals) {
    if (pattern.test(lower)) return "factual";
  }
  for (const pattern of speculativeSignals) {
    if (pattern.test(lower)) return "speculative";
  }
  for (const pattern of opinionSignals) {
    if (pattern.test(lower)) return "opinion";
  }
  for (const pattern of proceduralSignals) {
    if (pattern.test(lower)) return "procedural";
  }

  return "unclear";
}

// ── Quick Scoring ────────────────────────────────────────────────────────────

/**
 * Generate a quick content quality score (no LLM needed).
 * Returns a structured feedback object.
 */
export function scoreContentQuick(text) {
  const claims = extractClaims(text);
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;

  // Structure score
  const hasStructure =
    /[#*_`>-]/.test(text) ||
    /\n\n/.test(text) ||
    /^(#{1,3}\s|[-*]\s|\d+\.\s)/m.test(text);

  const hasConclusion =
    /(因此|所以|综上|结论|综上所述|综上所述|in conclusion|to summarize|therefore|as a result|in summary)/i.test(text);

  const hasEvidence =
    /(据|根据|数据|研究|报告|来源|evidence|source|research|study|according to)/i.test(text);

  const hasSpecifics =
    /\b(具体|明确|详细|specifically|explicitly|precisely|exact)\b/i.test(text);

  // Count question marks (may indicate undefined scope)
  const questionCount = (text.match(/\?/g) || []).length;
  const hasUndefinedScope = questionCount > 3;

  // Check for hedging language
  const hedgeCount = (text.match(
    /\b(might be|could be|may be|perhaps|possibly|probably|likely|unclear|uncertain|unknown|tbd|to be determined)\b/gi
  ) || []).length;
  const hedgeRatio = wordCount > 0 ? hedgeCount / wordCount : 0;

  const structureScore = hasStructure ? 1 : 0;
  const conclusionScore = hasConclusion ? 1 : 0;
  const evidenceScore = hasEvidence ? 1 : 0;
  const specificityScore = hasSpecifics ? 1 : 0;
  const hedgePenalty = Math.min(hedgeRatio * 10, 2); // up to -2 for heavy hedging

  const overall = Math.max(
    0,
    Math.min(
      10,
      Math.round(
        ((structureScore * 2 +
          conclusionScore * 2 +
          evidenceScore * 3 +
          specificityScore * 3 -
          hedgePenalty) /
          10) *
          10
      )
    )
  );

  const qualityLevel =
    overall >= 7
      ? "high"
      : overall >= 4
      ? "medium"
      : "low";

  // Claim distribution
  const claimCounts = claims.reduce(
    (acc, c) => {
      acc[c.indicator] = (acc[c.indicator] || 0) + 1;
      return acc;
    },
    {}
  );

  // Quick routing hint
  const routingHint = generateQuickRoutingHint({
    wordCount,
    hasEvidence,
    hasConclusion,
    overall,
    hedgeRatio,
    claimCounts,
  });

  return {
    wordCount,
    charCount,
    claimCount: claims.length,
    claimDistribution: claimCounts,
    scores: {
      structure: structureScore,
      conclusion: conclusionScore,
      evidence: evidenceScore,
      specificity: specificityScore,
      overall: overall,
    },
    qualityLevel,
    flags: {
      heavyHedging: hedgeRatio > 0.05,
      undefinedScope: hasUndefinedScope,
      noEvidence: !hasEvidence,
      noConclusion: !hasConclusion,
    },
    routingHint,
    sampleClaims: claims.slice(0, 3),
  };
}

function generateQuickRoutingHint({ wordCount, hasEvidence, hasConclusion, overall, hedgeRatio, claimCounts }) {
  // Reject signals
  if (hedgeRatio > 0.1) return "revise";
  if (!hasEvidence && overall < 4) return "quarantine";
  if (!hasConclusion && wordCount > 300) return "revise";

  // Accept signals
  if (overall >= 7 && hasEvidence) return "accept";
  if (overall >= 6 && claimCounts.factual >= 2) return "accept";

  // Default
  return overall >= 5 ? "accept" : "revise";
}

// ── Batch Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze a batch of text snippets.
 * Returns aggregated stats + per-item scores.
 */
export function analyzeContentBatch(items) {
  const results = items.map((item) => ({
    id: item.id || item.path || `item-${Math.random().toString(36).slice(2, 7)}`,
    text: item.text,
    score: scoreContentQuick(item.text),
  }));

  const avgQuality =
    results.reduce((sum, r) => sum + r.score.scores.overall, 0) /
    (results.length || 1);

  const claimTotals = results.reduce(
    (acc, r) => {
      Object.entries(r.score.claimDistribution).forEach(([k, v]) => {
        acc[k] = (acc[k] || 0) + v;
      });
      return acc;
    },
    {}
  );

  return {
    count: results.length,
    avgQuality: Math.round(avgQuality * 10) / 10,
    claimTotals,
    items: results,
    summary: generateBatchSummary(results, avgQuality),
  };
}

function generateBatchSummary(results, avgQuality) {
  if (results.length === 0) return "No content to analyze.";

  const highCount = results.filter((r) => r.score.qualityLevel === "high").length;
  const lowCount = results.filter((r) => r.score.qualityLevel === "low").length;

  return [
    `${results.length} items analyzed.`,
    `Average quality: ${avgQuality.toFixed(1)}/10`,
    highCount > 0 ? `${highCount} high-quality (recommended for admission).` : null,
    lowCount > 0 ? `${lowCount} low-quality (need revision before admission).` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

// ── Self-Audit (Mercury evaluating its own outputs) ──────────────────────────

/**
 * Quick self-audit: evaluate whether a Mercury-generated report is
 * internally consistent and well-grounded.
 */
export function selfAuditReport(reportText, sourceMaterial) {
  const reportScore = scoreContentQuick(reportText);

  // Check self-reference (good: grounded in source)
  const sourceRefs = (reportText.match(/\[source:|\[来自|据.*来源\]/gi) || []).length;
  const hasGrounding = sourceRefs > 0;

  // Check self-citation (bad: circular reasoning)
  const selfCitations = (reportText.match(
    /\[本报告|上文|前述|在前文|在本次|本次审计\]/gi
  ) || []).length;
  const hasCircularity = selfCitations > 0;

  // Check structural completeness
  const hasSections =
    /[#*]{1,3}\s*(问题|结论|建议|证据|发现|摘要)/.test(reportText) ||
    /^(#{1,3}\s|\d+\.\s)/.test(reportText);

  return {
    reportScore,
    groundingCheck: {
      sourceRefs,
      hasGrounding,
      assessment: hasGrounding
        ? "Well-grounded in source material."
        : "Lacks explicit source references.",
    },
    circularityCheck: {
      selfCitations,
      hasCircularity,
      assessment: hasCircularity
        ? "Contains self-references — review for circular logic."
        : "No obvious circular reasoning detected.",
    },
    structureCheck: {
      hasSections,
      assessment: hasSections
        ? "Structurally organized."
        : "Lacks clear section structure.",
    },
    verdict:
      hasGrounding && !hasCircularity && reportScore.overall >= 5
        ? "pass"
        : "review",
  };
}

export const INTAKE_FEEDBACK_VERSION = "1.0.0";
