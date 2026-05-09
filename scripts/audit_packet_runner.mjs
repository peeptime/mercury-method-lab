import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPackets } from "./audit-core/audit_rules.mjs";
import { readAuditPackets } from "./audit-core/packet_io.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = parseArgs(process.argv.slice(2));
const input = args.input || "examples/audit-packets";
const output = args.output || "dist/audit-results.json";

const packets = await readAuditPackets(root, input);
const audit = auditPackets(packets);
const outputPath = join(root, ...output.split("/"));

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

console.log(`Audited ${audit.summary.total} packet(s)`);
console.log(`accept=${audit.summary.accept} revise=${audit.summary.revise} quarantine=${audit.summary.quarantine} discard=${audit.summary.discard}`);
console.log(`human_review_required=${audit.summary.human_review_required}`);
console.log(`Wrote ${output}`);

for (const result of audit.results) {
  const blockerText = result.blockers.map((blocker) => blocker.id).join(", ") || "none";
  console.log(`- ${result.packet_id}: ${result.routing_decision} (${blockerText})`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      parsed.input = argv[index + 1];
      index += 1;
    } else if (arg === "--output") {
      parsed.output = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}
