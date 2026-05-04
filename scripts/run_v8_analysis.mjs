import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadModelConfig } from "./model_config.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const methodsPath = join(root, "config", "methods.json");

const args = parseArgs(process.argv.slice(2));

if (args.provider) {
  process.env.MERCURY_MODEL_PROVIDER = args.provider;
}

if (args.help || (!args.text && !args.file)) {
  printUsage();
  process.exit(args.help ? 0 : 1);
}

const methodsConfig = await loadMethodsConfig();
const executionMode = normalizeExecutionMode(args.mode || methodsConfig.execution_mode || "api");

const now = new Date();
const date = now.toISOString().slice(0, 10);
const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "z").toLowerCase();
const source = await readInput(args);
const title = args.title || inferTitle(source);
const slug = slugify(args.slug || title);
const id = `${stamp}-${slug}`;
const reviewAt = date;

const methodProfile = await loadMethodProfile(methodsConfig, args.persona);
const rawPath = join(root, "00_raw", `${date}-${id}.md`);
const segmentedPath = join(root, "01_segmented", `${date}-${id}-v8-analysis.md`);
const auditPath = join(root, "07_audit_reports", `${date}-${id}-v8-audit.md`);
const agentQueuePath = join(root, "submissions", "agent-queue", `${date}-${id}-v8-agent-task.json`);

await mkdir(dirname(rawPath), { recursive: true });
await mkdir(dirname(segmentedPath), { recursive: true });
await mkdir(dirname(auditPath), { recursive: true });
await mkdir(dirname(agentQueuePath), { recursive: true });

await writeFile(rawPath, renderRawArtifact({ title, source, methodProfile, executionMode, now, reviewAt, id }), "utf8");

if (executionMode === "agent") {
  await writeFile(
    agentQueuePath,
    `${JSON.stringify(renderAgentQueueEnvelope({ title, source, methodProfile, methodsConfig, now, reviewAt, id, rawPath, segmentedPath, auditPath }), null, 2)}\n`,
    "utf8"
  );

  let indexResult = { ok: false, skipped: true, message: "skipped by --no-index" };
  if (!args.noIndex) {
    indexResult = rebuildIndex();
  }

  console.log(JSON.stringify({
    ok: true,
    execution_mode: executionMode,
    method: methodProfile.methodName,
    persona: methodProfile.personaName,
    raw: rel(rawPath),
    agent_queue: rel(agentQueuePath),
    segmented_target: rel(segmentedPath),
    audit_target: rel(auditPath),
    index: indexResult,
    next_action: "Agent mode selected: API calls were skipped. An agent-readable task envelope was written for analysis/audit completion."
  }, null, 2));
  process.exit(0);
}

const modelConfig = await loadModelConfig();

const rawAnalysis = await runV8Analysis({ title, source, methodProfile, modelConfig, rawPath });
const rawCompleteness = assessV8Completeness(rawAnalysis);
const analysis = normalizeAnalysisMarkdown(rawAnalysis, rawCompleteness.missing);
const completeness = {
  ...assessV8Completeness(analysis),
  autoFilled: rawCompleteness.missing
};

await writeFile(
  segmentedPath,
  renderSegmentedArtifact({ title, source, analysis, completeness, methodProfile, now, reviewAt, id, rawPath, modelConfig }),
  "utf8"
);

const audit = normalizeAuditMarkdown(await runV8Audit({ title, source, analysis, completeness, methodProfile, modelConfig, rawPath, segmentedPath }));
await writeFile(
  auditPath,
  renderAuditArtifact({ title, source, audit, completeness, methodProfile, now, reviewAt, id, rawPath, segmentedPath, modelConfig }),
  "utf8"
);

let indexResult = { ok: false, skipped: true, message: "skipped by --no-index" };
if (!args.noIndex) {
  indexResult = rebuildIndex();
}

const output = {
  ok: true,
  execution_mode: executionMode,
  provider: modelConfig.providerName,
  model: modelConfig.model,
  method: methodProfile.methodName,
  persona: methodProfile.personaName,
  raw: rel(rawPath),
  segmented: rel(segmentedPath),
  audit: rel(auditPath),
  completeness,
  index: indexResult
};

console.log(JSON.stringify(output, null, 2));

