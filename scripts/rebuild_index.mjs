import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const indexDir = join(root, "11_indexes");
const sqlitePath = join(indexDir, "mercury-index.sqlite");
const jsonPath = join(indexDir, "source-index.json");
const sampleJsonPath = join(indexDir, "sample-index.json");
const maxTextFileBytes = 2 * 1024 * 1024;

const sourceDirs = [
  "00_inbox",
  "00_raw",
  "01_segmented",
  "02_cleaned",
  "03_uncertain",
  "04_memory_candidates",
  "05_decision_logs",
  "06_action_plans",
  "07_audit_reports",
  "examples",
  "10_exports"
];

const files = [];
for (const dir of sourceDirs) {
  files.push(...await listFiles(join(root, dir)));
}

const records = [];
for (const file of files) {
  const fileStat = await stat(file);
  const relPath = relative(root, file).replaceAll("\\", "/");
  const ext = relPath.split(".").pop()?.toLowerCase() || "";
  const text = await tryReadText(file, ext, fileStat.size);
  const metadata = text ? parseMetadata(text, relPath) : {};

  records.push({
    path: relPath,
    directory: relPath.split("/")[0],
    name: relPath.split("/").pop(),
    extension: ext,
    type: metadata.type || inferType(relPath),
    status: metadata.status || (relPath.startsWith("00_inbox/") ? "staged" : "unclassified"),
    owner_role: metadata.owner_role || "",
    created_at: metadata.created_at || "",
    review_at: metadata.review_at || "",
    sample_type: metadata.sample_type || inferSampleType(relPath, metadata),
    project_id: metadata.project_id || "",
    source_refs: parseRefs(metadata.source_refs),
    decision_refs: parseRefs(metadata.decision_refs),
    action_refs: parseRefs(metadata.action_refs),
    audit_refs: parseRefs(metadata.audit_refs),
    reuse_refs: parseRefs(metadata.reuse_refs),
    reuse_count: parseInteger(metadata.reuse_count),
    feedback_status: metadata.feedback_status || inferFeedbackStatus(relPath, metadata),
    feedback_refs: parseRefs(metadata.feedback_refs),
    memory_level: metadata.memory_level || "",
    confidence: metadata.confidence || "",
    risk: metadata.risk || "",
    size_bytes: fileStat.size,
    updated_at: fileStat.mtime.toISOString()
  });
}

const sampleIndex = buildSampleIndex(records);

