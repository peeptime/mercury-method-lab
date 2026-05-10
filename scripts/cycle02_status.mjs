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
console.log(`cycle_line: ${cycleLine(packageJson.version)}`);
console.log(`proof_pack_cases: ${caseCount}/10`);
console.log(`failure_modes: ${modeCount}/20`);
console.log(`charter_user_records: ${realUserRecords}/3 external-dependent`);
console.log(`cycle_review_pending_entries: ${pendingCycleEntries}`);
if (packageJson.version.startsWith("1.4.")) {
  console.log("method_depth_docs: taxonomy/routing/coverage/related-work/blueprint");
}
if (packageJson.version.startsWith("1.5.")) {
  console.log("review_ux_docs: start-here/scope/export/i18n");
  console.log("review_ux_outputs: content_summary/human_review_checklist/progressive_disclosure");
}
if (packageJson.version.startsWith("1.6.")) {
  console.log("sdk_integration_docs: sdk-api/owasp-c8/integration-demo/benchmarks");
  console.log("sdk_integration_outputs: audit_api/memory_write_hook/policy_layer/local_benchmark");
}
if (packageJson.version.startsWith("1.7.")) {
  console.log("audit_kernel_docs: audit-kernel/ecosystem-position/mercury-agent-relationship");
  console.log("audit_kernel_outputs: profiles/standards/source_credibility/lifecycle/disagreement");
}
if (packageJson.version.startsWith("1.8.")) {
  console.log("scenario_pack_docs: scenario-packs/adapter-contract/review-ux-guide");
  console.log("scenario_pack_outputs: ai-coding/personal-knowledge/investment/enterprise/legal-medical");
}
if (packageJson.version.startsWith("1.9.")) {
  console.log("proof_governance_docs: proof-pack-002/rule-version/lifecycle/disagreement/anti-gaming");
  console.log("proof_governance_outputs: FM-23..FM-28/governance tests/ruleset version");
}
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

function cycleLine(version) {
  if (version.startsWith("1.2.")) return "v1.2.x patch";
  if (version.startsWith("1.3.")) return "v1.3.x product-surface / Lite intake patch";
  if (version.startsWith("1.4.")) return "v1.4.x method taxonomy / routing blueprint";
  if (version.startsWith("1.5.")) return "v1.5.x human review checklist UX";
  if (version.startsWith("1.6.")) return "v1.6.x pre-storage audit SDK";
  if (version.startsWith("1.7.")) return "v1.7.x audit kernel independence";
  if (version.startsWith("1.8.")) return "v1.8.x open scenario packs";
  if (version.startsWith("1.9.")) return "v1.9.x proof governance expansion";
  return "outside documented Cycle 02/04 line";
}
