import { createServer } from "node:http";
import { execFile, spawnSync } from "node:child_process";
import { appendFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { basename, dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

// goal-validator API
const { validate: goalValidate, createActionPlan: goalCreateActionPlan } = await import("./goal-validator.mjs").catch(() => ({ validate: null, createActionPlan: null }));

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dashboardRoot = join(root, "dashboard");
const port = Number(process.env.MERCURY_DASHBOARD_PORT || 4788);
const lifecycleLogPath = join(root, "data", "lifecycle-log.jsonl");
const appVersion = "2026.05.02-c";
const expectedClientAssetVersion = "20260502c";

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
  ["test:llm", ["run", "test:llm"]],
  ["goal:validate", ["run", "goal:validate"]]
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
      const packageJson = await readJsonFile("package.json");
      return sendJson(res, {
        ok: true,
        app: "mercury-dashboard",
        version: appVersion,
        packageVersion: packageJson.version,
        nodeVersion: process.version,
        expectedClientAssetVersion
      });
    }

    if (url.pathname === "/api/overview" && req.method === "GET") {
      return sendJson(res, await buildOverview());
    }

    if (url.pathname === "/api/submission/viewpoint" && req.method === "POST") {
      const body = await readJson(req);
      return sendJson(res, await createViewpointSubmission(body));
    }

    if (url.pathname === "/api/intake" && req.method === "POST") {
      const body = await readJson(req);
      return sendJson(res, await createIntake(body));
    }

    if (url.pathname === "/api/submission/promote" && req.method === "POST") {
      const body = await readJson(req);
      return sendJson(res, await promoteViewpointSubmission(body.path));
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

    if (url.pathname === "/api/execution-mode" && req.method === "PATCH") {
      const body = await readJson(req);
      return sendJson(res, await setExecutionMode(body.mode));
    }

    if (url.pathname === "/api/analysis-persona" && req.method === "PATCH") {
      const body = await readJson(req);
      return sendJson(res, await setAnalysisPersona(body.persona));
    }

    if (url.pathname === "/api/capability" && req.method === "PATCH") {
      const body = await readJson(req);
      return sendJson(res, await setCapabilityStatus(body.key, body.status));
    }

    // ── /goal 照妖镜 API ──────────────────────────────────────

    if (url.pathname === "/api/goal/validate" && req.method === "POST") {
      if (!goalValidate) {
        return sendJson(res, { ok: false, error: "goal-validator not available" }, 500);
      }
      const body = await readJson(req);
      const result = goalValidate(body.text || "");
      return sendJson(res, { ok: true, result });
    }

    if (url.pathname === "/api/goal/create" && req.method === "POST") {
      if (!goalValidate || !goalCreateActionPlan) {
        return sendJson(res, { ok: false, error: "goal-validator not available" }, 500);
      }
      const body = await readJson(req);
      const validation = goalValidate(body.text || "");
      if (!validation.ok) {
        return sendJson(res, { ok: false, result: validation });
      }
      const filePath = await goalCreateActionPlan(validation);
      validation.created_path = filePath;
      return sendJson(res, { ok: true, result: validation });
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
    integrations,
    packageJson
  ] = await Promise.all([
    readJsonFile("config/state-machine.json"),
    readJsonFile("config/permissions.json"),
    readJsonFile("config/model-providers.json"),
    readJsonFile("config/mercury-capabilities.json"),
    readJsonFile("config/methods.json"),
    readJsonFile("config/architecture-entrypoints.json"),
    readJsonFile("config/integrations.json"),
    readJsonFile("package.json")
  ]);

  const artifacts = await collectArtifacts();
  const statusCounts = buildStatusCounts(artifacts, stateMachine.states);
  const lifecycleLog = await readLifecycleLog();
  const submissions = await collectSubmissions();
  const deployment = buildDeploymentReadiness({ modelProviders, integrations, methods, packageJson, submissions });
  const reviewQueue = artifacts
    .filter((artifact) => artifact.review_at && !["approved", "superseded", "rejected"].includes(artifact.status))
    .sort((a, b) => a.review_at.localeCompare(b.review_at));

  return {
    ok: true,
    appVersion,
    expectedClientAssetVersion,
    packageVersion: packageJson.version,
    nodeVersion: process.version,
    generated_at: new Date().toISOString(),
    root,
    stateMachine,
    permissions,
    modelProviders,
    capabilities,
    methods,
    deployment,
    entrypoints,
    integrations,
    submissions,
    artifacts,
    statusCounts,
    lifecycleLog,
    reviewQueue,
    auditSummary: buildAuditSummary(artifacts, statusCounts)
  };
}

function buildDeploymentReadiness({ modelProviders, integrations, methods, packageJson, submissions }) {
  const providerName = modelProviders.active_provider;
  const provider = modelProviders.providers?.[providerName] || {};
  const apiKeyNames = [provider.api_key_env, ...(provider.api_key_env_aliases || [])].filter(Boolean);
  const apiKeyEnv = apiKeyNames[0] || "";
  const baseUrlEnv = provider.base_url_env || "";
  const modelEnv = provider.model_env || "";
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const platformLabels = {
    win32: "Windows",
    darwin: "macOS",
    linux: "Linux"
  };
  const supportedPlatform = Boolean(platformLabels[process.platform]);
  const apiKeyRequired = methods.execution_mode !== "agent" && provider.api_key_required !== false;
  const apiKeySet = apiKeyNames.length ? apiKeyNames.some((name) => Boolean(readRuntimeEnv(name))) : true;
  const openclawConfigured = Boolean(readRuntimeEnv("OPENCLAW_BASE_URL") || providerName === "local-openclaw");
  const markitdownEnabled = readRuntimeEnv("MERCURY_MARKITDOWN_ENABLED") === "true" || integrations.integrations?.markitdown?.status === "active";

  const items = [
    {
      key: "node",
      level: nodeMajor >= 20 ? "ok" : "required",
      label: `Node ${process.version}`,
      detail: "Requires Node 20+."
    },
    {
      key: "os",
      level: supportedPlatform ? "ok" : "warn",
      label: platformLabels[process.platform] || process.platform,
      detail: "Supported service targets: Windows Task Scheduler, macOS LaunchAgent, Linux systemd user unit."
    },
    {
      key: "provider",
      level: providerName ? "ok" : "required",
      label: providerName || "No provider",
      detail: providerName ? `Active model provider. Model override: ${modelEnv || "none"}.` : "Set config/model-providers.json active_provider."
    },
    {
      key: "api-key",
      level: apiKeyRequired && !apiKeySet ? "required" : "ok",
      label: apiKeyEnv || "No API key env required",
      detail: apiKeyRequired ? `Set one of: ${apiKeyNames.join(", ")}.` : "Agent mode or local provider can run without hosted API token."
    },
    {
      key: "persona-mode",
      level: methods.analysis_persona && methods.execution_mode ? "ok" : "required",
      label: `${methods.analysis_persona || "missing"} / ${methods.execution_mode || "missing"}`,
      detail: "analysis_persona chooses judgment posture; execution_mode chooses API or Agent channel."
    },
    {
      key: "batch-submit",
      level: "ok",
      label: "submissions/viewpoints + submissions/agent-queue",
      detail: `Silent batch path ready. Queue count: ${submissions.queue_count || 0}.`
    },
    {
      key: "openclaw",
      level: openclawConfigured ? "ok" : "optional",
      label: openclawConfigured ? "OpenClaw-like endpoint configured" : "OpenClaw-like endpoint optional",
      detail: openclawConfigured ? "OPENCLAW_BASE_URL or local-openclaw provider is present." : "Use OPENCLAW_BASE_URL and local-openclaw provider only when an agent endpoint exists."
    },
    {
      key: "markitdown",
      level: markitdownEnabled ? "ok" : "optional",
      label: markitdownEnabled ? "Document conversion enabled" : "Document conversion disabled",
      detail: "Markdown/plain text works without MarkItDown. Enable only for PDF/Office/URL conversion."
    }
  ];

  return {
    packageVersion: packageJson.version,
    platform: process.platform,
    providerName,
    ready: items.every((item) => item.level !== "required"),
    requiredCount: items.filter((item) => item.level === "required").length,
    optionalCount: items.filter((item) => item.level === "optional").length,
    items
  };
}

function readRuntimeEnv(name) {
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

async function collectSubmissions() {
  const submissionsRoot = join(root, "submissions", "viewpoints");
  const intakeRoot = join(root, "submissions", "inbox");
  const queueRoot = join(root, "submissions", "agent-queue");
  const [viewpointFiles, intakeFiles, queueFiles] = await Promise.all([
    safeListFiles(submissionsRoot),
    safeListFiles(intakeRoot),
    safeListFiles(queueRoot)
  ]);

  const viewpoints = [];
  for (const file of viewpointFiles.filter((item) => item.endsWith(".md"))) {
    const text = await readFile(file, "utf8");
    const fileStat = await stat(file);
    const metadata = parseSubmissionFrontmatter(text);
    const relPath = relative(root, file).replaceAll("\\", "/");
    const date = normalizeDate(metadata.created_at);
    const title = metadata.title || relPath.split("/").pop().replace(/\.md$/i, "");
    const rawPath = date ? join(root, "00_raw", `${date}-${slugify(title)}.md`) : "";

    viewpoints.push({
      path: relPath,
      name: relPath.split("/").pop(),
      title,
      submitter: metadata.submitter || "unknown",
      routing_hint: metadata.routing_hint || "factual-cleaning",
      source_kind: metadata.source_kind || "unknown",
      visibility: metadata.visibility || "public",
      created_at: metadata.created_at || "",
      updated_at: fileStat.mtime.toISOString(),
      promoted: rawPath ? await pathExists(rawPath) : false
    });
  }

  return {
    intake_items: await summarizeIntakeItems(intakeFiles),
    viewpoints: viewpoints.sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    queue_count: queueFiles.filter((item) => item.endsWith(".json")).length
  };
}

async function summarizeIntakeItems(files) {
  const manifests = files.filter((item) => item.endsWith("manifest.json"));
  const items = [];
  for (const file of manifests) {
    const manifest = JSON.parse(await readFile(file, "utf8"));
    const fileStat = await stat(file);
    items.push({
      ...manifest,
      path: relative(root, file).replaceAll("\\", "/"),
      updated_at: fileStat.mtime.toISOString()
    });
  }
  return items.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

async function safeListFiles(dir) {
  try {
    return await listFiles(dir);
  } catch {
    return [];
  }
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

async function createViewpointSubmission(body) {
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  if (!title || !content) {
    throw new Error("title and content are required");
  }

  const today = new Date().toISOString().slice(0, 10);
  const createdAt = normalizeDate(body.created_at) || today;
  const routingHint = String(body.routing_hint || "factual-cleaning").trim();
  const slug = slugify(title) || `viewpoint-${Date.now()}`;
  const submissionRel = `submissions/viewpoints/${createdAt}-${slug}.md`;
  const submissionPath = join(root, submissionRel);
  const queueRel = `submissions/agent-queue/${createdAt}-${slug}.json`;
  const queuePath = join(root, queueRel);

  const markdown = `---\nschema_version: "0.1"\nsubmission_type: viewpoint\ntitle: "${escapeYaml(title)}"\nsubmitter: "${escapeYaml(body.submitter || "local-gui")}"\nlicense_intent: "${escapeYaml(body.license_intent || "review-only")}"\nvisibility: "${escapeYaml(body.visibility || "public")}"\nsource_kind: "${escapeYaml(body.source_kind || "original")}"\nrouting_hint: "${escapeYaml(routingHint)}"\ncreated_at: "${createdAt}"\n---\n\n# ${title}\n\n${content}\n`;
  const envelope = {
    schema_version: "0.1",
    task_type: "promote-submission",
    source_path: submissionRel,
    preferred_route: routingHint,
    requested_outputs: ["raw_artifact", "routing_recommendation"],
    human_review_required: true
  };

  await mkdir(dirname(submissionPath), { recursive: true });
  await mkdir(dirname(queuePath), { recursive: true });
  await writeFile(submissionPath, markdown, "utf8");
  await writeFile(queuePath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
  await appendLifecycleEvent({
    action: "submission.create",
    path: submissionRel,
    note: `routing_hint=${routingHint}`
  });

  return {
    ok: true,
    submission: {
      path: submissionRel,
      queue_path: queueRel,
      title,
      routing_hint: routingHint
    }
  };
}

async function createIntake(body) {
  const text = String(body.text || "").trim();
  const files = Array.isArray(body.files) ? body.files : [];
  if (!text && files.length === 0) {
    throw new Error("text or files are required");
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  let title = inferIntakeTitle(text, files);
  const id = `${date}-${stamp.toLowerCase()}-${slugify(title) || "intake"}`;
  const intakeRel = `submissions/inbox/${id}`;
  const intakeDir = join(root, intakeRel);
  const filesRel = `${intakeRel}/files`;
  const rawRel = `00_raw/${id}.md`;
  const rawPath = join(root, rawRel);
  const savedFiles = [];
  const extractedTexts = [];

  await mkdir(intakeDir, { recursive: true });
  await mkdir(join(root, filesRel), { recursive: true });

  if (text) {
    await writeFile(join(intakeDir, "input.md"), `# User input\n\n${text}\n`, "utf8");
  }

  for (const [index, file] of files.entries()) {
    const safeName = sanitizeFilename(file.name || `upload-${index + 1}`);
    const targetRel = `${filesRel}/${safeName}`;
    const targetPath = join(root, targetRel);
    const bytes = decodeDataUrl(file.dataUrl || "");
    const extractedText = extractTextFromUpload(safeName, file.type || "", bytes);
    await writeFile(targetPath, bytes);
    savedFiles.push({
      name: safeName,
      path: targetRel,
      type: file.type || "application/octet-stream",
      size_bytes: bytes.length,
      text_extracted: Boolean(extractedText)
    });
    if (extractedText) {
      extractedTexts.push({
        name: safeName,
        text: extractedText
      });
    }
  }

  const analysisText = [text, ...extractedTexts.map((item) => item.text)].filter(Boolean).join("\n\n");
  if (!text && analysisText) {
    title = inferIntakeTitle(analysisText, savedFiles);
  }
  const route = inferRoute(analysisText, savedFiles);
  const result = buildIntakeResult({ text: analysisText, files: savedFiles, route, title });
  const manifest = {
    schema_version: "0.1",
    id,
    title,
    kind: "raw-user-material",
    created_at: now.toISOString(),
    text_path: text ? `${intakeRel}/input.md` : "",
    files: savedFiles,
    route,
    raw_artifact: rawRel,
    result
  };

  const queueRel = `submissions/agent-queue/${id}.json`;
  const envelope = {
    schema_version: "0.1",
    task_type: "process-intake",
    source_path: `${intakeRel}/manifest.json`,
    preferred_route: route,
    requested_outputs: ["clean_statement", "questions", "raw_artifact", "routing_recommendation"],
    human_review_required: true
  };

  await writeFile(join(intakeDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(join(root, queueRel), `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
  await writeFile(rawPath, renderRawIntakeArtifact({ id, title, date, intakeRel, text, savedFiles, extractedTexts, route, result }), "utf8");

  await appendLifecycleEvent({
    action: "intake.create",
    path: rawRel,
    note: `route=${route}; files=${savedFiles.length}`
  });

  return {
    ok: true,
    intake: manifest,
    queue_path: queueRel
  };
}

async function promoteViewpointSubmission(path) {
  const sourcePath = assertSubmissionPath(path);
  const text = await readFile(sourcePath, "utf8");
  const frontmatter = parseSubmissionFrontmatter(text);
  const slug = slugify(frontmatter.title || basename(sourcePath, ".md")) || `viewpoint-${Date.now()}`;
  const date = normalizeDate(frontmatter.created_at) || new Date().toISOString().slice(0, 10);
  const id = `${date}-${slug}`;
  const targetRel = `00_raw/${id}.md`;
  const targetPath = join(root, targetRel);

  if (await pathExists(targetPath)) {
    return {
      ok: true,
      artifact: await getArtifactDetail(targetRel),
      already_exists: true
    };
  }

  const output = `# ${frontmatter.title || slug}\n\n## Artifact Metadata\n\n- schema_version: 0.1\n- id: ${id}\n- type: raw\n- status: draft\n- owner_role: collector\n- source_refs: ${relative(root, sourcePath).replaceAll("\\", "/")}\n- created_at: ${date}\n- review_at: ${date}\n- submission_type: viewpoint\n- submitter: ${frontmatter.submitter || "unknown"}\n- license_intent: ${frontmatter.license_intent || "review-only"}\n- visibility: ${frontmatter.visibility || "public"}\n- source_kind: ${frontmatter.source_kind || "unknown"}\n- routing_hint: ${frontmatter.routing_hint || "factual-cleaning"}\n\n## Original Submission\n\n${stripFrontmatter(text).trim()}\n\n## Promotion Notes\n\n- Promoted from user submission.\n- This artifact is raw intake, not an approved fact or memory.\n- Next recommended route: ${frontmatter.routing_hint || "factual-cleaning"}\n`;

  await writeFile(targetPath, output, "utf8");
  await appendLifecycleEvent({
    action: "submission.promote",
    path: targetRel,
    note: `source=${relative(root, sourcePath).replaceAll("\\", "/")}`
  });

  return {
    ok: true,
    artifact: await getArtifactDetail(targetRel),
    already_exists: false
  };
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

function assertSubmissionPath(path) {
  if (!path || typeof path !== "string") {
    throw new Error("Submission path is required");
  }
  const normalized = normalize(path).replaceAll("\\", "/");
  if (normalized.startsWith("../") || normalized.startsWith("/") || normalized.includes(":/")) {
    throw new Error(`Invalid submission path: ${path}`);
  }
  if (!normalized.startsWith("submissions/viewpoints/") || !normalized.endsWith(".md")) {
    throw new Error(`Path is outside viewpoint submissions: ${path}`);
  }
  return join(root, normalized);
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
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parseSubmissionFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    data[pair[1]] = unquote(pair[2].trim());
  }
  return data;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function normalizeDate(value) {
  if (!value) return "";
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function escapeYaml(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function inferIntakeTitle(text, files) {
  const firstLine = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^#+\s*/, ""))
    .find(Boolean);
  if (firstLine) {
    return firstLine.slice(0, 48);
  }
  if (files.length === 1) {
    return files[0].name || "uploaded-material";
  }
  return files.length > 1 ? `${files.length}-uploaded-files` : "untitled-intake";
}

function inferRoute(text, files) {
  const normalized = text.toLowerCase();
  if (files.length > 0 && !text) {
    return "factual-cleaning";
  }
  if (/自媒体|标题|流量|粉丝|变现|选题|公众号|小红书|短视频|发布策略|内容创作|publish|content strategy|audience|creator/.test(normalized)) {
    return "content-commercial-diagnosis";
  }
  if (/行动|计划|下一步|执行|落地|action|todo|plan/.test(normalized)) {
    return "action-translation";
  }
  if (/结构|权力|规则|路径|系统|市场|竞争|维度|判别|模型|算力|验证|创新|解释|判断|structure|power|market|system|dimension|model|verification|judgment/.test(normalized)) {
    return "structural-judgment";
  }
  return "factual-cleaning";
}

function buildIntakeResult({ text, files, route, title }) {
  const hasText = Boolean(text.trim());
  const hasFiles = files.length > 0;
  const statement = hasText
    ? summarizeText(text)
    : `已接收 ${files.length} 个文件，当前尚未解析文件正文。`;
  const questions = [];

  if (hasFiles && !files.some((file) => file.text_extracted)) {
    questions.push("这些文件暂未解析正文：如果是图片、PDF 或 Word，后续需要 OCR/转换/摘要。");
  } else if (hasFiles) {
    questions.push("已从文本类文件中抽取正文；若还有图片、PDF 或 Word，后续仍需转换。");
  }
  if (text.length < 80 && !hasFiles) {
    questions.push("这条材料较短：你希望系统把它当作观点、问题、行动请求，还是待归档素材？");
  }
  if (route === "structural-judgment") {
    questions.push("这个判断是否会影响项目方向、公开表达或资源投入？若会，后续需要审计。");
  }

  return {
    title,
    clean_statement: statement,
    route,
    questions,
    next_step: route === "factual-cleaning"
      ? "先做事实/推测/缺口分离。"
      : `建议进入 ${route} 路由，但仍需保留原始材料。`
  };
}

function summarizeText(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) {
    return compact;
  }
  return `${compact.slice(0, 180)}...`;
}

function renderRawIntakeArtifact({ id, title, date, intakeRel, text, savedFiles, extractedTexts, route, result }) {
  const fileRefs = savedFiles.map((file) => `- ${file.path} (${file.type}, ${file.size_bytes} bytes, text_extracted=${file.text_extracted})`).join("\n") || "- none";
  const extractedTextBlock = extractedTexts.length
    ? extractedTexts.map((file) => `### ${file.name}\n\n${file.text}`).join("\n\n")
    : "_No file text extracted._";
  return `# ${title}

## Artifact Metadata

- schema_version: 0.1
- id: ${id}
- type: raw
- status: draft
- owner_role: collector
- source_refs: ${intakeRel}/manifest.json
- created_at: ${date}
- review_at: ${date}
- submission_type: raw_user_material
- routing_hint: ${route}

## Clean Intake Statement

${result.clean_statement}

## System Questions

${result.questions.length ? result.questions.map((question) => `- ${question}`).join("\n") : "- 暂无，材料可进入下一步处理。"}

## Next Step

${result.next_step}

## Stored Inputs

- text: ${text ? `${intakeRel}/input.md` : "none"}

## Stored Files

${fileRefs}

## Original Text Snapshot

${text || "_No text submitted._"}

## Extracted File Text

${extractedTextBlock}
`;
}

function sanitizeFilename(value) {
  const cleaned = String(value)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || `upload-${Date.now()}`;
}

function decodeDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:.*?;base64,(.*)$/);
  if (!match) {
    throw new Error("Uploaded file must be base64 data URL");
  }
  return Buffer.from(match[1], "base64");
}

function extractTextFromUpload(name, mimeType, bytes) {
  const lower = name.toLowerCase();
  const textLike = mimeType.startsWith("text/")
    || /\.(md|markdown|txt|json|jsonl|csv|tsv|yaml|yml|xml|html|css|js|mjs|ts|tsx)$/i.test(lower);
  if (!textLike) {
    return "";
  }

  const text = bytes.toString("utf8").replace(/^\uFEFF/, "").trim();
  if (!text || text.includes("\u0000")) {
    return "";
  }
  return text.slice(0, 24000);
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
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

async function setExecutionMode(mode) {
  const allowed = new Set(["api", "agent"]);
  if (!allowed.has(mode)) {
    throw new Error(`Invalid execution mode: ${mode}`);
  }

  const config = await readJsonFile("config/methods.json");
  config.execution_mode = mode;
  await writeJsonFile("config/methods.json", config);
  return { ok: true, execution_mode: mode };
}

async function setAnalysisPersona(personaName) {
  const config = await readJsonFile("config/methods.json");
  if (!config.personas?.[personaName]) {
    throw new Error(`Invalid analysis persona: ${personaName}`);
  }

  config.analysis_persona = personaName;
  for (const [key, persona] of Object.entries(config.personas)) {
    persona.status = key === personaName ? "active" : "reserved";
  }
  await writeJsonFile("config/methods.json", config);
  return { ok: true, analysis_persona: personaName };
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
