import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getChangedFiles, isSourceIndexFile, joinRepo, pathExists } from "./incremental_common.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const changedSourceFiles = getChangedFiles(root).filter(isSourceIndexFile);
const sourceIndexExists = await pathExists(joinRepo(root, "11_indexes/source-index.json"));
const sampleIndexExists = await pathExists(joinRepo(root, "11_indexes/sample-index.json"));

if (!changedSourceFiles.length && sourceIndexExists && sampleIndexExists) {
  console.log("OK incremental index skipped: no source artifact changes");
  process.exit(0);
}

console.log(`Incremental index fallback: ${changedSourceFiles.length} source artifact change(s); rebuilding canonical index`);
const result = spawnSync(process.execPath, ["scripts/rebuild_index.mjs"], {
  cwd: root,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
