import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const checks = [];

const index = await read("dashboard/index.html");
const productLayer = await read("dashboard/product-layer.js");
const lite = await read("dashboard/lite.html");
const server = await read("scripts/dashboard_server.mjs");
const preferences = JSON.parse(await read("config/preferences.json"));
const liteStat = await stat(join(root, "dashboard/lite.html"));

check("dashboard loads product layer before app.js", index.indexOf("product-layer.js") > -1 && index.indexOf("product-layer.js") < index.indexOf("app.js"));
check("client asset version is 20260510a", index.includes("20260510a") && server.includes('expectedClientAssetVersion = "20260510a"'));
check("preferences file has 7 settings categories", ["general", "interface", "storage", "output", "control", "update", "notifications"].every((key) => preferences[key]));
check("dashboard exposes preferences endpoint", server.includes('/api/preferences'));
check("dashboard exposes lightweight product context endpoint", server.includes('/api/product-context'));
check("dashboard exposes lite audit endpoint", server.includes('/api/lite-audit'));
check("dashboard exposes capture endpoint", server.includes('/api/capture'));
check("dashboard exposes update check endpoint", server.includes('/api/update-check'));
check("dashboard exposes diagnostics endpoint", server.includes('/api/diagnostics'));
check("command allowlist includes audit/report/cycle", ["audit", "report", "cycle:status", "cycle:check"].every((script) => server.includes(`["${script}"`)));
check("product layer defines at least 20 icons", countIconDefinitions(productLayer) >= 20);
check("product layer includes settings, command palette, onboarding, toast, notifications", ["openSettings", "openCommandPalette", "openOnboarding", "showToast", "Notification"].every((token) => productLayer.includes(token)));
check("Lite Mode is single file and <= 30KB", liteStat.size <= 30 * 1024);
check("Lite Mode supports paste/audit/copy/offline", ["source", "auditBtn", "copyMarkdown", "stubAudit"].every((token) => lite.includes(token)));
check("Lite Mode supports URL prefill and capture save", ["params.get(\"text\")", "captureBtn", "saveCapture", "/api/capture"].every((token) => lite.includes(token)));
check("Lite Mode supports drag attach and evidence chain", ["handleFiles", "attachments", "Evidence Chain", "evidence_chain"].every((token) => lite.includes(token)));

for (const result of checks) {
  console.log(`${result.ok ? "OK" : "FAIL"} ${result.name}`);
}

if (checks.some((result) => !result.ok)) {
  process.exitCode = 1;
}

async function read(path) {
  return readFile(join(root, path), "utf8");
}

function check(name, ok) {
  checks.push({ name, ok: Boolean(ok) });
}

function countIconDefinitions(text) {
  const block = text.match(/const icons = \{([\s\S]*?)\n\};/);
  if (!block) return 0;
  return [...block[1].matchAll(/^\s{2}"?[-a-z]+/gm)].length;
}
