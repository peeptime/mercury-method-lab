import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPackets } from "./audit-core/audit_rules.mjs";
import { readAuditPackets } from "./audit-core/packet_io.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packets = await readAuditPackets(root);
const audit = auditPackets(packets);
const byId = new Map(audit.results.map((result) => [result.packet_id, result]));

assert.equal(audit.summary.total >= 4, true, "expected at least four audit packets");
assert.equal(audit.summary.accept >= 1, true, "expected at least one accept result");
assert.equal(audit.summary.revise >= 1, true, "expected at least one revise result");
assert.equal(audit.summary.quarantine >= 1, true, "expected at least one quarantine result");
assert.equal(audit.summary.discard >= 1, true, "expected at least one discard result");

for (const result of audit.results) {
  if (result.expected_decision) {
    assert.equal(result.routing_decision, result.expected_decision, `${result.packet_id} decision mismatch`);
  }
  for (const expectedBlocker of result.expected_blockers) {
    assert.equal(
      result.blockers.some((blocker) => blocker.id === expectedBlocker),
      true,
      `${result.packet_id} missing expected blocker ${expectedBlocker}`
    );
  }
}

assert.notEqual(byId.get("memory_pollution_001").routing_decision, "accept", "no source_refs packet must not accept");
assert.notEqual(byId.get("agent_project_summary_001").routing_decision, "accept", "no audit_refs packet must not accept");
assert.equal(byId.get("fde_customer_delivery_001").human_review_required, true, "FDE packet must require human review");
assert.equal(byId.get("valid_project_decision_001").routing_decision, "accept", "valid packet should accept");

const reportResult = spawnSync(process.execPath, ["scripts/generate_audit_reports.mjs"], {
  cwd: root,
  encoding: "utf8"
});
assert.equal(reportResult.status, 0, reportResult.stderr || reportResult.stdout);

await access(join(root, "dist", "reports", "index.html"), constants.F_OK);
const indexHtml = await readFile(join(root, "dist", "reports", "index.html"), "utf8");
assert.match(indexHtml, /Audit Packet Reports/);
assert.match(indexHtml, /memory_pollution_001/);

console.log(`OK audit packet tests passed (${audit.summary.total} packets)`);
