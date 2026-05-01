import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { appendFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dashboardRoot = join(root, "dashboard");
const port = Number(process.env.MERCURY_DASHBOARD_PORT || 4788);
const lifecycleLogPath = join(root, "data", "lifecycle-log.jsonl");
const appVersion = "2026.04.26-f";

const artifactDirs = [
  "00_inbox",
  "00_raw",
  "01_segmented",
  "02_cleaned",
  "03_uncertain",
  "04_memory_candidates",
  "05_decision_logs",
  "06_action_plans",
  "07_audit_reports",
  "10_exports"
];

const commandAllowlist = new Map([
  ["doctor", ["run", "doctor"]],
  ["index", ["run", "index"]],
  ["validate", ["run", "validate"]],
  ["sync:skills", ["run", "sync:skills"]],
  ["test:llm", ["run", "test:llm"]]
]);

const createTypeConfig = {
  decision_log: {
    dir: "05_decision_logs",
    ext: ".md",
    owner_role: "decision-owner",
    template: "09_templates/decision_log_template.md"
  },
  action_plan: {
    dir: "06_action_plans",
    ext: ".md",
    owner_role: "operator",
    template: "09_templates/action_plan_template.md"
  },
  audit_report: {
    dir: "07_audit_reports",
    ext: ".md",
    owner_role: "auditor",
    template: "09_templates/audit_report_template.md"
  },
  raw: {
    dir: "00_raw",
    ext: ".md",
    owner_role: "collector",
    template: "09_templates/raw_event_template.md"
  },
  memory_candidate: {
    dir: "04_memory_candidates",
    ext: ".yaml",
    owner_role: "memory-curator",
    template: "09_templates/memory_candidate_template.yaml"
  }
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/health" && req.method === "GET") {
      return sendJson(res, { ok: true, app: "mercury-dashboard", version: appVersion });
    }

    if (url.pathname === "/api/overview" && req.method === "GET") {
      return sendJson(res, await buildOverview());
    }

    if (url.pathname === "/api/artifact" && req.method === "GET") {
      return sendJson(res, await getArtifactDetail(url.searchParams.get("path")));
    }

    if (url.pathname === "/api/artifact" && req.method === "PATCH") {
      const body = await readJson(req);
      return sendJson(res, await updateArtifact(body));
    }

    if (url.pathname === "/api/artifact" && req.method === "POST") {
      const body = await readJson(req);
      return sendJson(res, await createArtifact(body));
    }

    if (url.pathname === "/api/lifecycle-log" && req.method === "GET") {
      return sendJson(res, { ok: true, events: await readLifecycleLog() });
    }

    if (url.pathname === "/api/run" && req.method === "POST") {
      const body = await readJson(req);
      return sendJson(res, await runAllowedCommand(body.script));
    }

    if (url.pathname === "/api/model-provider" && req.method === "PATCH") {
      const body = await readJson(req);
      return sendJson(res, await setActiveProvider(body.provider));
    }

    if (url.pathname === "/api/capability" && req.method === "PATCH") {
      const body = await readJson(req);
      return sendJson(res, await setCapabilityStatus(body.key, body.status));
    }

    return serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, { ok: false, error: error.message }, 500);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mercury dashboard: http://127.0.0.1:${port}`);
});

async function buildOverview() {
  const [
    stateMachine,
    permissions,
    modelProviders,
    capabilities,
    methods,
    entrypoints,
    integrations
  ] = await Promise.all([
    readJsonFile("config/state-machine.json"),
    readJsonFile("config/permissions.json"),
    readJsonFile("config/model-providers.json"),
    readJsonFile("config/mercury-capabilities.json"),
    readJsonFile("config/methods.json"),
    readJsonFile("config/architecture-entrypoints.json"),
    readJsonFile("config/integrations.json")
  ]);

  const artifacts = await collectArtifacts();
  const statusCounts = buildStatusCounts(artifacts, stateMachine.states);
  const lifecycleLog = await readLifecycleLog();
  const reviewQueue = artifacts
    .filter((artifact) => artifact.review_at && !["approved", "superseded", "rejected"].includes(artifact.status))
    .sort((a, b) => a.review_at.localeCompare(b.review_at));

  return {
    ok: true,
    appVersion,
    generated_at: new Date().toISOString(),
    root,
    stateMachine,
    permissions,
    modelProviders,
    capabilities,
    methods,
    entrypoints,
    integrations,
    artifacts,
    statusCounts,
    lifecycleLog,
    reviewQueue,
    auditSummary: buildAuditSummary(artifacts, statusCounts)
  };
}

