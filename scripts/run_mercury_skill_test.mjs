import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadModelConfig } from "./model_config.mjs";

const skillName = process.argv[2];
const task = process.argv.slice(3).join(" ").trim();

let modelConfig;
try {
  modelConfig = await loadModelConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (!skillName || !task) {
  console.error("Usage: node run_mercury_skill_test.mjs <skill-name> <task>");
  process.exit(1);
}

const skillPath = join(homedir(), ".mercury", "skills", skillName, "SKILL.md");
const raw = await readFile(skillPath, "utf8");
const instructions = raw.replace(/^---[\s\S]*?---\s*/, "").trim();

const headers = {
  "Content-Type": "application/json"
};

if (modelConfig.apiKey) {
  headers.Authorization = `Bearer ${modelConfig.apiKey}`;
}

const response = await fetch(modelConfig.chatUrl, {
  method: "POST",
  headers,
  body: JSON.stringify({
    model: modelConfig.model,
    messages: [
      {
        role: "system",
        content: `You are Mercury using the installed skill "${skillName}". Follow the skill strictly.\n\n${instructions}`
      },
      {
        role: "user",
        content: task
      }
    ],
    temperature: 0.2
  })
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`HTTP ${response.status}`);
  console.error(errorText);
  process.exit(1);
}

const data = await response.json();
console.log(data?.choices?.[0]?.message?.content?.trim() || "");
