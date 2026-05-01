import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(root, "08_skills");
const targetDir = process.env.MERCURY_SKILLS_DIR || join(homedir(), ".mercury", "skills");

const entries = await readdir(sourceDir, { withFileTypes: true });
const skillDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

if (skillDirs.length === 0) {
  console.error("No skills found in 08_skills.");
  process.exit(1);
}

for (const skillName of skillDirs) {
  const sourceSkill = join(sourceDir, skillName, "SKILL.md");
  try {
    await stat(sourceSkill);
  } catch {
    console.error(`Missing SKILL.md for ${skillName}`);
    process.exitCode = 1;
    continue;
  }

  const targetSkillDir = join(targetDir, skillName);
  await mkdir(targetSkillDir, { recursive: true });
  await copyFile(sourceSkill, join(targetSkillDir, "SKILL.md"));
  console.log(`Synced ${skillName} -> ${targetSkillDir}`);
}