async function collectArtifacts() {
  const files = [];
  for (const dir of artifactDirs) {
    files.push(...await listFiles(join(root, dir)));
  }

  const artifacts = [];
  for (const file of files) {
    if (!/\.(md|ya?ml|json)$/i.test(file)) {
      continue;
    }

    const text = await readFile(file, "utf8");
    const fileStat = await stat(file);
    const relPath = relative(root, file).replaceAll("\\", "/");
    const metadata = parseMetadata(text, relPath);

    artifacts.push({
      id: metadata.id || relPath.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase(),
      path: relPath,
      name: relPath.split("/").pop(),
      directory: relPath.split("/")[0],
      type: metadata.type || inferType(relPath),
      status: metadata.status || "unclassified",
      owner_role: metadata.owner_role || "",
      review_at: metadata.review_at || "",
      created_at: metadata.created_at || "",
      source_refs: metadata.source_refs || [],
      decision_refs: metadata.decision_refs || [],
      updated_at: fileStat.mtime.toISOString()
    });
  }

  return artifacts.sort((a, b) => a.path.localeCompare(b.path));
}

async function listFiles(dir) {
  const output = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...await listFiles(path));
    } else {
      output.push(path);
    }
  }
  return output;
}

function parseMetadata(text, relPath) {
  if (/\.ya?ml$/i.test(relPath)) {
    return parseFlatYaml(text);
  }

  const metadata = {};
  const metadataMatch = text.match(/## Artifact Metadata\s+([\s\S]*?)(?=\n## |\n# |\s*$)/i);
  if (!metadataMatch) {
    return metadata;
  }

  for (const line of metadataMatch[1].split(/\r?\n/)) {
    const match = line.match(/^-\s*([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }
    metadata[match[1]] = match[2].trim();
  }

  return metadata;
}

function parseFlatYaml(text) {
  const result = {};
  let currentKey = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      result[currentKey] ??= [];
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [result[currentKey]];
      }
      result[currentKey].push(unquote(listMatch[1].trim()));
      continue;
    }
    const pairMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pairMatch) {
      currentKey = pairMatch[1];
      result[currentKey] = unquote(pairMatch[2].trim());
    }
  }
  return result;
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "");
}

function inferType(path) {
  const dir = path.split("/")[0];
  const map = {
    "00_raw": "raw",
    "00_inbox": "inbox_source",
    "01_segmented": "segmented",
    "02_cleaned": "cleaned",
    "03_uncertain": "uncertain",
    "04_memory_candidates": "memory_candidate",
    "05_decision_logs": "decision_log",
    "06_action_plans": "action_plan",
    "07_audit_reports": "audit_report",
    "10_exports": "export"
  };
  return map[dir] || "unknown";
}

function buildStatusCounts(artifacts, states) {
  const counts = Object.fromEntries([...states, "unclassified"].map((state) => [state, 0]));
  for (const artifact of artifacts) {
    counts[artifact.status] ??= 0;
    counts[artifact.status] += 1;
  }
  return counts;
}

function buildAuditSummary(artifacts, statusCounts) {
  const missingStatus = artifacts.filter((artifact) => artifact.status === "unclassified").length;
  const missingReview = artifacts.filter((artifact) => artifact.type === "memory_candidate" && !artifact.review_at).length;
  const auditReports = artifacts.filter((artifact) => artifact.type === "audit_report").length;
  return {
    missingStatus,
    missingReview,
    auditReports,
    reusable: (statusCounts.approved || 0) + (statusCounts.audited || 0),
    needsReview: (statusCounts.draft || 0) + (statusCounts.review_ready || 0) + missingReview
  };
}

