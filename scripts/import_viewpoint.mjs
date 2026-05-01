import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const input = process.argv[2];

if (!input) {
  console.error("Usage: npm run import:viewpoint -- submissions/viewpoints/<file.md>");
  process.exit(1);
}

const sourcePath = resolve(root, input);
const submissionsRoot = resolve(root, "submissions", "viewpoints");

if (!sourcePath.startsWith(submissionsRoot)) {
  console.error("Input must be inside submissions/viewpoints/");
  process.exit(1);
}

if (!sourcePath.endsWith(".md")) {
  console.error("Input must be a markdown file.");
  process.exit(1);
}

const text = await readFile(sourcePath, "utf8");
const frontmatter = parseFrontmatter(text);
const slug = slugify(frontmatter.title || basename(sourcePath, ".md"));
const date = normalizeDate(frontmatter.created_at) || new Date().toISOString().slice(0, 10);
const id = `${date}-${slug}`;
const targetRel = `00_raw/${id}.md`;
const targetPath = join(root, targetRel);

const output = `# ${frontmatter.title || slug}

## Artifact Metadata

- schema_version: 0.1
- id: ${id}
- type: raw
- status: draft
- owner_role: collector
- source_refs: ${relative(root, sourcePath).replaceAll("\\", "/")}
- created_at: ${date}
- review_at: ${date}
- submission_type: viewpoint
- submitter: ${frontmatter.submitter || "unknown"}
- license_intent: ${frontmatter.license_intent || "review-only"}
- visibility: ${frontmatter.visibility || "public"}
- source_kind: ${frontmatter.source_kind || "unknown"}
- routing_hint: ${frontmatter.routing_hint || "factual-cleaning"}

## Original Submission

${stripFrontmatter(text).trim()}

## Promotion Notes

- Promoted from user submission.
- This artifact is raw intake, not an approved fact or memory.
- Next recommended route: ${frontmatter.routing_hint || "factual-cleaning"}
`;

await mkdir(dirname(targetPath), { recursive: true });
await writeFile(targetPath, output, "utf8");

console.log(`Promoted ${relative(root, sourcePath).replaceAll("\\", "/")} -> ${targetRel}`);

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    data[pair[1]] = pair[2].trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "viewpoint";
}

function normalizeDate(value) {
  if (!value) return null;
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}
