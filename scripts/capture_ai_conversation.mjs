import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPacket } from "./audit-core/audit_rules.mjs";
import { readKnownPaths } from "./audit-core/packet_io.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const defaultDropzone = "00_inbox/ai-conversations";
const defaultOutput = "dist/captures";

export async function captureText(text, options = {}) {
  assertHasText(text);
  const sourceLabel = options.sourceLabel || "pasted-ai-output";
  const title = options.title || titleFromText(text) || sourceLabel;
  const id = captureId(title, text);
  const sourceRelPath = await writeSourceText(id, title, text, options);
  return writeCapture({ id, title, text, sourceRelPath, sourceKind: sourceLabel }, options);
}

export async function captureFile(filePath, options = {}) {
  const absPath = resolve(root, filePath);
  const text = await readFile(absPath, "utf8");
  assertHasText(text);
  const title = options.title || basename(filePath, extname(filePath));
  const id = captureId(title, text);
  const sourceRelPath = isInsideRoot(absPath) && !options.copyToInbox
    ? relative(root, absPath).replaceAll("\\", "/")
    : await writeSourceText(id, title, text, options);
  return writeCapture({ id, title, text, sourceRelPath, sourceKind: options.sourceLabel || "ai_conversation_file" }, options);
}

export async function captureDropzone(options = {}) {
  const dropzone = options.dropzone || defaultDropzone;
  const absDropzone = join(root, ...dropzone.split("/"));
  await mkdir(absDropzone, { recursive: true });
  const entries = await readdir(absDropzone, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && /\.(md|txt)$/i.test(entry.name))
    .map((entry) => join(absDropzone, entry.name));
  const results = [];
  for (const file of files) {
    results.push(await captureFile(file, { ...options, copyToInbox: false, sourceLabel: "dropzone_ai_conversation" }));
  }
  return results;
}

async function writeCapture({ id, title, text, sourceRelPath, sourceKind }, options = {}) {
  const outputDir = options.outputDir || defaultOutput;
  const absOutput = join(root, ...outputDir.split("/"));
  const packetRelPath = `${outputDir}/audit-packets/${id}.yaml`;
  const resultRelPath = `${outputDir}/results/${id}.json`;
  const recordRelPath = `${outputDir}/records/${id}.json`;
  const packet = buildPacket({ id, title, text, sourceRelPath, sourceKind });
  const knownPaths = await readKnownPaths(root);
  const result = auditPacket({ ...packet, __path: packetRelPath }, { knownPaths });

  await Promise.all([
    mkdir(join(absOutput, "audit-packets"), { recursive: true }),
    mkdir(join(absOutput, "results"), { recursive: true }),
    mkdir(join(absOutput, "records"), { recursive: true })
  ]);

  await Promise.all([
    writeFile(join(root, ...packetRelPath.split("/")), toYaml(packet), "utf8"),
    writeFile(join(root, ...resultRelPath.split("/")), `${JSON.stringify({ ok: true, result }, null, 2)}\n`, "utf8"),
    writeFile(join(root, ...recordRelPath.split("/")), `${JSON.stringify({
      id,
      title,
      source_kind: sourceKind,
      source_ref: sourceRelPath,
      packet: packetRelPath,
      result: resultRelPath,
      created_at: packet.created_at,
      provenance: packet.provenance
    }, null, 2)}\n`, "utf8")
  ]);

  return { ok: true, id, title, source_ref: sourceRelPath, packet: packetRelPath, result: resultRelPath, audit: result };
}

function buildPacket({ id, title, text, sourceRelPath, sourceKind }) {
  return {
    id,
    title: `AI conversation capture: ${title}`,
    type: "memory_candidate",
    sample_type: "captured_ai_conversation",
    claim: titleFromText(text) || "Captured AI output pending review.",
    source_refs: sourceRelPath ? [sourceRelPath] : [],
    audit_refs: [],
    context: {
      summary: "Captured from an AI conversation or agent output. This is source material, not approved durable memory.",
      source_kind: sourceKind,
      capture_rule: "Capture preserves source evidence but intentionally does not grant audit approval."
    },
    risk_level: "high",
    expected_decision: "quarantine",
    expected_blockers: ["missing_audit_refs", "unsafe_memory_write"],
    provenance: {
      ai_assisted: true,
      human_reviewed: "declined",
      audit_ref: "scripts/capture_ai_conversation.mjs"
    },
    created_at: new Date().toISOString()
  };
}

