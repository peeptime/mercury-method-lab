import { audit, shouldWriteMemory } from "../../src/mercury-audit/index.mjs";

const candidate = process.argv.slice(2).join(" ")
  || "The user prefers evidence-first AI memory, with Markdown/YAML as source of truth and HTML as delivery layer.";

const result = audit(candidate, {
  id: "starter_hello_audit",
  title: "Starter Kit Audit",
  type: "memory_candidate",
  risk_level: "low",
  evidence_strength: "strong",
  source_refs: ["conversation:starter-kit-explicit-user-material"],
  audit_refs: ["docs/V2-PREFLIGHT-REQUIREMENTS.md"],
  boundary: "Starter Kit demo only; not a named human review."
});

console.log(JSON.stringify({
  routing_decision: result.routing_decision,
  should_write_memory: shouldWriteMemory(result),
  failure_modes: result.failure_modes,
  required_fixes: result.required_fixes,
  content_summary: result.content_summary,
  provenance: result.provenance
}, null, 2));
