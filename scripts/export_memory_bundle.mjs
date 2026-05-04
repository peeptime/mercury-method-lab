import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const targetsPath = join(root, "config", "memory-targets.json");
const sampleIndexPath = join(root, "11_indexes", "sample-index.json");

const args = parseArgs(process.argv.slice(2));
const targetsConfig = await readJson(targetsPath);
const targetName = args.target || targetsConfig.default_target || "markdown";
const target = targetsConfig.targets?.[targetName];

if (!target) {
  const available = Object.keys(targetsConfig.targets || {}).sort().join(", ") || "none";
  throw new Error(`Unknown memory target: ${targetName}. Available targets: ${available}`);
}

const sampleIndex = await readJson(sampleIndexPath).catch((error) => {
  throw new Error(`Cannot read 11_indexes/sample-index.json: ${error.message}. Run npm run index first.`);
});

const records = (sampleIndex.records || []).map((record) => routeRecord(record, targetName));
const filteredRecords = args.includeArchive
  ? records
  : records.filter((record) => record.routing_decision !== "archive" && record.routing_decision !== "discard");

const outputPath = resolve(root, args.out || target.default_output || "10_exports/memory-preaudit-bundle.json");
const bundle = {
  schema_version: "0.1",
  generated_at: new Date().toISOString(),
  target_backend: targetName,
  target_mode: target.mode,
  target_status: target.status,
  contract_ref: targetsConfig.contract_ref,
  source_index_ref: "11_indexes/sample-index.json",
  direct_runtime_write_allowed: targetsConfig.direct_runtime_write_allowed === true ? true : false,
  policy: {
    export_only: true,
    reads_artifact_bodies: false,
    writes_runtime_database: false,
    include_archive: args.includeArchive
  },
  summary: summarize(records, filteredRecords),
  records: filteredRecords
};

if (bundle.direct_runtime_write_allowed) {
  throw new Error("Refusing export: direct_runtime_write_allowed must stay false for pre-audit bundles.");
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  ok: true,
  target_backend: targetName,
  output: rel(outputPath),
  source_index: "11_indexes/sample-index.json",
  total_records: records.length,
  exported_records: filteredRecords.length,
  summary: bundle.summary
}, null, 2));

function parseArgs(argv) {
  const result = {
    target: "",
    out: "",
    includeArchive: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const [flag, inlineValue] = splitArg(arg);
    const readValue = () => inlineValue ?? argv[++i] ?? "";
    if (flag === "--target") {
      result.target = readValue();
    } else if (flag === "--out") {
      result.out = readValue();
    } else if (flag === "--include-archive") {
      result.includeArchive = true;
    } else if (flag === "--help" || flag === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

function splitArg(arg) {
  const index = arg.indexOf("=");
  if (!arg.startsWith("--") || index === -1) {
    return [arg, undefined];
  }
  return [arg.slice(0, index), arg.slice(index + 1)];
}

function printUsage() {
  console.log([
    "Usage:",
    "  npm run export:memory",
    "  npm run export:memory -- --target gbrain",
    "  npm run export:memory -- --target mercury_agent --include-archive",
    "",
    "Notes:",
    "  Reads 11_indexes/sample-index.json only.",
    "  Does not read artifact bodies or write runtime memory databases.",
    "  Run npm run index first when sample-index.json is stale."
  ].join("\n"));
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function routeRecord(record, targetBackend) {
  const blockers = findBlockers(record);
  const routingDecision = getRoutingDecision(record, blockers);
  return {
    path: record.path,
    type: record.type,
    status: record.status,
    sample_type: record.sample_type,
    sample_type_source: record.sample_type_source,
    routing_decision: routingDecision,
    target_backend: targetBackend,
    source_refs: record.source_refs || [],
    audit_refs: record.audit_refs || [],
    decision_refs: record.decision_refs || [],
    action_refs: record.action_refs || [],
    feedback_status: record.feedback_status || "",
    feedback_refs: record.feedback_refs || [],
    intent: record.intent || "",
    reminder_intensity: record.reminder_intensity || "",
    feedback_expected_from: record.feedback_expected_from || "",
    memory_level: record.memory_level || "",
    confidence: record.confidence || "",
    risk: record.risk || "",
    review_at: record.review_at || "",
    project_id: record.project_id || "unassigned",
    reuse_count: record.reuse_count || 0,
    reuse_refs: record.reuse_refs || [],
    blockers,
    recommendation: getRecommendation(routingDecision, blockers)
  };
}

function findBlockers(record) {
  const blockers = [];
  const type = record.type || "";
  const sampleType = record.sample_type || "";
  const sourceRefs = record.source_refs || [];
  const auditRefs = record.audit_refs || [];
  const decisionRefs = record.decision_refs || [];
  const highMemory = record.memory_level === "M3" || record.memory_level === "M4";

  if (record.sample_type_source === "missing" || sampleType === "未判级") {
    blockers.push("missing_sample_type");
  }
  if (!sourceRefs.length && type !== "raw") {
    blockers.push("missing_source_refs");
  }
  if (highMemory && !auditRefs.length && !decisionRefs.length) {
    blockers.push("missing_audit_or_decision_refs_for_high_memory");
  }
  if (highMemory && !record.review_at) {
    blockers.push("missing_review_at_for_high_memory");
  }
  if (type === "action_plan" && !record.intent) {
    blockers.push("missing_intent_for_action_plan");
  }
  if (record.risk === "high") {
    blockers.push("high_risk");
  }
  if (record.status === "rejected" || sampleType === "废料") {
    blockers.push("rejected_or_discarded");
  }
  if (type === "raw" || type === "inbox_source") {
    blockers.push("raw_or_inbox_cold_storage_only");
  }

  return blockers;
}

function getRoutingDecision(record, blockers) {
  if (blockers.includes("rejected_or_discarded")) {
    return "discard";
  }
  if (blockers.includes("raw_or_inbox_cold_storage_only")) {
    return "archive";
  }
  if (blockers.length) {
    return "review";
  }
  if ((record.status === "approved" || record.status === "audited") && record.source_refs?.length) {
    return "promote";
  }
  return "review";
}

function getRecommendation(decision, blockers) {
  if (decision === "promote") {
    return "May enter target memory import queue with metadata preserved.";
  }
  if (decision === "archive") {
    return "Keep as cold storage; do not inject into active recall by default.";
  }
  if (decision === "discard") {
    return "Do not import into memory backend.";
  }
  return `Resolve blockers before promotion: ${blockers.join(", ") || "human_review_required"}.`;
}

function summarize(allRecords, exportedRecords) {
  const count = (records, decision) => records.filter((record) => record.routing_decision === decision).length;
  const blockerCounts = {};
  for (const record of allRecords) {
    for (const blocker of record.blockers) {
      blockerCounts[blocker] = (blockerCounts[blocker] || 0) + 1;
    }
  }
  return {
    total_records: allRecords.length,
    exported_records: exportedRecords.length,
    promote: count(allRecords, "promote"),
    review: count(allRecords, "review"),
    archive: count(allRecords, "archive"),
    discard: count(allRecords, "discard"),
    blockers: blockerCounts
  };
}

function rel(path) {
  return relative(root, path).replaceAll("\\", "/");
}
