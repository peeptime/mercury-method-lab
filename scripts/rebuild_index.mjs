import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const indexDir = join(root, "11_indexes");
const sqlitePath = join(indexDir, "mercury-index.sqlite");
const jsonPath = join(indexDir, "source-index.json");

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
  const text = await tryReadText(file, ext);
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
    size_bytes: fileStat.size,
    updated_at: fileStat.mtime.toISOString()
  });
}

await mkdir(indexDir, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify({
  schema_version: "0.1",
  generated_at: new Date().toISOString(),
  source_of_truth: "filesystem_markdown_yaml",
  records
}, null, 2)}\n`, "utf8");

const sqlite = await tryBuildSqlite(records);

console.log(`Indexed ${records.length} records`);
console.log(`Wrote ${relative(root, jsonPath).replaceAll("\\", "/")}`);
if (sqlite.ok) {
  console.log(`Wrote ${relative(root, sqlitePath).replaceAll("\\", "/")}`);
} else {
  console.log(`SQLite skipped: ${sqlite.reason}`);
}

async function listFiles(dir) {
  const output = [];
  const entries = await readdir(dir, { withFileTypes: true });
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

async function tryReadText(file, ext) {
  if (!["md", "yaml", "yml", "json", "txt"].includes(ext)) {
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
      metadata[match[1]] = match[2].trim();
    }
  }
  return metadata;
}

function parseFlatYaml(text) {
  const result = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const pairMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pairMatch) {
      result[pairMatch[1]] = pairMatch[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return result;
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
    "10_exports": "export"
  };
  return map[dir] || "unknown";
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
      size_bytes INTEGER,
      updated_at TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO artifacts (
      path, directory, name, extension, type, status, owner_role, created_at, review_at, size_bytes, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      record.size_bytes,
      record.updated_at
    );
  }

  db.close();
  return { ok: true };
}
