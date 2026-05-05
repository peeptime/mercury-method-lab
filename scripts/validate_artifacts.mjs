import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const excludedDirs = new Set([".git", "node_modules", ".cache", "dist", "build"]);
const maxTextFileBytes = 2 * 1024 * 1024;

const requiredDirs = [
  "00_inbox",
  "00_raw",
  "01_segmented",
  "02_cleaned",
  "03_uncertain",
  "04_memory_candidates",
  "05_decision_logs",
  "06_action_plans",
  "07_audit_reports",
  "08_skills",
  "09_templates",
  "10_exports",
  "11_indexes"
];

const validationDirs = [
  ...requiredDirs,
  ".github",
  "config",
  "dashboard",
  "docs",
  "examples",
  "install",
  "schemas",
  "scripts",
  "submissions"
];

const rootFiles = [
  ".env.example",
  ".gitattributes",
  ".gitignore",
  "CHANGELOG.md",
  "DEMO.md",
  "AGENTS.md",
  "MEMORY.md",
  "package.json",
  "README.en.md",
  "README.md",
  "sample_index.md"
];

const secretPatterns = [
  /ARK_API_KEY[ \t]*=[ \t]*["']?[A-Za-z0-9_\-]{12,}/i,
  /OPENAI_API_KEY[ \t]*=[ \t]*["']?[A-Za-z0-9_\-]{12,}/i,
  /Bearer[ \t]+[A-Za-z0-9_\-.]{12,}/i
];

const requiredMarkdownHeadings = {
  "05_decision_logs": ["## 日期", "## 背景", "## 结论", "## 证据", "## 风险"],
  "07_audit_reports": ["## 被审计结论", "## 关键假设", "## 最可能错误点", "## 审计结论"]
};

const allowedStates = new Set(["draft", "review_ready", "audited", "approved", "superseded", "rejected"]);
const allowedConfidence = new Set(["low", "medium", "high"]);
const allowedRisk = new Set(["low", "medium", "high"]);
const allowedMemoryLevels = new Set(["M0", "M1", "M2", "M3", "M4"]);

const errors = [];
const warnings = [];

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
      if (excludedDirs.has(entry.name)) {
        continue;
      }
      output.push(...await listFiles(path));
    } else {
      output.push(path);
    }
  }
  return output;
}

function rel(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function parseFlatYaml(text) {
  const result = {};
  let currentKey = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

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
      const value = pairMatch[2].trim();
      result[currentKey] = value === "" ? [] : parseScalar(value);
    }
  }

  return result;
}

function parseScalar(value) {
  const normalized = unquote(value);
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return normalized;
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "");
}

function startsWithMarkdownHeading(text) {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("#")) {
    return true;
  }
  const withoutFrontMatter = trimmed.replace(/^---[\s\S]*?---\s*/, "").trimStart();
  return withoutFrontMatter.startsWith("#");
}

function requireField(file, data, field) {
  if (data[field] === undefined || data[field] === "" || (Array.isArray(data[field]) && data[field].length === 0)) {
    errors.push(`${file}: missing required field "${field}"`);
  }
}

for (const dir of requiredDirs) {
  try {
    await readdir(join(root, dir));
  } catch {
    errors.push(`Missing required directory: ${dir}`);
  }
}

const fileSet = new Set();
for (const dir of validationDirs) {
  for (const file of await listFiles(join(root, dir))) {
    fileSet.add(file);
  }
}
for (const file of rootFiles) {
  fileSet.add(join(root, file));
}

const files = [...fileSet];

for (const file of files) {
  if (!/\.(md|yaml|yml|json|mjs|ps1|example)$/i.test(file)) {
    continue;
  }

  const fileRel = rel(file);
  const fileStat = await stat(file);
  if (fileStat.size > maxTextFileBytes) {
    warnings.push(`${fileRel}: skipped large text-like file (${fileStat.size} bytes)`);
    continue;
  }

  const text = await readFile(file, "utf8");

  if (fileRel.endsWith(".json")) {
    try {
      JSON.parse(text);
    } catch (error) {
      errors.push(`${fileRel}: invalid JSON (${error.message})`);
    }
  }

  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      errors.push(`${fileRel}: possible secret detected`);
    }
  }

  if (fileRel.endsWith(".md") && !startsWithMarkdownHeading(text)) {
    warnings.push(`${fileRel}: markdown file should start with a heading`);
  }

  for (const [dir, headings] of Object.entries(requiredMarkdownHeadings)) {
    if (fileRel.startsWith(`${dir}/`) && fileRel.endsWith(".md") && !fileRel.endsWith("README.md")) {
      for (const heading of headings) {
        if (!text.includes(heading)) {
          errors.push(`${fileRel}: missing heading "${heading}"`);
        }
      }
    }
  }

  if (fileRel.startsWith("04_memory_candidates/") && /\.ya?ml$/i.test(fileRel)) {
    const data = parseFlatYaml(text);
    for (const field of [
      "schema_version",
      "id",
      "type",
      "status",
      "content",
      "source_refs",
      "confidence",
      "risk",
      "owner_role",
      "created_at",
      "review_at"
    ]) {
      requireField(fileRel, data, field);
    }

    if (data.type && data.type !== "memory_candidate") {
      errors.push(`${fileRel}: type must be memory_candidate`);
    }
    if (data.status && !allowedStates.has(data.status)) {
      errors.push(`${fileRel}: invalid status "${data.status}"`);
    }
    if (data.confidence && !allowedConfidence.has(data.confidence)) {
      errors.push(`${fileRel}: invalid confidence "${data.confidence}"`);
    }
    if (data.risk && !allowedRisk.has(data.risk)) {
      errors.push(`${fileRel}: invalid risk "${data.risk}"`);
    }
    if (data.memory_level && !allowedMemoryLevels.has(data.memory_level)) {
      errors.push(`${fileRel}: invalid memory_level "${data.memory_level}"`);
    }
    if (data.owner_role && data.owner_role !== "memory-curator") {
      errors.push(`${fileRel}: owner_role must be memory-curator`);
    }
  }
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`FAIL ${error}`);
  }
  process.exit(1);
}

console.log(`OK validated ${files.length} files`);
