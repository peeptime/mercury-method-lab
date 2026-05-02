import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { loadModelConfig } from "./model_config.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(root);
const npmCache = join(workspaceRoot, ".npm-cache");
const modelConfig = await loadModelConfig();
const runtimeConfig = await loadRuntimeConfig();
const agentPackageSpec = `${runtimeConfig.runtime.package}@${runtimeConfig.runtime.pinned_version}`;

const env = {
  ...process.env,
  DEFAULT_PROVIDER: "openai",
  OPENAI_BASE_URL: modelConfig.baseUrl,
  OPENAI_MODEL: modelConfig.model,
  OPENAI_ENABLED: "true"
};

if (modelConfig.apiKey) {
  env.OPENAI_API_KEY = modelConfig.apiKey;
}

console.log(`Starting Mercury with provider: ${modelConfig.providerName}`);
console.log(`Model: ${modelConfig.model}`);
console.log(`Base URL: ${modelConfig.baseUrl}`);
console.log(`Mercury Agent: ${agentPackageSpec}`);

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(
  npxCommand,
  ["--yes", "--cache", npmCache, agentPackageSpec, "start", "--foreground"],
  {
    cwd: root,
    env,
    stdio: "inherit"
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

async function loadRuntimeConfig() {
  const configPath = join(root, "config", "upstream-mercury-agent.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const runtime = config.runtime || {};

  if (!runtime.package || !runtime.pinned_version) {
    throw new Error("Missing config/upstream-mercury-agent.json runtime package pin.");
  }

  return config;
}
