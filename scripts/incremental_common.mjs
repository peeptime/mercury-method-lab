import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join, relative } from "node:path";

export async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function toRepoPath(root, path) {
  return relative(root, path).replaceAll("\\", "/");
}

export function getChangedFiles(root) {
  const tracked = runGit(root, ["diff", "--name-only", "HEAD"]);
  const untracked = runGit(root, ["ls-files", "--others", "--exclude-standard"]);
  const files = new Set();
  for (const output of [tracked.stdout, untracked.stdout]) {
    for (const line of output.split(/\r?\n/)) {
      const file = line.trim().replaceAll("\\", "/");
      if (file) files.add(file);
    }
  }
  return [...files].sort();
}

export function runGit(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result;
}

export function isTextLike(file) {
  return /\.(md|yaml|yml|json|mjs|ps1|sh|example)$/i.test(file);
}

export function isSourceIndexFile(file) {
  return /^(00_inbox|00_raw|01_segmented|02_cleaned|03_uncertain|04_memory_candidates|05_decision_logs|06_action_plans|07_audit_reports|examples|10_exports)\//.test(file);
}

export function joinRepo(root, file) {
  return join(root, ...file.split("/"));
}
