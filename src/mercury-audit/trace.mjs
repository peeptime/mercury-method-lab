/**
 * trace.mjs
 *
 * F4: Audit Traceability Annotations
 *
 * Generates source trace annotations for each audit conclusion,
 * so readers can verify claims against the original material.
 *
 * Provenance: [HUMAN_ONLY] design; [AI_GENERATED] implementation
 */

/**
 * Generates a trace annotation for a single audit conclusion.
 *
 * @param {Object} conclusion - e.g. { blocker_id, message, severity }
 * @param {string} sourceContent - Original source text
 * @param {string|null} claimedRound - Round number this concern was raised in
 * @returns {Object} trace annotation
 */
export function traceConclusion(conclusion, sourceContent, claimedRound = null) {
  const text = String(sourceContent || "");
  const keywords = extractKeywords(conclusion.message || conclusion.id || "");

  // Find the best matching quote from source
  let bestMatch = null;
  let bestScore = 0;

  for (const keyword of keywords) {
    let pos = 0;
    while (true) {
      const idx = text.toLowerCase().indexOf(keyword.toLowerCase(), pos);
      if (idx === -1) break;

      const snippet = extractSnippet(text, idx, keyword.length);
      const score = scoreMatch(keyword, snippet, conclusion.severity);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          keyword,
          position: idx,
          quote: snippet,
          line: countLines(text.slice(0, idx)) + 1
        };
      }

      pos = idx + 1;
      if (pos > text.length) break;
    }
  }

  return {
    conclusion_id: conclusion.id || conclusion.blocker_id || "unknown",
    claimed_round: claimedRound,
    best_source_match: bestMatch,
    traceable: bestMatch !== null,
    confidence: bestScore > 3 ? "high" : bestScore > 1 ? "medium" : "low"
  };
}

/**
 * Generate full trace report for an audit result.
 *
 * @param {Object} auditResult - Mercury audit result
 * @param {string} sourceContent - Original source text
 * @param {Object|null} fidelityReport - Fidelity report (if available)
 * @returns {Object} full trace report
 */
export function generateTraceReport(auditResult, sourceContent, fidelityReport = null) {
  const blockers = auditResult.blockers || [];
  const warnings = auditResult.warnings || [];

  const blockerTraces = blockers.map((blocker) =>
    traceConclusion(blocker, sourceContent)
  );

  const warningTraces = warnings.map((warning) =>
    traceConclusion(
      typeof warning === "string" ? { id: "warning", message: warning } : warning,
      sourceContent
    )
  );

  const traceableBlockers = blockerTraces.filter((t) => t.traceable).length;
  const traceableWarnings = warningTraces.filter((t) => t.traceable).length;

  return {
    total_blockers: blockers.length,
    traceable_blockers: traceableBlockers,
    untraceable_blockers: blockers.length - traceableBlockers,
    total_warnings: warnings.length,
    traceable_warnings: traceableWarnings,
    blocker_traces: blockerTraces,
    warning_traces: warningTraces,
    fidelity_report: fidelityReport,
    trace_coverage: blockers.length > 0
      ? Math.round((traceableBlockers / blockers.length) * 100) / 100
      : 1.0
  };
}

/**
 * Render trace report as markdown annotations.
 */
export function renderTraceMarkdown(traceReport, sourceName = "source") {
  const lines = [];

  lines.push(`## 溯源标注（Trace Annotations）`);
  lines.push(``);
  lines.push(`| 结论ID | 引用来源 | 原文片段 | 可追溯 |`);
  lines.push(`|--------|---------|---------|--------|`);
  lines.push(``);

  for (const trace of traceReport.blocker_traces) {
    const quote = trace.best_source_match?.quote
      ? truncate(trace.best_source_match.quote, 80)
      : "(无原文匹配)";
    const line = trace.best_source_match?.line
      ? `第${trace.best_source_match.line}行`
      : "—";
    const traceable = trace.traceable ? "✅" : "❌";

    lines.push(`| ${trace.conclusion_id} | ${line} | ${quote} | ${traceable} |`);
  }

  lines.push(``);
  lines.push(`**溯源覆盖率：** ${Math.round(traceReport.trace_coverage * 100)}%`);
  lines.push(``);

  if (traceReport.untraceable_blockers > 0) {
    lines.push(`⚠️ ${traceReport.untraceable_blockers} 个结论无原文引用，需人工补充。`);
  }

  return lines.join("\n");
}

/**
 * Generate a fidelity-adjusted checklist for Human Review.
 */
export function generateFidelityChecklist(auditResult, traceReport, fidelityReport = null) {
  const checklist = [];

  for (const trace of traceReport.blocker_traces) {
    if (!trace.traceable) {
      checklist.push({
        id: trace.conclusion_id,
        prompt: `结论"${trace.conclusion_id}"在原文中无对应引用。请确认：`,
        options: [
          "A. 该问题确实存在于原材料中，需要补充引用",
          "B. 该问题已被原材料后续内容消解，应从报告中移除",
          "C. 该问题是通用审计项，无需原文引用"
        ],
        recommended: "A"
      });
    } else if (fidelityReport) {
      const fidelityEntry = fidelityReport.unverified_claims?.find(
        (u) => u.blocker_id === trace.conclusion_id
      );
      if (fidelityEntry) {
        checklist.push({
          id: trace.conclusion_id,
          prompt: `结论"${trace.conclusion_id}"的原文引用可能已过时或属于消解内容。请确认：`,
          options: [
            "A. 引用有效，该问题确实未解决",
            "B. 该问题已被原材料消解，更新报告",
            "C. 需要重新在原材料中定位该问题的位置"
          ],
          recommended: "B"
        });
      }
    }
  }

  return checklist;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractSnippet(text, position, keywordLen) {
  const start = Math.max(0, position - 60);
  const end = Math.min(text.length, position + keywordLen + 120);
  return text.slice(start, end).replace(/\n+/g, " ").trim();
}

function scoreMatch(keyword, snippet, severity) {
  let score = 0;
  const lower = snippet.toLowerCase();
  const klower = keyword.toLowerCase();

  if (lower.includes(klower)) score += 2;
  if (severity === "critical") score += 1;
  if (lower.includes("未") || lower.includes("不") || lower.includes("无")) score += 1;

  return score;
}

function extractKeywords(text) {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "no", "not",
    "的", "是", "在", "了", "和", "与", "或", "被", "有", "没"
  ]);

  return [...new Set(
    String(text)
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
      .slice(0, 8)
  )];
}

function countLines(text) {
  return (text.match(/\n/g) || []).length;
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}
