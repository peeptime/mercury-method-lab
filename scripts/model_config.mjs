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

  const baseUrl = readConfigValue(provider, "base_url", "base_url_env", "base_url_env_aliases", "default_base_url");
  const model = readFirstEnv([provider.model_env, ...(provider.model_env_aliases || [])]) || provider.default_model;
  const apiKeyNames = [provider.api_key_env, ...(provider.api_key_env_aliases || [])].filter(Boolean);
  const apiKey = readFirstEnv(apiKeyNames);
  const apiKeyRequired = provider.api_key_required !== false;

  if (!baseUrl) {
    throw new Error(`Missing base URL for provider ${providerName}`);
  }

  if (!model) {
    throw new Error(`Missing model for provider ${providerName}. Set ${provider.model_env}.`);
  }

  if (apiKeyNames.length && apiKeyRequired && !apiKey) {
    throw new Error(`Missing API key. Set one of: ${apiKeyNames.join(", ")}`);
  }

  return {
    providerName,
    provider,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    chatUrl: `${baseUrl.replace(/\/+$/, "")}${provider.chat_path || "/chat/completions"}`,
    model,
    apiKey,
    apiKeyEnv: provider.api_key_env,
    apiKeyEnvAliases: provider.api_key_env_aliases || [],
    apiKeyRequired
  };
}

function readConfigValue(provider, directKey, envKey, envAliasesKey, defaultKey) {
  if (provider[directKey]) {
    return provider[directKey];
  }
  const envValue = readFirstEnv([provider[envKey], ...(provider[envAliasesKey] || [])]);
  if (envValue) {
    return envValue;
  }
  return provider[defaultKey] || "";
}

function readFirstEnv(names) {
  for (const name of names.filter(Boolean)) {
    const value = readEnv(name);
    if (value) {
      return value;
    }
  }
  return "";
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
