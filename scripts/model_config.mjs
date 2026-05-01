import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const configPath = join(root, "config", "model-providers.json");

export async function loadModelConfig() {
  const raw = await readFile(configPath, "utf8");
  const config = JSON.parse(raw);
  const providerName = process.env.MERCURY_MODEL_PROVIDER || config.active_provider;
  const provider = config.providers?.[providerName];

  if (!provider) {
    throw new Error(`Unknown model provider: ${providerName}`);
  }

  const baseUrl = readConfigValue(provider, "base_url", "base_url_env", "default_base_url");
  const model = readEnv(provider.model_env) || provider.default_model;
  const apiKey = provider.api_key_env ? readEnv(provider.api_key_env) : "";

  if (!baseUrl) {
    throw new Error(`Missing base URL for provider ${providerName}`);
  }

  if (!model) {
    throw new Error(`Missing model for provider ${providerName}. Set ${provider.model_env}.`);
  }

  if (provider.api_key_env && !apiKey && providerName !== "local-openclaw") {
    throw new Error(`Missing ${provider.api_key_env}`);
  }

  return {
    providerName,
    provider,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    chatUrl: `${baseUrl.replace(/\/+$/, "")}${provider.chat_path || "/chat/completions"}`,
    model,
    apiKey,
    apiKeyEnv: provider.api_key_env
  };
}

function readConfigValue(provider, directKey, envKey, defaultKey) {
  if (provider[directKey]) {
    return provider[directKey];
  }
  if (provider[envKey] && readEnv(provider[envKey])) {
    return readEnv(provider[envKey]);
  }
  return provider[defaultKey] || "";
}

function readEnv(name) {
  if (!name) {
    return "";
  }
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

  if (result.status !== 0) {
    return "";
  }

  return result.stdout.trim();
}
