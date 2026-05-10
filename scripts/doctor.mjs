import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredPaths = [
  "00_raw",
  "00_inbox",
  "00_inbox/ai-conversations",
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
  "11_indexes",
  "config",
  "data",
  "docs",
  "docs/AGENT-AUDIT-BLUEPRINT.md",
  "docs/CYCLE-04-BLUEPRINT.md",
  "docs/EXPORT-GUIDE.md",
  "docs/I18N-UX-POLICY.md",
  "docs/PROOF-PACK-COVERAGE-MATRIX.md",
  "docs/RELATED-WORK.md",
  "docs/ROUTING-THEORY.md",
  "docs/SCOPE.md",
  "docs/START-HERE.md",
  "docs/THREE-MINUTE-START.md",
  "examples/audit-packets",
  "examples/ai-conversation-capture.md",
  "schemas",
  "schemas/audit-packet.schema.json",
  "scripts",
  "dashboard",
  "dashboard/index.html",
  "dashboard/styles.css",
  "dashboard/app.js",
  "config/permissions.json",
  "config/state-machine.json",
  "config/integrations.json",
  "config/model-providers.json",
  "config/methods.json",
  "config/architecture-entrypoints.json",
  "config/mercury-capabilities.json",
  ".env.example",
  "package.json"
];

const checks = [];

async function exists(path) {
  try {
    await access(join(root, path), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

for (const path of requiredPaths) {
  checks.push({
    name: `required path: ${path}`,
    ok: await exists(path)
  });
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
for (const scriptName of [
  "dashboard",
  "audit",
  "audit:flow",
  "audit:profile",
  "cycle:status",
  "cycle:check",
  "capture",
  "capture:demo",
  "capture:dropzone",
  "capture:watch",
  "capture:check",
  "dashboard:check",
  "doctor",
  "guide:latest",
  "index",
  "index:incr",
  "import:viewpoint",
  "ingest:doc",
  "release:gate",
  "report",
  "sync:skills",
  "test",
  "validate",
  "validate:incr",
  "test:llm",
  "test:ark",
  "start:llm",
  "start:ark"
]) {
  checks.push({
    name: `package script: ${scriptName}`,
    ok: Boolean(packageJson.scripts?.[scriptName])
  });
}

const skillDirs = await readdir(join(root, "08_skills"), { withFileTypes: true });
const skillCount = skillDirs.filter((entry) => entry.isDirectory()).length;
checks.push({
  name: "at least one skill exists",
  ok: skillCount > 0
});

const nodeMajor = Number(process.versions.node.split(".")[0]);
checks.push({
  name: "node >= 20",
  ok: nodeMajor >= 20
});

if (readEnv("MERCURY_MARKITDOWN_ENABLED") === "true") {
  const pythonResult = spawnSync("python", ["--version"], { encoding: "utf8" });
  const pyResult = spawnSync("py", ["-3", "--version"], { encoding: "utf8" });
  checks.push({
    name: "python or py available for markitdown ingest",
    ok: pythonResult.status === 0 || pyResult.status === 0
  });
}

const failed = checks.filter((check) => !check.ok);

for (const check of checks) {
  console.log(`${check.ok ? "OK" : "FAIL"} ${check.name}`);
}

if (!readEnv("ARK_API_KEY")) {
  console.log("WARN ARK_API_KEY is not set; API smoke tests will fail until runtime credentials are provided.");
}

if (readEnv("MERCURY_MARKITDOWN_ENABLED") !== "true") {
  console.log("INFO MarkItDown ingest is disabled by default. Set MERCURY_MARKITDOWN_ENABLED=true only when conversion into 00_raw is needed.");
}

if (failed.length > 0) {
  process.exitCode = 1;
}

function readEnv(name) {
  if (process.env[name]) {
    return process.env[name];
  }
  if (process.platform !== "win32") {
    return "";
  }

  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-Command", `[Environment]::GetEnvironmentVariable('${name}','User')`],
    { encoding: "utf8" }
  );

  return result.status === 0 ? result.stdout.trim() : "";
}