async function writeSourceText(id, title, text, options = {}) {
  const sourceDir = options.sourceDir || defaultDropzone;
  const relPath = `${sourceDir}/${id}.md`;
  const absPath = join(root, ...relPath.split("/"));
  await mkdir(dirname(absPath), { recursive: true });
  await writeFile(absPath, `# ${title}\n\n${text.trim()}\n`, "utf8");
  return relPath;
}

function assertHasText(text) {
  if (!String(text || "").trim()) {
    throw new Error("Capture input is empty. Paste text, pass --text, or provide a non-empty .md/.txt file.");
  }
}

function toYaml(packet) {
  const lines = [];
  writeObject(lines, packet, 0);
  return `${lines.join("\n")}\n`;
}

function writeObject(lines, object, indent) {
  const pad = " ".repeat(indent);
  for (const [key, value] of Object.entries(object)) {
    if (Array.isArray(value)) {
      if (!value.length) {
        lines.push(`${pad}${key}: []`);
      } else {
        lines.push(`${pad}${key}:`);
        for (const item of value) lines.push(`${pad}  - ${quoteScalar(item)}`);
      }
    } else if (value && typeof value === "object") {
      lines.push(`${pad}${key}:`);
      writeObject(lines, value, indent + 2);
    } else {
      lines.push(`${pad}${key}: ${quoteScalar(value)}`);
    }
  }
}

function quoteScalar(value) {
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (value === null || value === undefined) return "null";
  return JSON.stringify(String(value));
}

function captureId(title, text) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
  const slug = slugify(title || "ai-conversation");
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 8);
  return `capture_${stamp}_${slug}_${hash}`;
}

function titleFromText(text) {
  const line = String(text || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find(Boolean) || "";
  return line.slice(0, 180);
}

function slugify(value) {
  return String(value || "capture")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "capture";
}

function isInsideRoot(absPath) {
  const rel = relative(root, absPath);
  return Boolean(rel) && !rel.startsWith("..") && !isAbsolute(rel);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (["watch", "copy-to-inbox", "check"].includes(key)) {
        args[key] = true;
      } else {
        args[key] = argv[index + 1];
        index += 1;
      }
    } else {
      args._.push(arg);
    }
  }
  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const options = {
    outputDir: args.output || defaultOutput,
    sourceDir: args["source-dir"] || defaultDropzone,
    dropzone: args.dropzone || defaultDropzone,
    copyToInbox: Boolean(args["copy-to-inbox"]),
    sourceLabel: args.source || ""
  };

  if (args.watch) {
    await mkdir(join(root, ...options.dropzone.split("/")), { recursive: true });
    console.log(`Watching ${options.dropzone} for .md/.txt AI conversation captures...`);
    await runDropzone(options);
    let timer = null;
    watch(join(root, ...options.dropzone.split("/")), () => {
      clearTimeout(timer);
      timer = setTimeout(() => runDropzone(options).catch((error) => console.error(error.message)), 250);
    });
    await new Promise(() => {});
    return;
  }

  if (args.dropzone) {
    await runDropzone(options);
    return;
  }

  const inputFile = args.file || args._[0];
  const result = inputFile
    ? await captureFile(inputFile, options)
    : await captureText(args.text || await readStdin(), { ...options, sourceLabel: options.sourceLabel || "stdin" });
  printResult(result);
}

async function runDropzone(options) {
  const results = await captureDropzone(options);
  if (!results.length) {
    console.log(`No .md/.txt captures found in ${options.dropzone}.`);
    return;
  }
  for (const result of results) printResult(result);
}

function printResult(result) {
  const blockers = result.audit.blockers.map((blocker) => blocker.id).join(", ") || "none";
  console.log(`${result.id}: ${result.audit.routing_decision} (${blockers})`);
  console.log(`source=${result.source_ref}`);
  console.log(`packet=${result.packet}`);
  console.log(`result=${result.result}`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
