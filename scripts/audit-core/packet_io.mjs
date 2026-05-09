import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

export async function readAuditPackets(root, inputPath = "examples/audit-packets") {
  const absInput = join(root, ...inputPath.split("/"));
  const entries = await readdir(absInput, { withFileTypes: true });
  const packets = [];

  for (const entry of entries) {
    if (!entry.isFile() || !/\.ya?ml$/i.test(entry.name)) {
      continue;
    }
    const absPath = join(absInput, entry.name);
    const text = await readFile(absPath, "utf8");
    const packet = parseSimpleYaml(text);
    packet.__path = relative(root, absPath).replaceAll("\\", "/");
    packets.push(packet);
  }

  return packets.sort((left, right) => String(left.id).localeCompare(String(right.id)));
}

export function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, value: root }];

  for (const rawLine of text.split(/\r?\n/)) {
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
      const nextLine = peekNextMeaningfulLine(text, rawLine);
      const value = nextLine?.trimStart().startsWith("- ") ? [] : {};
      current[key] = value;
      stack.push({ indent, value });
    } else {
      current[key] = parseScalar(rawValue);
    }
  }

  return root;
}

function peekNextMeaningfulLine(text, currentLine) {
  const lines = text.split(/\r?\n/);
  const index = lines.indexOf(currentLine);
  for (const line of lines.slice(index + 1)) {
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
