import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(root);
const input = process.argv[2];
const outputName = process.argv[3];

if (process.env.MERCURY_MARKITDOWN_ENABLED !== "true") {
  console.error("MarkItDown ingest is disabled. Set MERCURY_MARKITDOWN_ENABLED=true only when non-markdown material needs conversion into 00_raw.");
  process.exit(1);
}

if (!input) {
  console.error("Usage: npm run ingest:doc -- <input-file-or-url> [output-name]");
  process.exit(1);
}

const rawDir = join(root, "00_raw");
const outputBase = outputName || slugify(basename(input, extname(input)) || "converted-document");
const outputPath = join(rawDir, `${outputBase}.md`);
const markitdownSrc = join(workspaceRoot, "markitdown", "packages", "markitdown", "src");

const python = findPython();
if (!python) {
  console.error("Python was not found. Install Python 3.10+ or make it available as python/py before using ingest:doc.");
  process.exit(1);
}

const command = [
  "import sys",
  "from markitdown import MarkItDown",
  "md = MarkItDown()",
  "result = md.convert(sys.argv[1])",
  "print(result.text_content)"
].join("; ");

const env = {
  ...process.env,
  PYTHONPATH: [markitdownSrc, process.env.PYTHONPATH].filter(Boolean).join(";")
};

const result = spawnSync(python.command, [...python.args, "-c", command, input], {
  cwd: workspaceRoot,
  env,
  encoding: "utf8"
});

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "MarkItDown conversion failed.");
  process.exit(result.status || 1);
}

const now = new Date().toISOString();
const sourceRef = input.replaceAll("\\", "/");
const content = `# ${outputBase}

## Artifact Metadata

- schema_version: 0.1
- type: raw
- status: draft
- owner_role: collector
- source_refs:
- captured_at: ${now}
- converter: markitdown

## Original Source

${sourceRef}

## Converted Markdown

${result.stdout.trim()}
`;

await mkdir(rawDir, { recursive: true });
await writeFile(outputPath, content, "utf8");

console.log(`Wrote ${relative(root, outputPath).replaceAll("\\", "/")}`);

function findPython() {
  for (const candidate of [
    { command: "python", args: [] },
    { command: "py", args: ["-3"] }
  ]) {
    const result = spawnSync(candidate.command, [...candidate.args, "--version"], {
      encoding: "utf8"
    });
    if (result.status === 0) {
      return candidate;
    }
  }
  return null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "converted-document";
}
