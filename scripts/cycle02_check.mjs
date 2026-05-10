import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const strict = process.argv.includes("--strict");

const checks = [];
const warnings = [];

const packageJson = await readJson("package.json");
const productSurfaceUnfreeze = packageJson.version.startsWith("1.3.")
  && await exists("docs/PRODUCT-SURFACE-PRESSURE-TEST.md");
const proofPack = await readText("docs/PROOF-PACK-001.md");
const failureModes = await readText("docs/FAILURE-MODES.md");
const charterUsers = await readText("docs/CHARTER-USER-RECORDS.md");
const reviewLedger = await readText("docs/REVIEW-LEDGER.md");

check("version stays on v1.2.x or has documented product-surface unfreeze", packageJson.version.startsWith("1.2.") || productSurfaceUnfreeze);
if (productSurfaceUnfreeze) {
  warnings.push("product surface unfreeze detected: method-layer Cycle 02 checks still apply, but v1.3.x is allowed for product UI work");
}

const cases = splitSections(proofPack, /^## Case \d{3}:[^\n]*$/gm);
check("Proof Pack 001 has at least 10 cases", cases.length >= 10);

const requiredCaseHeadings = [
  "### Raw Output",
  "### Why It Sounds Plausible",
  "### Evidence Gap",
  "### Memory Pollution Risk",
  "### Mercury Decision",
  "### Rule Learned"
];

for (const section of cases) {
  const title = section.title.replace(/^##\s*/, "");
  for (const heading of requiredCaseHeadings) {
    check(`${title} includes ${heading.replace("### ", "")}`, section.body.includes(heading));
  }
  check(`${title} declares routing_decision`, /routing_decision:\s*\w+/.test(section.body));
  check(`${title} declares failure_modes`, /failure_modes:\s*\n\s*-/.test(section.body));
}

const modes = splitSections(failureModes, /^## FM-\d+:[^\n]*$/gm);
check("Failure Mode Dictionary has at least 20 modes", modes.length >= 20);

for (const mode of modes) {
  const title = mode.title.replace(/^##\s*/, "");
  check(`${title} includes Definition`, mode.body.includes("**Definition:**"));
  check(`${title} includes Proof Pack Reference`, mode.body.includes("**Proof Pack Reference:**"));
  check(`${title} includes Near Miss`, mode.body.includes("**Near Miss:**"));
}

const realRecords = Number(charterUsers.match(/real_records_collected:\s*(\d+)/)?.[1] ?? 0);
if (realRecords < 3) {
  warnings.push(`charter user records are external-dependent: ${realRecords}/3 collected`);
  if (strict) {
    check("strict charter user target met", false);
  }
}

const cycleEntries = reviewLedger.split("## Pre-Cycle Carryover")[0] ?? reviewLedger;
const pendingCycleEntries = [...cycleEntries.matchAll(/\|\s*[^|\n]+\s*\|\s*pending\s*\|/g)].length;
check("Cycle 02 ledger has no pending review entries", pendingCycleEntries === 0);
check("Review ledger uses declined for AI-only Cycle 02 outputs", cycleEntries.includes("| declined |"));

for (const result of checks) {
  console.log(`${result.ok ? "OK" : "FAIL"} ${result.name}`);
}

for (const warning of warnings) {
  console.log(`WARN ${warning}`);
}

if (checks.some((result) => !result.ok)) {
  process.exitCode = 1;
}

function check(name, ok) {
  checks.push({ name, ok: Boolean(ok) });
}

async function readText(path) {
  return readFile(join(root, path), "utf8");
}

async function readJson(path) {
  return JSON.parse(await readText(path));
}

async function exists(path) {
  try {
    await access(join(root, path));
    return true;
  } catch {
    return false;
  }
}

function splitSections(text, headingPattern) {
  const matches = [...text.matchAll(headingPattern)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? text.length;
    const section = text.slice(start, end);
    const [title = "", ...bodyLines] = section.split(/\r?\n/);
    return {
      title,
      body: bodyLines.join("\n")
    };
  });
}