function parseArgs(argv) {
  const result = {
    text: "",
    file: "",
    title: "",
    slug: "",
    provider: "",
    persona: "",
    mode: "",
    noIndex: false,
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const [flag, inlineValue] = splitArg(arg);
    const readValue = () => inlineValue ?? argv[++i] ?? "";
    if (flag === "--help" || flag === "-h") {
      result.help = true;
    } else if (flag === "--text") {
      result.text = readValue();
    } else if (flag === "--file") {
      result.file = readValue();
    } else if (flag === "--title") {
      result.title = readValue();
    } else if (flag === "--slug") {
      result.slug = readValue();
    } else if (flag === "--provider") {
      result.provider = readValue();
    } else if (flag === "--persona" || flag === "-p") {
      result.persona = readValue();
    } else if (flag === "--mode" || flag === "--execution-mode") {
      result.mode = readValue();
    } else if (flag === "--no-index") {
      result.noIndex = true;
    } else if (!arg.startsWith("-") && !result.file && !result.text) {
      result.file = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

function splitArg(arg) {
  const index = arg.indexOf("=");
  if (!arg.startsWith("--") || index === -1) {
    return [arg, undefined];
  }
  return [arg.slice(0, index), arg.slice(index + 1)];
}

function printUsage() {
  console.log([
    "Usage:",
    "  npm run v8:analyze -- --text \"原始材料\" --title \"标题\"",
    "  npm run v8:analyze -- --file path/to/input.md --title \"标题\"",
    "",
    "Options:",
    "  --mode <api|agent> Override config/methods.json execution_mode for this run.",
    "  --provider <name>  Override config/model-providers.json active provider.",
    "  --persona <name>   Override config/methods.json analysis_persona for this run.",
    "  --slug <slug>      Override output filename slug.",
    "  --no-index         Skip rebuilding 11_indexes/source-index.json.",
    "",
    "Environment:",
    "  Uses MERCURY_MODEL_PROVIDER or config/model-providers.json active_provider.",
    "  Active Ark setup uses ARK_API_KEY and ARK_MODEL."
  ].join("\n"));
}

async function readInput(options) {
  if (options.file) {
    const filePath = resolve(process.cwd(), options.file);
    const text = await readFile(filePath, "utf8");
    return {
      kind: "file",
      ref: rel(filePath),
      filePath,
      text: text.trim()
    };
  }

  return {
    kind: "inline",
    ref: "cli:--text",
    filePath: "",
    text: options.text.trim()
  };
}

function inferTitle(source) {
  const heading = source.text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) {
    return heading;
  }

  if (source.filePath) {
    return basename(source.filePath, extname(source.filePath));
  }

  return source.text.split(/\r?\n/).find((line) => line.trim())?.slice(0, 48).trim() || "v8-input";
}

async function loadMethodsConfig() {
  try {
    return JSON.parse(await readFile(methodsPath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to parse config/methods.json: ${error.message}`);
  }
}

function normalizeExecutionMode(value) {
  const mode = String(value || "api").trim().toLowerCase();
  if (mode === "api" || mode === "agent") {
    return mode;
  }
  throw new Error(`Unknown execution_mode: ${value}. Expected "api" or "agent".`);
}

async function loadMethodProfile(config, personaOverride) {
  const methodName = config.active_method || "v8";
  const active = config.methods?.[methodName];
  if (!active) {
    throw new Error(`Unknown active method: ${config.active_method}`);
  }

  const personaName = personaOverride || config.analysis_persona || "v8.1-reality-sync";
  const persona = config.personas?.[personaName];
  if (personaOverride && !persona) {
    const available = Object.keys(config.personas || {}).sort().join(", ") || "none";
    throw new Error(`Unknown persona: ${personaOverride}. Available personas: ${available}`);
  }
  const docPaths = persona?.primary_docs?.length ? persona.primary_docs : active.primary_docs;
  const docs = [];
  for (const docPath of docPaths || []) {
    const absolutePath = resolve(root, docPath);
    try {
      docs.push({
        path: absolutePath,
        text: await readFile(absolutePath, "utf8")
      });
    } catch (error) {
      console.warn(`WARN skipped method doc ${docPath}: ${error.message}`);
    }
  }

  if (!docs.length) {
    throw new Error(`No readable method docs for method ${methodName} persona ${personaName}`);
  }

  return {
    methodName,
    method: active,
    personaName,
    persona: persona || {
      label: personaName,
      stance: "Legacy method persona inferred from active method primary_docs."
    },
    docs
  };
}

async function runV8Analysis({ title, source, methodProfile, modelConfig, rawPath }) {
  const methodText = methodProfile.docs.map((doc) => [
    `# Method doc: ${rel(doc.path)}`,
    doc.text.trim()
  ].join("\n\n")).join("\n\n---\n\n");

  const messages = [
    {
      role: "system",
      content: [
        "You are Mercury Lab's deterministic PSP execution adapter.",
        `Active method: ${methodProfile.methodName}.`,
        `Active analysis persona: ${methodProfile.personaName} (${methodProfile.persona.label || methodProfile.personaName}).`,
        `Persona stance: ${methodProfile.persona.stance || "Use the provided method document exactly."}`,
        "Do not merge competing PSP personas unless the active persona document explicitly asks for it.",
        "Use the provided active persona document as the operating template.",
        "Do not ask follow-up questions. Do not mention that you are an AI model.",
        "Do not invent external facts. Mark assumptions, missing evidence, and verification gaps explicitly.",
        "Output Markdown only.",
        "The output must include these sections exactly once: 第 0 层：语义嗅探与分流, 第一层：输入层, 第二层：结构定位, 第三层：权力分析, 第四层：杠杆点识别, 第五层：路径判断, 第六层：系统影响, 第七层：对抗性交叉验证, 评分, 审计, 最终结论, 后续建议, 停止条件, 推翻条件, 复盘时间, 记忆建议.",
        "The closing sections must prevent endless analysis: name the next verification action, stop condition, falsifying signal, review date/window, and memory level M0-M4."
      ].join("\n")
    },
    {
      role: "user",
      content: [
        "## Active PSP Persona Documents",
        methodText,
        "",
        "## Mercury Lab Execution Contract",
        `- title: ${title}`,
        `- raw_artifact: ${rel(rawPath)}`,
        `- source_ref: ${source.ref}`,
        `- method: ${methodProfile.methodName}`,
        `- analysis_persona: ${methodProfile.personaName}`,
        "- write a structured PSP analysis suitable for 01_segmented/.",
        "- include explicit audit notes; do not leave the audit to the caller.",
        "- close the judgment with 停止条件, 推翻条件, 复盘时间, and 记忆建议.",
        "- memory level must be one of M0, M1, M2, M3, M4.",
        "",
        "## Input Material",
        source.text
      ].join("\n")
    }
  ];

  return callChat(modelConfig, messages, 0.2);
}

async function runV8Audit({ title, source, analysis, completeness, methodProfile, modelConfig, rawPath, segmentedPath }) {
  const messages = [
    {
      role: "system",
      content: [
        "You are Mercury Lab's red-team audit adapter.",
        `Audit the PSP analysis against the original input, active persona ${methodProfile.personaName}, and the deterministic completeness check.`,
        "Do not rewrite the analysis. Identify risk, missing assumptions, overclaims, independent evidence gaps, stop-condition gaps, and memory-level risk.",
        "Output Markdown only.",
        "You must include these headings exactly: ## 被审计结论, ## 关键假设, ## 最可能错误点, ## 外部证据检查, ## 停止条件复核, ## 记忆建议复核, ## 对抗性交叉验证, ## 审计结论, ## 下一步."
      ].join("\n")
    },
    {
      role: "user",
      content: [
        `# Audit target: ${title}`,
        "",
        "## Paths",
        `- raw: ${rel(rawPath)}`,
        `- segmented: ${rel(segmentedPath)}`,
        `- source_ref: ${source.ref}`,
        `- method: ${methodProfile.methodName}`,
        `- analysis_persona: ${methodProfile.personaName}`,
        "",
        "## Deterministic completeness check",
        JSON.stringify(completeness, null, 2),
        "",
        "## Original input",
        source.text,
        "",
        "## PSP analysis to audit",
        analysis
      ].join("\n")
    }
  ];

  return callChat(modelConfig, messages, 0);
}

async function callChat(modelConfig, messages, temperature) {
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
      messages,
      temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("LLM returned an empty response");
  }

  return content;
}

function renderRawArtifact({ title, source, methodProfile, executionMode, now, reviewAt, id }) {
  return `# ${title}

## Artifact Metadata

- schema_version: 0.1
- id: raw-${id}
- type: raw
- status: draft
- owner_role: collector
- source_refs: ${source.ref}
- created_at: ${now.toISOString()}
- review_at: ${reviewAt}
- method: ${methodProfile.methodName}
- analysis_persona: ${methodProfile.personaName}
- execution_mode: ${executionMode}
- automation: scripts/run_v8_analysis.mjs

## Original Submission

${source.text}
`;
}

function renderAgentQueueEnvelope({ title, source, methodProfile, methodsConfig, now, reviewAt, id, rawPath, segmentedPath, auditPath }) {
  const requiredSections = getRequiredAnalysisSections();
  const contextPolicy = buildAgentContextPolicy({ methodsConfig, methodProfile, rawPath, segmentedPath, auditPath });
  return {
    schema_version: "0.1",
    task_type: "v8-agent-analysis",
    id: `agent-task-${id}`,
    status: "pending_agent_execution",
    context_mode: "closed_task_pack",
    created_at: now.toISOString(),
    review_at: reviewAt,
    method: methodProfile.methodName,
    analysis_persona: methodProfile.personaName,
    persona_label: methodProfile.persona.label || methodProfile.personaName,
    persona_stance: methodProfile.persona.stance || "",
    source_ref: source.ref,
    raw_artifact: rel(rawPath),
    source_text: source.text,
    requested_outputs: {
      segmented: rel(segmentedPath),
      audit: rel(auditPath),
      index: "11_indexes/source-index.json"
    },
    context_policy: contextPolicy,
    embedded_contract: {
      purpose: "Complete this task from the envelope and raw artifact. Avoid broad repository exploration.",
      method_boundary: "Use only the active analysis persona. Do not merge V8 personas unless this task explicitly asks for contrast.",
      output_language: "Markdown, Chinese preferred when input is Chinese.",
      required_analysis_sections: requiredSections,
      audit_required_headings: getRequiredAuditHeadings(),
      completion_rule: "Write segmented and audit artifacts, then run npm run index unless this task was generated with --no-index.",
      stop_rule: "If required context is missing from this envelope, read only the paths in context_policy.allowed_reads before asking for human review."
    },
    instructions: [
      "Start from this JSON envelope. Treat it as the complete task pack.",
      "Do not scan the repository, docs tree, historical artifacts, or indexes for background context.",
      "Read only context_policy.allowed_reads, and prefer source_text in this envelope over opening raw_artifact.",
      "Use the active persona summary in persona_stance. Open method_docs[0] only if the embedded contract is insufficient.",
      "Write the structured PSP analysis to requested_outputs.segmented.",
      "Write an audit report to requested_outputs.audit and state that it was generated in agent mode.",
      "Run npm run index after writing artifacts unless the caller passed --no-index.",
      "Do not call the model provider API from scripts/run_v8_analysis.mjs in agent mode."
    ],
    required_analysis_sections: requiredSections,
    method_docs: methodProfile.docs.map((doc) => rel(doc.path))
  };
}

function buildAgentContextPolicy({ methodsConfig, methodProfile, rawPath, segmentedPath, auditPath }) {
  const configured = methodsConfig.agent_context_policy || {};
  const allowedReads = [
    rel(rawPath),
    ...methodProfile.docs.slice(0, 1).map((doc) => rel(doc.path))
  ];
  return {
    mode: configured.mode || "closed_task_pack",
    max_project_files_to_read: configured.max_project_files_to_read ?? 3,
    allowed_reads: allowedReads,
    write_targets: [rel(segmentedPath), rel(auditPath)],
    read_order: [
      "this envelope source_text",
      rel(rawPath),
      ...methodProfile.docs.slice(0, 1).map((doc) => `${rel(doc.path)} only if embedded_contract is insufficient`)
    ],
    forbidden_globs: configured.forbidden_globs || [
      "00_raw/** except raw_artifact",
      "01_segmented/** except requested_outputs.segmented",
      "07_audit_reports/** except requested_outputs.audit",
      "11_indexes/**",
      ".git/**",
      "docs/** except listed method_docs"
    ],
    budget_note: "If you need more than these files, stop and request human review instead of exploring."
  };
}

function getRequiredAnalysisSections() {
  return [
    "第 0 层：语义嗅探与分流",
    "第一层：输入层",
    "第二层：结构定位",
    "第三层：权力分析",
    "第四层：杠杆点识别",
    "第五层：路径判断",
    "第六层：系统影响",
    "第七层：对抗性交叉验证",
    "评分",
    "审计",
    "最终结论",
    "后续建议",
    "停止条件",
    "推翻条件",
    "复盘时间",
    "记忆建议"
  ];
}

function getRequiredAuditHeadings() {
  return [
    "## 被审计结论",
    "## 关键假设",
    "## 最可能错误点",
    "## 外部证据检查",
    "## 停止条件复核",
    "## 记忆建议复核",
    "## 对抗性交叉验证",
    "## 审计结论",
    "## 下一步"
  ];
}

function renderSegmentedArtifact({ title, source, analysis, completeness, methodProfile, now, reviewAt, id, rawPath, modelConfig }) {
  return `# Mercury Lab PSP 分析：${title}

## Artifact Metadata

- schema_version: 0.1
- id: segmented-${id}
- type: segmented
- status: review_ready
- owner_role: auditor
- source_refs: ${rel(rawPath)}
- created_at: ${now.toISOString()}
- review_at: ${reviewAt}
- method: ${methodProfile.methodName}
- analysis_persona: ${methodProfile.personaName}
- automation: scripts/run_v8_analysis.mjs
- model_provider: ${modelConfig.providerName}
- model: ${modelConfig.model}
- source_input: ${source.ref}

## Deterministic Completeness Check

- ok: ${completeness.ok}
- present_sections: ${completeness.present.length}
- missing_sections: ${completeness.missing.length ? completeness.missing.join(", ") : "none"}
- auto_filled_sections: ${completeness.autoFilled?.length ? completeness.autoFilled.join(", ") : "none"}
- content_hash: ${sha256(analysis)}

---

${analysis}
`;
}

function renderAuditArtifact({ title, source, audit, completeness, methodProfile, now, reviewAt, id, rawPath, segmentedPath, modelConfig }) {
  return `# Mercury Lab PSP 审计：${title}

## Artifact Metadata

- schema_version: 0.1
- id: audit-${id}
- type: audit_report
- status: review_ready
- owner_role: auditor
- source_refs: ${rel(segmentedPath)}
- created_at: ${now.toISOString()}
- review_at: ${reviewAt}
- method: ${methodProfile.methodName}-redteam
- analysis_persona: ${methodProfile.personaName}
- automation: scripts/run_v8_analysis.mjs
- model_provider: ${modelConfig.providerName}
- model: ${modelConfig.model}
- raw_source: ${rel(rawPath)}
- source_input: ${source.ref}

## Deterministic Completeness Check

- ok: ${completeness.ok}
- present_sections: ${completeness.present.length}
- missing_sections: ${completeness.missing.length ? completeness.missing.join(", ") : "none"}
- auto_filled_sections: ${completeness.autoFilled?.length ? completeness.autoFilled.join(", ") : "none"}
- audit_hash: ${sha256(audit)}

${audit}
`;
}

function assessV8Completeness(text) {
  const required = [
    "第 0 层",
    "第一层",
    "第二层",
    "第三层",
    "第四层",
    "第五层",
    "第六层",
    "第七层",
    "评分",
    "审计",
    "最终结论",
    "后续建议",
    "停止条件",
    "推翻条件",
    "复盘时间",
    "记忆建议"
  ];
  const present = required.filter((section) => text.includes(section));
  const missing = required.filter((section) => !text.includes(section));
  return {
    ok: missing.length === 0,
    present,
    missing
  };
}

function normalizeAnalysisMarkdown(text, missing) {
  if (!missing.length) {
    return text;
  }

  return `${text.trim()}

## 自动补全的 PSP 结构

以下章节由脚本补齐，说明分析模型没有完整遵守输出契约，需在审计中复核。

${missing.map((section) => `## ${section}\n\n未返回，需人工复核。`).join("\n\n")}
`;
}

function normalizeAuditMarkdown(text) {
  const required = [
    "## 被审计结论",
    "## 关键假设",
    "## 最可能错误点",
    "## 外部证据检查",
    "## 停止条件复核",
    "## 记忆建议复核",
    "## 对抗性交叉验证",
    "## 审计结论",
    "## 下一步"
  ];
  const missing = required.filter((heading) => !text.includes(heading));
  if (!missing.length) {
    return text;
  }

  return `${text.trim()}

## 自动补全的审计结构

以下标题由脚本补齐，说明审计模型没有完整遵守输出契约，需人工复核。

${missing.map((heading) => `${heading}\n\n未返回，需人工复核。`).join("\n\n")}
`;
}

function rebuildIndex() {
  const result = spawnSync(process.execPath, [join(root, "scripts", "rebuild_index.mjs")], {
    cwd: root,
    encoding: "utf8"
  });

  return {
    ok: result.status === 0,
    skipped: false,
    exitCode: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}

function rel(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    || "v8-input";
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}
