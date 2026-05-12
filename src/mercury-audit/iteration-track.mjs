/**
 * iteration-track.mjs
 *
 * F2: Round-Aware Problem Resolution Tracker
 *
 * For multi-round audit materials, tracks which problems raised in early rounds
 * are resolved in later rounds, and which remain unresolved.
 *
 * Provenance: [HUMAN_ONLY] design; [AI_GENERATED] implementation
 */

/**
 * Parse a multi-round audit document and build a round-aware problem tracker.
 *
 * @param {string} content - Full document text
 * @returns {{ rounds: Array, problemTracker: Array, unresolvedCount: number, summary: string }}
 */
export function buildIterationTracker(content) {
  const text = String(content || "");
  const rounds = detectRounds(text);
  const problemTracker = extractProblems(text);
  const resolvedTracker = trackResolutions(problemTracker, text);

  const unresolvedCount = resolvedTracker.filter((p) => !p.resolved).length;

  return {
    rounds,
    problem_tracker: resolvedTracker,
    unresolved_count: unresolvedCount,
    summary: buildSummary(resolvedTracker, unresolvedCount),
    recommendation: unresolvedCount === 0
      ? "All raised problems have been resolved. Material is clean."
      : `${unresolvedCount} problem(s) remain unresolved. Report should flag only these.`
  };
}

/**
 * Detect round boundaries in the document.
 */
function detectRounds(text) {
  const roundBoundaries = [];

  // Pattern: "第N轮" or "第N次" or "Round N"
  const roundPattern = /(第[一二三四五六七八九十\d]+(?:轮|次)|Round\s*\d+|迭代[零一二三四五六七八九十\d]+)/gi;
  let match;

  const pattern = /(第[一二三四五六七八九十\d]+(?:轮|次)|round\s*\d+|iteration\s*\d+|迭代[零一二三四五六七八九十\d]+)/gi;
  const positions = [];
  while ((match = pattern.exec(text)) !== null) {
    positions.push({
      marker: match[0],
      start: match.index,
      end: match.index + match[0].length,
      round: extractRoundNumber(match[0])
    });
  }

  // Split content into rounds
  const rounds = [];
  if (positions.length === 0) {
    rounds.push({ round: 1, start: 0, end: text.length, content: text });
  } else {
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const nextStart = i < positions.length - 1 ? positions[i + 1].start : text.length;
      rounds.push({
        round: pos.round,
        marker: pos.marker,
        start: pos.start,
        end: nextStart,
        content: text.slice(pos.start, nextStart)
      });
    }
  }

  return rounds;
}

/**
 * Extract round number from a marker like "第一轮" or "Round 2".
 */
function extractRoundNumber(marker) {
  const chinese = { "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10 };
  const numMatch = String(marker).match(/\d+/);
  if (numMatch) return parseInt(numMatch[0], 10);

  for (const [chineseChar, num] of Object.entries(chinese)) {
    if (marker.includes(chineseChar)) return num;
  }
  return 1;
}

/**
 * Extract problems from each round's content.
 */
function extractProblems(text) {
  const problems = [];

  // Match problem statements
  const patterns = [
    /(?:问题|潜在干扰|疑问|争议|存疑|未验证|缺陷)[:：]\s*([^\n]+)/g,
    /(?:可能|也许|存疑)[^。\n]+/g
  ];

  // First pass: explicit problem markers
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const problemText = match[1]?.trim() || match[0].trim();
      if (problemText.length > 5 && problemText.length < 500) {
        const round = inferRoundFromPosition(text, match.index);
        problems.push({
          id: `p${problems.length + 1}`,
          text: problemText,
          raised_at: match.index,
          raised_in_round: round,
          status: "pending",
          resolved_at: null,
          resolution_evidence: null
        });
      }
    }
  }

  // Deduplicate
  const seen = new Set();
  return problems.filter((p) => {
    const key = p.text.slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Infer which round a position belongs to.
 */
function inferRoundFromPosition(text, position) {
  const roundPattern = /(第[一二三四五六七八九十\d]+(?:轮|次)|round\s*\d+)/gi;
  let lastRound = 1;
  let match;

  while ((match = roundPattern.exec(text.slice(0, position))) !== null) {
    lastRound = extractRoundNumber(match[0]);
  }

  return lastRound;
}

/**
 * Track resolution status of each problem.
 */
function trackResolutions(problems, text) {
  const RESOLUTION_MARKERS = [
    // Chinese markers
    "已解决", "消解", "✅ 已消解", "已修正", "已重新定义",
    "加了", "改为", "剔除后", "保留核心", "明确",
    "加了补充说明", "消解了", "处理了", "已处理",
    "避免绝对化", "重新定义", "加了边界声明",
    // English markers
    "resolved", "addressed", "fixed", "corrected", "revised"
  ];

  return problems.map((problem) => {
    // Search in content AFTER the problem was raised
    const afterProblem = text.slice(problem.raised_at + problem.text.length);

    for (const marker of RESOLUTION_MARKERS) {
      if (afterProblem.includes(marker)) {
        // Extract surrounding context
        const markerPos = afterProblem.indexOf(marker);
        const contextStart = Math.max(0, markerPos - 50);
        const contextEnd = Math.min(afterProblem.length, markerPos + marker.length + 100);
        const evidence = afterProblem.slice(contextStart, contextEnd).replace(/\n+/g, " ").trim();

        return {
          ...problem,
          status: "resolved",
          resolved_at: problem.raised_at + markerPos,
          resolution_evidence: evidence.slice(0, 300),
          resolution_marker: marker
        };
      }
    }

    return {
      ...problem,
      status: "unresolved"
    };
  });
}

/**
 * Build human-readable summary.
 */
function buildSummary(tracker, unresolvedCount) {
  const resolved = tracker.filter((p) => p.status === "resolved").length;
  const total = tracker.length;

  if (total === 0) {
    return "No explicit problems detected in document.";
  }

  return `${resolved}/${total} problems resolved. ${unresolvedCount} remain unresolved.`;
}

/**
 * Get only unresolved problems (for audit report).
 */
export function getUnresolvedProblems(content) {
  const tracker = buildIterationTracker(content);
  return tracker.problem_tracker.filter((p) => p.status === "unresolved");
}
