import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

if (!existsSync(join(root, ".git"))) {
  process.exit(0);
}

const result = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
  cwd: root,
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Git hooks path set to .githooks");
