import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { audit, auditMemoryWrite, createAuditPacket, listPolicies, shouldWriteMemory } from "../src/mercury-audit/index.mjs";

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

const demo = spawnSync(process.execPath, ["examples/integration-demo/memory-write-hook.mjs"], {
  cwd: root,
  encoding: "utf8"
});
assert.equal(demo.status, 0, demo.stderr || demo.stdout);
assert.match(demo.stdout, /MEMORY_WRITE_BLOCKED/);
assert.match(demo.stdout, /MEMORY_WRITE_ACCEPTED/);

console.log("OK SDK API tests passed");
