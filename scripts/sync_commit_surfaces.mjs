import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const writeMode = args.has("--write");
const checkMode = args.has("--check");
const stageMode = args.has("--stage");
const dryRunMode = args.has("--dry-run") || (!writeMode && !checkMode);
const changes = [];

const packageJson = await readJson("package.json");
const projectMeta = await readJson("config/project-meta.json");
const upstreamConfig = await readJson("config/upstream-mercury-agent.json");
const routeConfig = await readJson("config/rule-routing.json");

syncProjectMeta(projectMeta, packageJson);
syncRuntimeConfig(upstreamConfig);
assertRuntimePin(upstreamConfig);

await proposeJson("config/project-meta.json", projectMeta);
await proposeJson("config/upstream-mercury-agent.json", upstreamConfig);
await syncReadme("README.md");
await syncReadme("README.en.md");
await syncUpstreamCompatibilityDoc();
await syncGithubIssueTemplate();
await syncGithubPullRequestTemplate();

if (checkMode && changes.length > 0) {
  console.error("Commit surfaces are out of sync:");
  for (const change of changes) {
    console.error(`- ${change.relPath}`);
  }
  console.error("Run: npm run sync:commit");
  process.exit(1);
}

if (writeMode) {
  for (const change of changes) {
    await writeFile(join(root, change.relPath), change.nextText, "utf8");
  }

  if (stageMode && changes.length > 0) {
    const result = spawnSync("git", ["add", "--", ...changes.map((change) => change.relPath)], {
      cwd: root,
      stdio: "inherit"
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

if (dryRunMode) {
  if (changes.length === 0) {
    console.log("Commit surfaces already in sync.");
  } else {
    console.log("Commit surfaces that would be synced:");
    for (const change of changes) {
      console.log(`- ${change.relPath}`);
    }
  }
} else if (changes.length === 0) {
  console.log("Commit surfaces already in sync.");
} else if (writeMode) {
  console.log(`Synced ${changes.length} commit surface${changes.length === 1 ? "" : "s"}.`);
}

async function readJson(relPath) {
  return JSON.parse(await readFile(join(root, relPath), "utf8"));
}

async function readText(relPath) {
  return readFile(join(root, relPath), "utf8");
}

async function proposeJson(relPath, value) {
  await proposeText(relPath, `${JSON.stringify(value, null, 2)}\n`);
}

async function proposeText(relPath, nextText) {
  const currentText = await readText(relPath);
  if (currentText !== nextText) {
    changes.push({ relPath, nextText });
  }
}

function syncProjectMeta(meta, pkg) {
  meta.project_name = meta.project_name || "Mercury Method Lab";
  meta.package_name = pkg.name;
  meta.version = pkg.version;
}

function syncRuntimeConfig(config) {
  config.runtime = config.runtime || {};
  config.runtime.package = config.upstream.package;
  config.runtime.npx_spec = `${config.runtime.package}@${config.runtime.pinned_version}`;
  config.runtime.cache_relative_to_workspace = config.runtime.cache_relative_to_workspace || ".npm-cache";
  config.runtime.pin_policy = config.runtime.pin_policy
    || "Launch scripts must use this exact version. Pre-commit sync keeps generated repository surfaces aligned with this source.";
}

function assertRuntimePin(config) {
  const version = config.runtime?.pinned_version;
  const range = config.compatibility_target?.preferred_range;

  if (!version) {
    throw new Error("Missing runtime.pinned_version in config/upstream-mercury-agent.json.");
  }

  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Runtime pin must be an exact semver version, received: ${version}`);
  }

  if (range && !satisfiesSimpleRange(version, range)) {
    throw new Error(`Runtime pin ${version} does not satisfy compatibility range ${range}.`);
  }
}

function satisfiesSimpleRange(version, range) {
  const match = range.match(/^>=\s*(\d+\.\d+\.\d+)\s+<\s*(\d+\.\d+\.\d+)$/);
  if (!match) {
    return true;
  }

  return compareSemver(version, match[1]) >= 0 && compareSemver(version, match[2]) < 0;
}

function compareSemver(left, right) {
  const a = left.split(".").map((part) => Number.parseInt(part, 10));
  const b = right.split(".").map((part) => Number.parseInt(part, 10));
  for (let index = 0; index < 3; index += 1) {
    const delta = (a[index] ?? 0) - (b[index] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

async function syncReadme(relPath) {
  const current = await readText(relPath);
  let next = replaceRequired(
    relPath,
    current,
    /^Version: `[^`]+`.*$/m,
    `Version: \`${packageJson.version}\``
  );

  next = replaceOptional(
    next,
    /@cosmicstack\/mercury-agent\s+>=\d+\.\d+\.\d+\s+<\d+\.\d+\.\d+/g,
    `${upstreamConfig.upstream.package} ${upstreamConfig.compatibility_target.preferred_range}`
  );

  next = replaceOptional(
    next,
    /docs\/ITERATION-GUIDE-\d+(?:\.\d+)*\.md/g,
    `docs/ITERATION-GUIDE-${packageJson.version}.md`
  );

  await proposeText(relPath, next);
}

async function syncUpstreamCompatibilityDoc() {
  const relPath = "docs/upstream-mercury-agent-compatibility.md";
  const current = await readText(relPath);
  let next = replaceRequired(
    relPath,
    current,
    /Observed on \d{4}-\d{2}-\d{2}:/,
    `Observed on ${upstreamConfig.observed_at}:`
  );

  const snapshotTable = [
    "| Item | Value |",
    "| --- | --- |",
    `| Repository | \`${upstreamConfig.upstream.repo}\` |`,
    `| Package | \`${upstreamConfig.upstream.package}\` |`,
    `| Observed version | \`${upstreamConfig.upstream.observed_package_version}\` |`,
    `| Runtime pin | \`${upstreamConfig.runtime.npx_spec}\` |`,
    `| License | ${upstreamConfig.upstream.license} |`,
    "| Runtime home | `~/.mercury/` |",
    "| Core memory | `~/.mercury/memory/` |",
    "| Skills | `~/.mercury/skills/` |"
  ].join("\n");

  next = replaceRequired(
    relPath,
    next,
    /\| Item \| Value \|\r?\n\| --- \| --- \|\r?\n[\s\S]*?(?=\r?\n\r?\n## Compatibility Policy)/,
    snapshotTable
  );

  next = replaceRequired(
    relPath,
    next,
    /Target range: `[^`]+`\./,
    `Target range: \`${upstreamConfig.compatibility_target.preferred_range}\`.`
  );

  await proposeText(relPath, next);
}

async function syncGithubIssueTemplate() {
  const relPath = ".github/ISSUE_TEMPLATE/viewpoint.yml";
  const current = await readText(relPath);
  const routeOptions = routeIds().map((id) => `        - ${id}`).join("\n") + "\n";
  const next = replaceRequired(
    relPath,
    current,
    /(    id: routing_hint[\s\S]*?      options:\r?\n)([\s\S]*?)(    validations:\r?\n)/,
    `$1${routeOptions}$3`
  );

  await proposeText(relPath, next);
}

async function syncGithubPullRequestTemplate() {
  const relPath = ".github/pull_request_template.md";
  const current = await readText(relPath);
  const routeChecks = routeIds().map((id) => `- [ ] ${id}`).join("\n");
  const next = replaceRequired(
    relPath,
    current,
    /(Suggested route:\r?\n\r?\n)([\s\S]*?)(\r?\n\r?\n## Notes)/,
    `$1${routeChecks}$3`
  );

  await proposeText(relPath, next);
}

function routeIds() {
  return routeConfig.routes.map((route) => route.id);
}

function replaceRequired(relPath, text, pattern, replacement) {
  const next = text.replace(pattern, replacement);
  if (next === text && !pattern.test(text)) {
    throw new Error(`Sync pattern not found in ${relPath}: ${pattern}`);
  }
  return next;
}

function replaceOptional(text, pattern, replacement) {
  return text.replace(pattern, replacement);
}
