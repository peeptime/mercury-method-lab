import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getChangedFiles, isTextLike, joinRepo, pathExists } from "./incremental_common.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredPaths = [
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "docs/ITERATION-GUIDE-LATEST.md",
  "docs/CHECKLIST-REACTIVATION.md",
  "scripts/release_gate.ps1"
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
const errors = [];
const warnings = [];

for (const path of requiredPaths) {
  if (!await pathExists(joinRepo(root, path))) {
    errors.push(`Missing required path: ${path}`);
  }
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
for (const scriptName of ["doctor", "validate", "validate:incr", "index", "index:incr", "release:gate"]) {
  if (!packageJson.scripts?.[scriptName]) {
    errors.push(`package.json: missing script "${scriptName}"`);
  }
}

const changedFiles = getChangedFiles(root).filter(isTextLike);
for (const file of changedFiles) {
  const abs = joinRepo(root, file);
  if (!await pathExists(abs)) {
    continue;
  }
  const fileStat = await stat(abs);
  if (fileStat.size > 2 * 1024 * 1024) {
    warnings.push(`${file}: skipped large text-like file (${fileStat.size} bytes)`);
    continue;
  }
  const text = await readFile(abs, "utf8");
  if (file.endsWith(".json")) {
    try {
      JSON.parse(text);
    } catch (error) {
      errors.push(`${file}: invalid JSON (${error.message})`);
    }
  }
  if (file.endsWith(".md") && !startsWithMarkdownHeading(text)) {
    warnings.push(`${file}: markdown file should start with a heading`);
  }
  for (const [dir, headings] of Object.entries(requiredMarkdownHeadings)) {
    if (file.startsWith(`${dir}/`) && file.endsWith(".md") && !file.endsWith("README.md")) {
      for (const heading of headings) {
        if (!text.includes(heading)) {
          errors.push(`${file}: missing heading "${heading}"`);
        }
      }
    }
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      errors.push(`${file}: possible secret detected`);
    }
  }
}

for (const dir of ["00_raw", "07_audit_reports", "docs", "scripts"]) {
  try {
    await readdir(join(root, dir));
  } catch {
    errors.push(`Missing required directory: ${dir}`);
  }
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}

console.log(`OK incremental validated ${changedFiles.length} changed text files`);

function startsWithMarkdownHeading(text) {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("#")) return true;
  return trimmed.replace(/^---[\s\S]*?---\s*/, "").trimStart().startsWith("#");
}
