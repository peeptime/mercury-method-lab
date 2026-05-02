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

const now = new Date();
const date = now.toISOString().slice(0, 10);
const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "z").toLowerCase();
const source = await readInput(args);
const title = args.title || inferTitle(source);
const slug = slugify(args.slug || title);
const id = `${stamp}-${slug}`;
const reviewAt = date;

const methodDocs = await loadActiveMethodDocs();
const modelConfig = await loadModelConfig();
const rawPath = join(root, "00_raw", `${date}-${id}.md`);
const segmentedPath = join(root, "01_segmented", `${date}-${id}-v8-analysis.md`);
const auditPath = join(root, "07_audit_reports", `${date}-${id}-v8-audit.md`);

await mkdir(dirname(rawPath), { recursive: true });
await mkdir(dirname(segmentedPath), { recursive: true });
await mkdir(dirname(auditPath), { recursive: true });

await writeFile(rawPath, renderRawArtifact({ title, source, now, reviewAt, id }), "utf8");

const rawAnalysis = await runV8Analysis({ title, source, methodDocs, modelConfig, rawPath });
const rawCompleteness = assessV8Completeness(rawAnalysis);
const analysis = normalizeAnalysisMarkdown(rawAnalysis, rawCompleteness.missing);
const completeness = {
  ...assessV8Completeness(analysis),
  autoFilled: rawCompleteness.missing
};

await writeFile(
  segmentedPath,
  renderSegmentedArtifact({ title, source, analysis, completeness, now, reviewAt, id, rawPath, modelConfig }),
  "utf8"
);

const audit = normalizeAuditMarkdown(await runV8Audit({ title, source, analysis, completeness, modelConfig, rawPath, segmentedPath }));
await writeFile(
  auditPath,
  renderAuditArtifact({ title, source, audit, completeness, now, reviewAt, id, rawPath, segmentedPath, modelConfig }),
  "utf8"
);

let indexResult = { ok: false, skipped: true, message: "skipped by --no-index" };
if (!args.noIndex) {
  indexResult = rebuildIndex();
}

const output = {
  ok: true,
  provider: modelConfig.providerName,
  model: modelConfig.model,
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
    noIndex: false,
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--text") {
      result.text = argv[++i] || "";
    } else if (arg === "--file") {
      result.file = argv[++i] || "";
    } else if (arg === "--title") {
      result.title = argv[++i] || "";
    } else if (arg === "--slug") {
      result.slug = argv[++i] || "";
    } else if (arg === "--provider") {
      result.provider = argv[++i] || "";
    } else if (arg === "--no-index") {
      result.noIndex = true;
    } else if (!arg.startsWith("-") && !result.file && !result.text) {
      result.file = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

function printUsage() {
  console.log([
    "Usage:",
    "  npm run v8:analyze -- --text \"原始材料\" --title \"标题\"",
    "  npm run v8:analyze -- --file path/to/input.md --title \"标题\"",
    "",
    "Options:",
    "  --provider <name>  Override config/model-providers.json active provider.",
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

async function loadActiveMethodDocs() {
  const config = JSON.parse(await readFile(methodsPath, "utf8"));
  const active = config.methods?.[config.active_method];
  if (!active) {
    throw new Error(`Unknown active method: ${config.active_method}`);
  }

  const docs = [];
  for (const docPath of active.primary_docs || []) {
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
    throw new Error(`No readable method docs for active method ${config.active_method}`);
  }

  return docs;
}

async function runV8Analysis({ title, source, methodDocs, modelConfig, rawPath }) {
  const methodText = methodDocs.map((doc) => [
    `# Method doc: ${rel(doc.path)}`,
    doc.text.trim()
  ].join("\n\n")).join("\n\n---\n\n");

  const messages = [
    {
      role: "system",
      content: [
        "You are Mercury Lab's deterministic V8.0 execution adapter.",
        "Use the provided V8.0 method documents as the operating template.",
        "Do not ask follow-up questions. Do not mention that you are an AI model.",
        "Do not invent external facts. Mark assumptions, missing evidence, and verification gaps explicitly.",
        "Output Markdown only.",
        "The output must include these sections exactly once: 第 0 层：语义嗅探与分流, 第一层：输入层, 第二层：结构定位, 第三层：权力分析, 第四层：杠杆点识别, 第五层：路径判断, 第六层：系统影响, 第七层：对抗性交叉验证, 评分, 审计, 最终结论, 后续建议."
      ].join("\n")
    },
    {
      role: "user",
      content: [
        "## V8.0 Method Documents",
        methodText,
        "",
        "## Mercury Lab Execution Contract",
        `- title: ${title}`,
        `- raw_artifact: ${rel(rawPath)}`,
        `- source_ref: ${source.ref}`,
        "- write a structured V8.0 analysis suitable for 01_segmented/.",
        "- include explicit audit notes; do not leave the audit to the caller.",
        "",
        "## Input Material",
        source.text
      ].join("\n")
    }
  ];

  return callChat(modelConfig, messages, 0.2);
}

async function runV8Audit({ title, source, analysis, completeness, modelConfig, rawPath, segmentedPath }) {
  const messages = [
    {
      role: "system",
      content: [
        "You are Mercury Lab's red-team audit adapter.",
        "Audit the V8.0 analysis against the original input and the deterministic completeness check.",
        "Do not rewrite the analysis. Identify risk, missing assumptions, overclaims, and whether the result can proceed.",
        "Output Markdown only.",
        "You must include these headings exactly: ## 被审计结论, ## 关键假设, ## 最可能错误点, ## 对抗性交叉验证, ## 审计结论, ## 下一步."
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
        "",
        "## Deterministic completeness check",
        JSON.stringify(completeness, null, 2),
        "",
        "## Original input",
        source.text,
        "",
        "## V8.0 analysis to audit",
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

function renderRawArtifact({ title, source, now, reviewAt, id }) {
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
- method: v8
- automation: scripts/run_v8_analysis.mjs

## Original Submission

${source.text}
`;
}

function renderSegmentedArtifact({ title, source, analysis, completeness, now, reviewAt, id, rawPath, modelConfig }) {
  return `# Mercury Lab V8.0 分析：${title}

## Artifact Metadata

- schema_version: 0.1
- id: segmented-${id}
- type: segmented
- status: review_ready
- owner_role: auditor
- source_refs: ${rel(rawPath)}
- created_at: ${now.toISOString()}
- review_at: ${reviewAt}
- method: v8
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

function renderAuditArtifact({ title, source, audit, completeness, now, reviewAt, id, rawPath, segmentedPath, modelConfig }) {
  return `# Mercury Lab V8.0 审计：${title}

## Artifact Metadata

- schema_version: 0.1
- id: audit-${id}
- type: audit_report
- status: review_ready
- owner_role: auditor
- source_refs: ${rel(segmentedPath)}
- created_at: ${now.toISOString()}
- review_at: ${reviewAt}
- method: v8-redteam
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
    "后续建议"
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

## 自动补全的 V8.0 结构

以下章节由脚本补齐，说明分析模型没有完整遵守输出契约，需在审计中复核。

${missing.map((section) => `## ${section}\n\n未返回，需人工复核。`).join("\n\n")}
`;
}

function normalizeAuditMarkdown(text) {
  const required = [
    "## 被审计结论",
    "## 关键假设",
    "## 最可能错误点",
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
