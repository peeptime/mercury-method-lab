import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const skills = [
  "mercury-evidence-chain",
  "mercury-memory-gate",
  "mercury-case-capture"
];

const checks = [];

for (const name of skills) {
  const path = join(root, "08_skills", name, "SKILL.md");
  let text = "";
  try {
    text = await readFile(path, "utf8");
    check(`${name} SKILL.md exists`, true);
  } catch {
    check(`${name} SKILL.md exists`, false);
    continue;
  }

  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  check(`${name} has YAML frontmatter`, Boolean(frontmatter));
  check(`${name} declares correct name`, new RegExp(`^name:\\s*${name}\\s*$`, "m").test(frontmatter?.[1] || ""));
  check(`${name} declares description`, /^description:\s*\S/m.test(frontmatter?.[1] || ""));
  check(`${name} has no TODO placeholders`, !text.includes("TODO"));
  check(`${name} preserves declined review state`, text.includes("human_reviewed: declined"));
  check(`${name} does not claim human_reviewed true`, !text.includes("human_reviewed: true"));
}

for (const result of checks) {
  console.log(`${result.ok ? "OK" : "FAIL"} ${result.name}`);
}

if (checks.some((result) => !result.ok)) {
  process.exitCode = 1;
}

function check(name, ok) {
  checks.push({ name, ok: Boolean(ok) });
}
