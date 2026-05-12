/**
 * meta-audit.mjs
 *
 * F3: Meta-Audit Detection
 *
 * Detects whether input is:
 *  - raw material (standard audit path)
 *  - a completed multi-round audit process (meta-audit path)
 *
 * Provenance: [HUMAN_ONLY] design; [AI_GENERATED] implementation
 */

const ITERATION_MARKERS = [
  "第",       // 第N轮
  "round",
  "iteration",
  "消错",
  "审计过程",
  "审视",
  "质疑",
  "分解",
  "提炼",
  "剥离",
  "剔除",
  "消解",
  "对照表",
  "结构化概括"
];

const META_LANGUAGE_PATTERNS = [
  { pattern: /第[一二三四五六七八九十\d]+轮/, confidence: "high" },
  { pattern: /round\s*\d+/i, confidence: "high" },
  { pattern: /iteration\s*\d+/i, confidence: "high" },
  { pattern: /消错|消解|消.*错/, confidence: "high" },
  { pattern: /这个论断的问题在于/, confidence: "high" },
  { pattern: /本质是|核心是/, confidence: "low" },
  { pattern: /映射到|类比/, confidence: "low" }
];

const BLOCKER_RESOLUTION_PATTERNS = [
  { marker: "已解决", status: "resolved" },
  { marker: "✅ 已消解", status: "resolved" },
  { marker: "消解：", status: "resolved" },
  { marker: "已修正", status: "resolved" },
  { marker: "已重新定义", status: "resolved" },
  { marker: "加了", status: "resolved" },        // e.g. "加了避免绝对化的补充说明"
  { marker: "改为", status: "resolved" },         // e.g. "改为异构化"
  { marker: "剔除后", status: "resolved" },      // e.g. "剔除后聚焦"
  { marker: "保留核心", status: "resolved" },     // e.g. "保留核心事实"
  { marker: "明确", status: "resolved" },        // e.g. "明确剔除"
  { marker: "重新定义", status: "resolved" },    // e.g. "重新定义为"
  { marker: "加了补充说明", status: "resolved" }
];

/**
 * Detects if content is a completed multi-round audit.
 * @param {string} content - Raw text content
 * @returns {{ is_meta: boolean, confidence: string, markers: string[], reason: string }}
 */
export function detectMetaAuditContent(content) {
  const text = String(content || "");
  const matchedMarkers = [];

  for (const marker of ITERATION_MARKERS) {
    if (text.includes(marker)) {
      matchedMarkers.push(marker);
    }
  }

  for (const { pattern, confidence } of META_LANGUAGE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matchedMarkers.push(...matches);
    }
  }

  // Require at least 2 markers to consider it meta-audit
  const isMetaAudit = matchedMarkers.length >= 2;

  const reason = isMetaAudit
    ? `Detected ${matchedMarkers.length} meta-audit markers: ${[...new Set(matchedMarkers)].slice(0, 5).join(", ")}`
    : "Fewer than 2 meta-audit markers detected; treating as standard material.";

  return {
    is_meta: isMetaAudit,
    confidence: isMetaAudit ? "medium" : "none",
    markers: [...new Set(matchedMarkers)],
    reason
  };
}

/**
 * Checks if a specific problem raised in early rounds has been resolved
 * in later parts of the content.
 *
 * @param {string} problemText - The unresolved problem text
 * @param {string} fullContent - Full content text
 * @param {number} problemRound - Round number where the problem was raised (1-based)
 * @returns {{ resolved: boolean, resolutionEvidence: string|null, resolutionRound: number|null }}
 */
export function checkProblemResolution(problemText, fullContent, problemRound = 1) {
  const text = String(fullContent || "");

  for (const { marker, status } of BLOCKER_RESOLUTION_PATTERNS) {
    // Look for resolution markers in content AFTER the problem was raised
    // Simple heuristic: check if marker appears in content
    if (text.includes(marker)) {
      return {
        resolved: status === "resolved",
        resolutionEvidence: `Found resolution marker "${marker}"`,
        resolutionRound: problemRound + 1
      };
    }
  }

  return {
    resolved: false,
    resolutionEvidence: null,
    resolutionRound: null
  };
}

/**
 * Detects the number of rounds in a meta-audit document.
 * @param {string} content
 * @returns {{ rounds: number, roundMarkers: Array<{marker: string, position: number}> }}
 */
export function detectRounds(content) {
  const text = String(content || "");
  const roundPattern = /第[一二三四五六七八九十\d]+轮|round\s*\d+|迭代[零一二三四五六七八九十\d]+/gi;
  const matches = [...text.matchAll(roundPattern)];

  return {
    rounds: matches.length > 0 ? matches.length + 1 : 1,
    roundMarkers: matches.map((m, i) => ({
      marker: m[0],
      position: m.index,
      order: i + 1
    }))
  };
}

/**
 * Extracts problem-resolution pairs from a meta-audit document.
 * Looks for "问题：" / "潜在干扰：" / "消解：" / "解决：" patterns.
 *
 * @param {string} content
 * @returns {Array<{problem: string, resolution: string|null, resolved: boolean}>}
 */
export function extractProblemResolutionPairs(content) {
  const text = String(content || "");
  const pairs = [];

  // Match problem statements
  const problemPattern = /(?:问题|潜在干扰|疑问)[:：]([^\n]+)/g;
  const resolutionPattern = /(?:消解|解决|处理|修正|补充说明)[:：]([^\n]+)/g;

  let problemMatch;
  while ((problemMatch = problemPattern.exec(text)) !== null) {
    const problem = problemMatch[1].trim();
    const afterProblem = text.slice(problemMatch.index + problemMatch[0].length, problemMatch.index + problemMatch[0].length + 500);

    let resolved = false;
    let resolution = null;

    // Look for resolution after this problem
    for (const { marker } of BLOCKER_RESOLUTION_PATTERNS) {
      if (afterProblem.includes(marker)) {
        resolved = true;
        resolution = `Marker "${marker}" found after problem statement.`;
        break;
      }
    }

    const resolutionMatch = resolutionPattern.exec(afterProblem);
    if (resolutionMatch) {
      resolved = true;
      resolution = resolutionMatch[1].trim().slice(0, 200);
    }

    pairs.push({ problem, resolution, resolved });
  }

  return pairs;
}