async function getArtifactDetail(path) {
  const relPath = assertArtifactPath(path);
  const fullPath = join(root, relPath);
  const text = await readFile(fullPath, "utf8");
  const fileStat = await stat(fullPath);
  const metadata = parseMetadata(text, relPath);
  const artifact = {
    id: metadata.id || relPath.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase(),
    path: relPath,
    name: relPath.split("/").pop(),
    directory: relPath.split("/")[0],
    type: metadata.type || inferType(relPath),
    status: metadata.status || "unclassified",
    owner_role: metadata.owner_role || "",
    review_at: metadata.review_at || "",
    created_at: metadata.created_at || "",
    source_refs: metadata.source_refs || [],
    decision_refs: metadata.decision_refs || [],
    updated_at: fileStat.mtime.toISOString()
  };
  const stateMachine = await readJsonFile("config/state-machine.json");
  const events = (await readLifecycleLog()).filter((event) => event.path === relPath);

  return {
    ok: true,
    artifact,
    metadata,
    content: text,
    allowed_next_statuses: getAllowedNextStatuses(artifact.status, stateMachine),
    events
  };
}

async function updateArtifact(body) {
  const relPath = assertArtifactPath(body.path);
  const fullPath = join(root, relPath);
  const beforeText = await readFile(fullPath, "utf8");
  const beforeMetadata = parseMetadata(beforeText, relPath);
  const beforeStatus = beforeMetadata.status || "unclassified";
  const updates = pickMetadataUpdates(body);

  if (updates.status && updates.status !== beforeStatus) {
    const stateMachine = await readJsonFile("config/state-machine.json");
    const allowed = getAllowedNextStatuses(beforeStatus, stateMachine);
    if (!allowed.includes(updates.status)) {
      throw new Error(`Invalid lifecycle transition: ${beforeStatus} -> ${updates.status}`);
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No supported metadata fields were provided");
  }

  const afterText = updateMetadataText(beforeText, relPath, updates);
  await writeFile(fullPath, afterText, "utf8");
  await appendLifecycleEvent({
    action: "artifact.update",
    path: relPath,
    before_status: beforeStatus,
    after_status: updates.status || beforeStatus,
    updates,
    note: String(body.note || "").trim()
  });

  return await getArtifactDetail(relPath);
}

async function createArtifact(body) {
  const type = String(body.type || "").trim();
  const config = createTypeConfig[type];
  if (!config) {
    throw new Error(`Unsupported artifact type: ${type}`);
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const title = String(body.title || type).trim();
  const slug = slugify(title) || `${type}-${Date.now()}`;
  const relPath = `${config.dir}/${date}-${slug}${config.ext}`;
  const fullPath = join(root, relPath);
  const template = await readFile(join(root, config.template), "utf8");
  const metadata = {
    schema_version: "0.1",
    id: slug,
    type,
    status: "draft",
    owner_role: String(body.owner_role || config.owner_role).trim(),
    created_at: date,
    review_at: String(body.review_at || "").trim(),
    source_refs: String(body.source_ref || "").trim(),
    decision_refs: ""
  };

  const content = updateMetadataText(template, relPath, metadata).replace(/^# .+$/m, `# ${title}`);
  await mkdir(join(root, config.dir), { recursive: true });
  await writeFile(fullPath, content, { encoding: "utf8", flag: "wx" });
  await appendLifecycleEvent({
    action: "artifact.create",
    path: relPath,
    before_status: "",
    after_status: "draft",
    updates: metadata,
    note: String(body.note || "").trim()
  });

  return await getArtifactDetail(relPath);
}

function pickMetadataUpdates(body) {
  const allowed = new Set(["status", "owner_role", "review_at", "source_refs", "decision_refs"]);
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = String(body[key] || "").trim();
    }
  }
  return updates;
}

function updateMetadataText(text, relPath, updates) {
  if (/\.ya?ml$/i.test(relPath)) {
    return updateYamlMetadata(text, updates);
  }
  return updateMarkdownMetadata(text, updates);
}

function updateYamlMetadata(text, updates) {
  const lines = text.split(/\r?\n/);
  const seen = new Set();
  const nextLines = lines.map((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match && Object.prototype.hasOwnProperty.call(updates, match[1])) {
      seen.add(match[1]);
      return `${match[1]}: ${formatScalar(updates[match[1]])}`;
    }
    return line;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) {
      nextLines.push(`${key}: ${formatScalar(value)}`);
    }
  }

  return `${nextLines.join("\n").replace(/\s+$/u, "")}\n`;
}