await mkdir(indexDir, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify({
  schema_version: "0.1",
  generated_at: new Date().toISOString(),
  source_of_truth: "filesystem_markdown_yaml",
  records
}, null, 2)}\n`, "utf8");
await writeFile(sampleJsonPath, `${JSON.stringify(sampleIndex, null, 2)}\n`, "utf8");

const sqlite = await tryBuildSqlite(records);

console.log(`Indexed ${records.length} records`);
console.log(`Wrote ${relative(root, jsonPath).replaceAll("\\", "/")}`);
console.log(`Wrote ${relative(root, sampleJsonPath).replaceAll("\\", "/")}`);
if (sqlite.ok) {
  console.log(`Wrote ${relative(root, sqlitePath).replaceAll("\\", "/")}`);
} else {
  console.log(`SQLite skipped: ${sqlite.reason}`);
}

async function listFiles(dir) {
  const output = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return output;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...await listFiles(path));
    } else {
      output.push(path);
    }
  }
  return output;
}

async function tryReadText(file, ext, sizeBytes) {
  if (!["md", "yaml", "yml", "json", "txt"].includes(ext)) {
    return "";
  }
  if (sizeBytes > maxTextFileBytes) {
    return "";
  }
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

function parseMetadata(text, relPath) {
  if (/\.ya?ml$/i.test(relPath)) {
    return parseFlatYaml(text);
  }

  const metadata = {};
  const metadataMatch = text.match(/## Artifact Metadata\s+([\s\S]*?)(?=\n## |\n# |\s*$)/i);
  if (!metadataMatch) {
    return metadata;
  }

  for (const line of metadataMatch[1].split(/\r?\n/)) {
    const match = line.match(/^-\s*([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      metadata[match[1]] = parseMetadataValue(match[2].trim());
    }
  }
  return metadata;
}

function parseFlatYaml(text) {
  const result = {};
  let currentKey = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      result[currentKey] ??= [];
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [result[currentKey]];
      }
      result[currentKey].push(unquote(listMatch[1].trim()));
      continue;
    }

    const pairMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pairMatch) {
      currentKey = pairMatch[1];
      result[pairMatch[1]] = parseMetadataValue(pairMatch[2].trim());
    }
  }
  return result;
}

function parseMetadataValue(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => unquote(item.trim()))
      .filter(Boolean);
  }
  return unquote(trimmed);
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "");
}

function inferType(path) {
  const dir = path.split("/")[0];
  const map = {
    "00_inbox": "inbox_source",
    "00_raw": "raw",
    "01_segmented": "segmented",
    "02_cleaned": "cleaned",
    "03_uncertain": "uncertain",
    "04_memory_candidates": "memory_candidate",
    "05_decision_logs": "decision_log",
    "06_action_plans": "action_plan",
    "07_audit_reports": "audit_report",
    examples: "example",
    "10_exports": "export"
  };
  return map[dir] || "unknown";
}

function inferSampleType(path, metadata) {
  if (metadata.sample_type) {
    return metadata.sample_type;
  }

  const type = metadata.type || inferType(path);
  const map = {
    raw: "素材",
    cleaned: "观察",
    uncertain: "假设",
    memory_candidate: "素材",
    decision_log: "决策",
    action_plan: "行动计划",
    audit_report: "审计",
    export: "模板"
  };
  return map[type] || "未判级";
}

function inferFeedbackStatus(path, metadata) {
  if (metadata.feedback_status) {
    return metadata.feedback_status;
  }
  const type = metadata.type || inferType(path);
  if (type === "decision_log" || type === "action_plan") {
    return "missing";
  }
  return "not_required";
}

function parseRefs(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildSampleIndex(records) {
  const sampleRecords = records
    .filter((record) => !record.name?.toLowerCase().startsWith("readme"))
    .map((record) => ({
      path: record.path,
      type: record.type,
      status: record.status,
      sample_type: record.sample_type,
      sample_type_source: record.sample_type === "未判级" ? "missing" : "inferred_or_metadata",
      project_id: record.project_id || "unassigned",
      source_refs: record.source_refs,
      decision_refs: record.decision_refs,
      action_refs: record.action_refs,
      audit_refs: record.audit_refs,
      reuse_count: record.reuse_count,
      reuse_refs: record.reuse_refs,
      feedback_status: record.feedback_status,
      feedback_refs: record.feedback_refs,
      memory_level: record.memory_level,
      confidence: record.confidence,
      risk: record.risk,
      review_at: record.review_at,
      updated_at: record.updated_at
    }));

  return {
    schema_version: "0.1",
    generated_at: new Date().toISOString(),
    purpose: "sample_library_index",
    source_of_truth: "filesystem_markdown_yaml",
    known_gaps: summarizeSampleGaps(sampleRecords),
    records: sampleRecords
  };
}

function summarizeSampleGaps(records) {
  const count = (predicate) => records.filter(predicate).length;
  return {
    total_records: records.length,
    missing_sample_type: count((record) => record.sample_type_source === "missing"),
    missing_project_id: count((record) => record.project_id === "unassigned"),
    missing_reuse_tracking: count((record) => record.reuse_count === 0 && record.reuse_refs.length === 0),
    missing_feedback_for_decision_or_action: count((record) => (
      (record.type === "decision_log" || record.type === "action_plan")
      && record.feedback_status === "missing"
    ))
  };
}

async function tryBuildSqlite(records) {
  let sqlite;
  try {
    sqlite = await import("node:sqlite");
  } catch (error) {
    return { ok: false, reason: error.code || "node:sqlite unavailable" };
  }

  const db = new sqlite.DatabaseSync(sqlitePath);
  db.exec(`
    DROP TABLE IF EXISTS artifacts;
    CREATE TABLE artifacts (
      path TEXT PRIMARY KEY,
      directory TEXT,
      name TEXT,
      extension TEXT,
      type TEXT,
      status TEXT,
      owner_role TEXT,
      created_at TEXT,
      review_at TEXT,
      sample_type TEXT,
      project_id TEXT,
      reuse_count INTEGER,
      feedback_status TEXT,
      memory_level TEXT,
      confidence TEXT,
      risk TEXT,
      size_bytes INTEGER,
      updated_at TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO artifacts (
      path, directory, name, extension, type, status, owner_role, created_at, review_at,
      sample_type, project_id, reuse_count, feedback_status, memory_level, confidence, risk,
      size_bytes, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const record of records) {
    insert.run(
      record.path,
      record.directory,
      record.name,
      record.extension,
      record.type,
      record.status,
      record.owner_role,
      record.created_at,
      record.review_at,
      record.sample_type,
      record.project_id,
      record.reuse_count,
      record.feedback_status,
      record.memory_level,
      record.confidence,
      record.risk,
      record.size_bytes,
      record.updated_at
    );
  }

  db.close();
  return { ok: true };
}
