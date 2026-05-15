import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const configPath = join(root, "config", "upstream-mercury-agent.json");
const config = JSON.parse(await readFile(configPath, "utf8"));

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "GlimpseGate-admission-lab-upstream-check"
    }
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json();
}

function compareSemver(a, b) {
  const left = a.split(".").map((part) => Number.parseInt(part, 10));
  const right = b.split(".").map((part) => Number.parseInt(part, 10));
  for (let index = 0; index < 3; index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

function isLikelyCompatible(version) {
  return compareSemver(version, "1.1.0") >= 0 && compareSemver(version, "2.0.0") < 0;
}

const npmMeta = await fetchJson("https://registry.npmjs.org/@cosmicstack%2fmercury-agent/latest");
const githubMeta = await fetchJson("https://api.github.com/repos/cosmicstack-labs/mercury-agent");

const latest = npmMeta.version;
const observed = config.upstream.observed_package_version;
const pinned = config.runtime?.pinned_version || "";
const compatible = isLikelyCompatible(latest);
const pinnedCompatible = pinned ? isLikelyCompatible(pinned) : false;

console.log(`Upstream package: ${config.upstream.package}`);
console.log(`Observed in config: ${observed}`);
console.log(`Runtime pin: ${pinned || "missing"}`);
console.log(`Latest on npm: ${latest}`);
console.log(`GitHub pushed_at: ${githubMeta.pushed_at}`);
console.log(`Compatibility target: ${config.compatibility_target.preferred_range}`);
console.log(`Likely compatible: ${compatible ? "yes" : "review-required"}`);
console.log(`Pinned compatible: ${pinnedCompatible ? "yes" : "review-required"}`);

if (!compatible || !pinnedCompatible) {
  process.exitCode = 1;
}
