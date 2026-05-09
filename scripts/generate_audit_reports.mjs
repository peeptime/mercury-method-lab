import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditPackets } from "./audit-core/audit_rules.mjs";
import { readAuditPackets } from "./audit-core/packet_io.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packets = await readAuditPackets(root, "examples/audit-packets");
const audit = auditPackets(packets);
const reportsDir = join(root, "dist", "reports");

await mkdir(reportsDir, { recursive: true });

for (const result of audit.results) {
  await writeFile(
    join(reportsDir, `${safeFileName(result.packet_id)}.html`),
    renderReport(result),
    "utf8"
  );
}

await writeFile(join(reportsDir, "index.html"), renderIndex(audit), "utf8");

console.log(`Generated ${audit.results.length + 1} HTML report file(s)`);
console.log("Wrote dist/reports/index.html");

function renderIndex(auditResult) {
  const cards = auditResult.results.map((result) => `
    <a class="card" href="./${safeFileName(result.packet_id)}.html">
      <span class="badge ${result.routing_decision}">${escapeHtml(result.routing_decision)}</span>
      <strong>${escapeHtml(result.packet_title)}</strong>
      <small>${escapeHtml(result.packet_id)} · ${escapeHtml(result.type)}</small>
      <span>${escapeHtml(result.blockers.map((blocker) => blocker.id).join(", ") || "no blockers")}</span>
    </a>
  `).join("\n");

  return page("Audit Packet Reports", `
    <section class="hero">
      <p class="eyebrow">Mercury Method Lab</p>
      <h1>Audit Packet Reports</h1>
      <p>Evidence-first review of AI-generated memory, agent outputs, and delivery artifacts before durable use.</p>
      <div class="summary">
        <span>accept <b>${auditResult.summary.accept}</b></span>
        <span>revise <b>${auditResult.summary.revise}</b></span>
        <span>quarantine <b>${auditResult.summary.quarantine}</b></span>
        <span>discard <b>${auditResult.summary.discard}</b></span>
      </div>
    </section>
    <main class="grid">${cards}</main>
  `);
}

function renderReport(result) {
  return page(result.packet_title, `
    <section class="hero">
      <p class="eyebrow">Audit Packet</p>
      <h1>${escapeHtml(result.packet_title)}</h1>
      <span class="badge ${result.routing_decision}">${escapeHtml(result.routing_decision)}</span>
    </section>
    <main>
      ${panel("Claim", `<p>${escapeHtml(result.claim)}</p>`)}
      ${panel("Evidence", listSection("Source refs", result.source_refs) + listSection("Audit refs", result.audit_refs))}
      ${panel("Blockers", blockerList(result.blockers))}
      ${panel("Required Fixes", listSection("Fixes", result.required_fixes))}
      ${panel("Human Review", `
        <dl>
          <dt>Required</dt><dd>${result.human_review_required ? "yes" : "no"}</dd>
          <dt>Structural confidence</dt><dd>${escapeHtml(result.confidence)}</dd>
          <dt>Packet path</dt><dd>${escapeHtml(result.packet_path)}</dd>
        </dl>
      `)}
    </main>
  `);
}

function panel(title, body) {
  return `<section class="panel"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function blockerList(blockers) {
  if (!blockers.length) return "<p>No blockers triggered.</p>";
  return `<ul>${blockers.map((blocker) => `
    <li><strong>${escapeHtml(blocker.id)}</strong> <span class="severity">${escapeHtml(blocker.severity)}</span><br>${escapeHtml(blocker.message)}</li>
  `).join("")}</ul>`;
}

function listSection(label, values) {
  if (!values.length) return `<h3>${escapeHtml(label)}</h3><p class="empty">None</p>`;
  return `<h3>${escapeHtml(label)}</h3><ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #182026;
      --muted: #63707a;
      --line: #d9e0e6;
      --paper: #f7f8f9;
      --panel: #ffffff;
      --accept: #1f7a4d;
      --revise: #8a5a00;
      --quarantine: #94511f;
      --discard: #a33434;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: Arial, "Helvetica Neue", sans-serif;
      line-height: 1.55;
    }
    .hero, main {
      width: min(1040px, calc(100vw - 32px));
      margin: 0 auto;
    }
    .hero {
      padding: 44px 0 24px;
      border-bottom: 1px solid var(--line);
    }
    .eyebrow {
      margin: 0 0 8px;
      color: var(--muted);
      font-size: 13px;
      text-transform: uppercase;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 34px;
      line-height: 1.15;
      letter-spacing: 0;
    }
    h2 { margin: 0 0 12px; font-size: 19px; letter-spacing: 0; }
    h3 { margin: 12px 0 6px; font-size: 14px; letter-spacing: 0; color: var(--muted); }
    main { padding: 24px 0 48px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }
    .card, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(20, 30, 40, 0.04);
    }
    .card {
      display: grid;
      gap: 8px;
      padding: 16px;
      color: inherit;
      text-decoration: none;
    }
    .panel { padding: 20px; margin-bottom: 12px; }
    .badge {
      display: inline-flex;
      width: fit-content;
      padding: 4px 9px;
      border-radius: 999px;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .accept { background: var(--accept); }
    .revise { background: var(--revise); }
    .quarantine { background: var(--quarantine); }
    .discard { background: var(--discard); }
    .summary { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .summary span {
      padding: 8px 10px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    ul { padding-left: 20px; }
    li { margin: 6px 0; }
    dl { display: grid; grid-template-columns: 180px 1fr; gap: 8px 12px; margin: 0; }
    dt { color: var(--muted); }
    dd { margin: 0; }
    .severity, .empty, small { color: var(--muted); }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function safeFileName(value) {
  return String(value || "packet").replace(/[^A-Za-z0-9_-]+/g, "-");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
