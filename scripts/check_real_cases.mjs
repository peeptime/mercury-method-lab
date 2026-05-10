import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const caseRoot = join(root, "cases", "2026-05");
const entries = await readdir(caseRoot, { withFileTypes: true });
const caseDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

assert.ok(caseDirs.length >= 10, `expected at least 10 cases, received ${caseDirs.length}`);

const decisions = new Map();

for (const caseId of caseDirs) {
  const dir = join(caseRoot, caseId);
  const [input, resultText, reviewStatus] = await Promise.all([
    readFile(join(dir, "input.md"), "utf8"),
    readFile(join(dir, "audit-result.json"), "utf8"),
    readFile(join(dir, "review-status.yaml"), "utf8")
  ]);
  const result = JSON.parse(resultText);
  const decision = result.routing_decision || result.audit_result?.routing_decision;
  assert.ok(input.includes("# "), `${caseId} input missing title`);
  assert.ok(decision, `${caseId} missing routing decision`);
  assert.ok(reviewStatus.includes("human_reviewed: declined"), `${caseId} must remain declined until named review`);
  decisions.set(decision, (decisions.get(decision) || 0) + 1);
}

for (const requiredDecision of ["accept", "revise", "quarantine", "discard"]) {
  assert.ok(decisions.has(requiredDecision), `expected at least one ${requiredDecision} case`);
}

const summary = await readFile(join(root, "docs", "REAL-CASES-SUMMARY.md"), "utf8");
assert.ok(summary.includes("case_root: `cases/2026-05/`"), "summary must identify case root");
assert.ok(summary.includes("human_reviewed: declined"), "summary must keep declined review state");

console.log(`OK real case foundation checks passed (${caseDirs.length} cases)`);

