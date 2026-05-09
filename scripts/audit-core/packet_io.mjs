import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const excludedDirs = new Set([".git", "node_modules", "dist", "coverage", ".cache", ".npm-cache"]);

export async function readAuditPackets(root, inputPath = "examples/audit-packets") {
  const absInput = join(root, ...inputPath.split("/"));
  const entries = await readdir(absInput, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .map((entry) => join(absInput, entry.name));

  const packets = await Promise.all(files.map(async (absPath) => {
    const [text, fileStat] = await Promise.all([
      readFile(absPath, "utf8"),
      stat(absPath)
    ]);
    const packet = parseSimpleYaml(text);
    packet.__path = relative(root, absPath).replaceAll("\\", "/");
    packet.__size_bytes = fileStat.size;
    packet.__mtime = fileStat.mtime.toISOString();
    packet.__hash = createHash("sha256").update(text).digest("hex");
    return packet;
  }));

  return packets.sort((left, right) => String(left.id).localeCompare(String(right.id)));
}

export async function readKnownPaths(root) {
  const gitPaths = readKnownPathsFromGit(root);
  if (gitPaths) {
    return gitPaths;
  }
  const files = await listFiles(root);
  return new Set(files.map((file) => relative(root, file).replaceAll("\\", "/")));
}

export function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.replace(/\s+#.*$/, "");
    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    while (stack.length > 1 && indent <= stack.at(-1).indent) {
      stack.pop();
    }

    const current = stack.at(-1).value;
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      if (!Array.isArray(current)) {
        throw new Error(`YAML list item has no list parent: ${rawLine}`);
      }
      current.push(parseScalar(trimmed.slice(2).trim()));
      continue;
    }

    const match = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (rawValue === "") {
      const nextLine = peekNextMeaningfulLine(lines, index);
      const value = nextLine?.trimStart().startsWith("- ") ? [] : {};
      current[key] = value;
      stack.push({ indent, value });
    } else {
      current[key] = parseScalar(rawValue);
    }
  }

  return root;
}

function peekNextMeaningfulLine(lines, currentIndex) {
  for (const line of lines.slice(currentIndex + 1)) {
    if (line.trim() && !line.trimStart().startsWith("#")) {
      return line;
    }
  }
  return "";
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "[]") return [];
  if (trimmed === "{}") return {};
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => unquote(item.trim()))
      .filter(Boolean);
  }
  return unquote(trimmed);
}

function unquote(value) {
  return value.replace(/^["']|["']$/g, "");
}

function readKnownPathsFromGit(root) {
  const result = spawnSync(
    "git",
    ["-c", "core.quotePath=false", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf8" }
  );
  if (result.status !== 0) {
    return null;
  }
  return new Set(result.stdout.split("\0").filter(Boolean));
}

async function listFiles(dir) {
  const output = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return output;
  }

  await Promise.all(entries.map(async (entry) => {
    if (excludedDirs.has(entry.name)) {
      return;
    }
    const absPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...await listFiles(absPath));
    } else if (entry.isFile()) {
      output.push(absPath);
    }
  }));

  return output;
}
