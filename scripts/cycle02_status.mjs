import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const files = {
  packageJson: "package.json",
  proofPack: "docs/PROOF-PACK-001.md",
  failureModes: "docs/FAILURE-MODES.md",
  charterUsers: "docs/CHARTER-USER-RECORDS.md",
  reviewLedger: "docs/REVIEW-LEDGER.md"
};

const [packageJson, proofPack, failureModes, charterUsers, reviewLedger] = await Promise.all([
  readJson(files.packageJson),
  readText(files.proofPack),
  readText(files.failureModes),
  readText(files.charterUsers),
  readText(files.reviewLedger)
]);

const caseCount = countMatches(proofPack, /^## Case \d{3}:/gm);
const modeCount = countMatches(failureModes, /^## FM-\d+:/gm);
const realUserRecords = Number(charterUsers.match(/real_records_collected:\s*(\d+)/)?.[1] ?? 0);
const cycleEntries = reviewLedger.split("## Pre-Cycle Carryover")[0] ?? reviewLedger;
const pendingCycleEntries = countMatches(cycleEntries, /\|\s*[^|\n]+\s*\|\s*pending\s*\|/g);

console.log(`Mercury Method Lab ${packageJson.version} (${packageJson.codename})`);
console.log(`cycle_line: ${packageJson.version.startsWith("1.2.") ? "v1.2.x patch" : packageJson.version.startsWith("1.3.") ? "v1.3.x product-surface / Lite intake patch" : "outside Cycle 02 patch line"}`);
console.log(`proof_pack_cases: ${caseCount}/10`);
console.log(`failure_modes: ${modeCount}/20`);
console.log(`charter_user_records: ${realUserRecords}/3 external-dependent`);
console.log(`cycle_review_pending_entries: ${pendingCycleEntries}`);
console.log("");
console.log("next_low_token_commands:");
console.log("  npm run cycle:check");
console.log("  npm run capture:check");
console.log("  npm run validate:incr");
console.log("  npm run index:incr");
console.log("");
console.log("cycle_02_stop_rules:");
console.log("  no new major framework names");
console.log("  no method-layer minor release without a documented unfreeze");
console.log("  no fake human review");
console.log("  no fake charter users");

async function readText(path) {
  return readFile(join(root, path), "utf8");
}

async function readJson(path) {
  return JSON.parse(await readText(path));
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}
