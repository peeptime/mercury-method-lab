import { mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { captureFile } from "./capture_ai_conversation.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = "dist/capture-check";

await rm(join(root, ...outputDir.split("/")), { recursive: true, force: true });
await mkdir(join(root, ...outputDir.split("/")), { recursive: true });

const result = await captureFile("examples/ai-conversation-capture.md", {
  outputDir,
  sourceLabel: "capture_check_fixture"
});

const savedResult = JSON.parse(await readFile(join(root, ...result.result.split("/")), "utf8"));
const packetText = await readFile(join(root, ...result.packet.split("/")), "utf8");

check("capture produced packet YAML", packetText.includes("sample_type:"));
check("capture keeps human_reviewed declined", packetText.includes('human_reviewed: "declined"'));
check("capture has source ref", packetText.includes("source_refs:"));
check("capture does not grant audit refs", packetText.includes("audit_refs: []"));
check("capture routes high-risk AI claim to quarantine", savedResult.result.routing_decision === "quarantine");
check("capture records unsafe memory write", savedResult.result.blockers.some((blocker) => blocker.id === "unsafe_memory_write"));

console.log(`OK capture check wrote ${result.packet}`);

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL ${name}`);
    process.exit(1);
  }
  console.log(`OK ${name}`);
}
