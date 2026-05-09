import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPackets } from "./audit-core/audit_rules.mjs";
import { readAuditPackets, readKnownPaths } from "./audit-core/packet_io.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const iterations = Number.parseInt(process.argv.find((arg) => arg.startsWith("--iterations="))?.split("=")[1] || "10", 10);
const timings = [];

for (let index = 0; index < iterations; index += 1) {
  const start = performance.now();
  const [packets, knownPaths] = await Promise.all([
    readAuditPackets(root),
    readKnownPaths(root)
  ]);
  const audit = auditPackets(packets, { knownPaths });
  timings.push(performance.now() - start);
  if (index === 0) {
    console.log(`packets=${audit.summary.total} decisions=accept:${audit.summary.accept},revise:${audit.summary.revise},quarantine:${audit.summary.quarantine},discard:${audit.summary.discard}`);
  }
}

const sorted = [...timings].sort((left, right) => left - right);
const total = timings.reduce((sum, value) => sum + value, 0);
const average = total / timings.length;
const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];

console.log(`iterations=${iterations}`);
console.log(`avg_ms=${average.toFixed(2)}`);
console.log(`min_ms=${sorted[0].toFixed(2)}`);
console.log(`p95_ms=${p95.toFixed(2)}`);