function updateMarkdownMetadata(text, updates) {
  const sectionMatch = text.match(/## Artifact Metadata\s+([\s\S]*?)(?=\n## |\n# |\s*$)/i);
  if (!sectionMatch) {
    const metadataBlock = ["## Artifact Metadata", "", ...metadataLines(updates), ""].join("\n");
    const firstHeading = text.match(/^# .+$/m);
    if (firstHeading) {
      const insertAt = firstHeading.index + firstHeading[0].length;
      return `${text.slice(0, insertAt)}\n\n${metadataBlock}${text.slice(insertAt).replace(/^\s*/, "\n")}`;
    }
    return `${metadataBlock}\n${text}`;
  }

  const section = sectionMatch[0];
  const lines = section.split(/\r?\n/);
  const seen = new Set();
  const nextLines = lines.map((line) => {
    const match = line.match(/^-\s*([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match && Object.prototype.hasOwnProperty.call(updates, match[1])) {
      seen.add(match[1]);
      return `- ${match[1]}: ${formatScalar(updates[match[1]])}`;
    }
    return line;
  });

  while (nextLines.length > 0 && nextLines[nextLines.length - 1].trim() === "") {
    nextLines.pop();
  }

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) {
      nextLines.push(`- ${key}: ${formatScalar(value)}`);
    }
  }

  nextLines.push("");

  return text.replace(section, nextLines.join("\n"));
}

function metadataLines(metadata) {
  return Object.entries(metadata).map(([key, value]) => `- ${key}: ${formatScalar(value)}`);
}

function formatScalar(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value ?? "").replace(/\r?\n/g, " ").trim();
}

function getAllowedNextStatuses(status, stateMachine) {
  if (stateMachine.transitions?.[status]) {
    return stateMachine.transitions[status];
  }
  if (!status || status === "unclassified") {
    return ["staged", "deferred", "indexed", "draft", "rejected"];
  }
  return [];
}

function assertArtifactPath(path) {
  if (!path || typeof path !== "string") {
    throw new Error("Artifact path is required");
  }
  const normalized = normalize(path).replaceAll("\\", "/");
  if (normalized.startsWith("../") || normalized.startsWith("/") || normalized.includes(":/")) {
    throw new Error(`Invalid artifact path: ${path}`);
  }
  const topDir = normalized.split("/")[0];
  if (!artifactDirs.includes(topDir)) {
    throw new Error(`Path is outside managed artifact directories: ${path}`);
  }
  return normalized;
}

async function readLifecycleLog(limit = 120) {
  try {
    const text = await readFile(lifecycleLogPath, "utf8");
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .slice(-limit)
      .reverse();
  } catch {
    return [];
  }
}

async function appendLifecycleEvent(event) {
  await mkdir(dirname(lifecycleLogPath), { recursive: true });
  const record = {
    schema_version: "0.1",
    at: new Date().toISOString(),
    actor: "mercury-gui",
    ...event
  };
  await appendFile(lifecycleLogPath, `${JSON.stringify(record)}\n`, "utf8");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function runAllowedCommand(script) {
  if (!commandAllowlist.has(script)) {
    throw new Error(`Command is not allowed: ${script}`);
  }

  const args = commandAllowlist.get(script);
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const commandArgs = process.platform === "win32" ? ["/c", "npm", ...args] : args;

  return await new Promise((resolve) => {
    execFile(command, commandArgs, { cwd: root, timeout: 60000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        script,
        exitCode: error?.code ?? 0,
        stdout,
        stderr
      });
    });
  });
}

async function setActiveProvider(providerName) {
  const config = await readJsonFile("config/model-providers.json");
  if (!config.providers?.[providerName]) {
    throw new Error(`Unknown provider: ${providerName}`);
  }
  config.active_provider = providerName;
  await writeJsonFile("config/model-providers.json", config);
  return { ok: true, active_provider: providerName };
}

async function setCapabilityStatus(key, status) {
  const allowed = new Set(["active", "reserved", "disabled"]);
  if (!allowed.has(status)) {
    throw new Error(`Invalid capability status: ${status}`);
  }

  const config = await readJsonFile("config/mercury-capabilities.json");
  if (!config.capabilities?.[key]) {
    throw new Error(`Unknown capability: ${key}`);
  }
  config.capabilities[key].status = status;
  await writeJsonFile("config/mercury-capabilities.json", config);
  return { ok: true, key, status };
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function readJsonFile(path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

async function writeJsonFile(path, value) {
  await writeFile(join(root, path), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sendJson(res, payload, statusCode = 200) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(dashboardRoot, requested));

  if (!filePath.startsWith(dashboardRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  }[extname(filePath)] || "text/plain; charset=utf-8";

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Static file read failed");
  });
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0"
  });
  stream.pipe(res);
}
