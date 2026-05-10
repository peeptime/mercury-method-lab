import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessDisagreement,
  audit,
  auditMemoryWrite,
  createAuditPacket,
  listAuditProfiles,
  listAuditStandards,
  listPolicies,
  listSourceLevels,
  shouldWriteMemory
} from "../src/mercury-audit/index.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const packet = createAuditPacket("The project owner approved Mercury for every enterprise memory system.", {
  type: "memory_candidate",
  risk_level: "high"
});
assert.equal(packet.type, "memory_candidate");
assert.equal(packet.source_refs.length, 0);

const unsupported = audit(packet, { policy: "standard" });
assert.notEqual(unsupported.routing_decision, "accept");
assert.equal(unsupported.failure_modes.includes("missing_source_refs"), true);
assert.equal(unsupported.provenance.human_reviewed, "declined");
assert.equal(unsupported.kernel.profile.id, "v8.1-reality-sync");
assert.equal(unsupported.source_credibility.passes_floor, false);

const valid = audit("The user asked for a local SDK wrapper before deeper integration work.", {
  id: "sdk_valid_001",
  title: "Supported SDK planning note",
  type: "project_decision",
  risk_level: "low",
  evidence_strength: "strong",
  source_refs: ["conversation:2026-05-10-user-request"],
  audit_refs: ["docs/ITERATION-GUIDE-1.6.0.md"]
});
assert.equal(valid.routing_decision, "accept");
assert.equal(shouldWriteMemory(valid), true);
assert.equal(valid.source_credibility.passes_floor, true);

const strictDelivery = audit("The customer confirmed the migration date.", {
  type: "customer_delivery",
  risk_level: "low",
  source_refs: ["field-note:demo"],
  audit_refs: ["review-note:demo"],
  policy: "strict"
});
assert.equal(strictDelivery.raw_result.policy.original_decision, "accept");
assert.equal(strictDelivery.routing_decision, "revise");
assert.equal(strictDelivery.raw_result.policy.adjustments.length, 1);

const memoryHook = auditMemoryWrite({
  content: "The user prefers Mercury outputs to remain Markdown-first with HTML as a delivery layer.",
  risk_level: "low",
  evidence_strength: "strong",
  source_refs: ["conversation:mercury-format-boundary"],
  audit_refs: ["docs/SCOPE.md"],
  policy: "standard"
});
assert.equal(memoryHook.routing_decision, "accept");

assert.equal(listPolicies().some((policy) => policy.name === "strict"), true);
assert.equal(listAuditProfiles().some((profile) => profile.id === "external-auditor"), true);
assert.equal(listAuditStandards().some((standard) => standard.id === "high-risk-memory"), true);
assert.equal(listSourceLevels().some((level) => level.id === "ai_generated"), true);

const disagreement = assessDisagreement([
  { reviewer: "owner", routing_decision: "accept" },
  { reviewer: "external", routing_decision: "quarantine" }
]);
assert.equal(disagreement.escalation_required, true);
assert.equal(disagreement.recommended_route, "quarantine");

const demo = spawnSync(process.execPath, ["examples/integration-demo/memory-write-hook.mjs"], {
  cwd: root,
  encoding: "utf8"
});
assert.equal(demo.status, 0, demo.stderr || demo.stdout);
assert.match(demo.stdout, /MEMORY_WRITE_BLOCKED/);
assert.match(demo.stdout, /MEMORY_WRITE_ACCEPTED/);

console.log("OK SDK API tests passed");
