# Mercury Method Lab

**It keeps smart thoughts from becoming clean but useless waste.**

Version: `2.0.0-alpha.3`

Latest release: [v2.0.0-alpha.3 Evidence Chain Interface](https://github.com/peeptime/mercury-method-lab/releases/tag/v2.0.0-alpha.3)

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: |
    Project-level provenance reflects the lowest-reviewed referenced component.
    Until referenced docs are human-reviewed, the project README cannot claim true.
  audit_ref: docs/REVIEW-LEDGER.md
```

---

## Evidence Chain Interface v2.0.0-alpha.3

Mercury now exposes the evidence-chain layer directly:

- SDK helper: `buildEvidenceChain()`
- Lite drag attach for `.md`, `.txt`, and `.json`
- A2A-compatible AgentCard and message/task/artifact fixture

```powershell
npm run test:evidence
npm run demo:a2a
npm run dashboard:check
```

See `src/mercury-audit/evidence-chain.mjs`, `docs/A2A-AGENT-CARD-BLUEPRINT.md`, and `examples/a2a/agent-card.json`.

---

## Real Case Foundation v2.0.0-alpha.2

Mercury now has a reproducible local case foundation and two small integration entry points:

```powershell
npm run cases:build
npm run cases:check
npm run demo:openclaw
npm run demo:starter
```

The case folders live under `cases/2026-05/` and keep `input.md`, `audit-result.json`, and `review-status.yaml` together. These are reproducible repository cases, not fake external charter users and not human-approved benchmark claims.

See `docs/REAL-CASES-SUMMARY.md`, `examples/integration-demo/openclaw-hook.mjs`, and `examples/starter-kit/README.md`.

---

## 2.0 Alpha Direction

Mercury 2.0 moves from an author-centered method repository toward a portable AI audit framework.

The controlling goal is:

```text
messy user material
  -> credible evidence chain
  -> source attribution and confidence basis
  -> missing-evidence choices
  -> durable case/review record
  -> portable output for humans, agents, and skills
```

`docs/ITERATION-STRATEGY-V2.md` is treated as lower-weight historical strategy input: Mercury keeps its diagnosis about real integrations, real cases, and review flywheels, but does not inherit unsupported hard-freeze restrictions.

See `docs/V2-PREFLIGHT-REQUIREMENTS.md` and `docs/V2-WORK-TRAIN.md`.

---

## One Sentence

Mercury Method Lab is an evidence-first audit layer for AI-generated memory, agent outputs, and FDE delivery artifacts.

It does not make agents do more work. It decides whether the work agents already produced deserves to be retained.

---

## Proof Governance v1.9.0

Mercury now has a second proof pack and governance controls for the cases most likely to break a portable audit framework:

- multi-agent memory contamination
- stale truth reused as current memory
- test-passing-but-wrong code claims
- chart and data overclaim
- human-review disagreement
- audit gaming attempts

The SDK also exposes anti-gaming detection and ruleset-version helpers so host systems can re-audit old accepted memories when the audit standard changes.

See `docs/PROOF-PACK-002.md`, `docs/RULE-VERSION-GOVERNANCE.md`, `docs/MEMORY-LIFECYCLE-GOVERNANCE.md`, `docs/HUMAN-REVIEW-DISAGREEMENT.md`, and `docs/ANTI-GAMING-TESTS.md`.

---

## Scenario Packs v1.8.0

Mercury now ships reusable scenario packs so teams can apply different evidence expectations to different domains:

- `ai-coding`
- `personal-knowledge`
- `investment-research`
- `enterprise-delivery`
- `legal-medical-risk`

SDK calls can pass `scenario` and receive scenario defaults plus plain-language review guidance.

See `docs/SCENARIO-PACKS.md`, `docs/ADAPTER-CONTRACT.md`, and `docs/REVIEW-UX-GUIDE.md`.

---

## Audit Kernel v1.7.0

Mercury now separates portable audit judgment from the author's local workflow.

The SDK runs an audit kernel with configurable:

- audit profiles
- audit standards
- source credibility floors
- memory lifecycle checks
- reviewer disagreement handling

See `docs/AUDIT-KERNEL.md`, `docs/ECOSYSTEM-POSITION.md`, and `docs/MERCURY-AGENT-RELATIONSHIP.md`.

Mercury Method Lab is not a fork, plugin, or official extension of Mercury Agent. Mercury Agent can be one upstream source of agent outputs; the audit kernel is agent-agnostic.

---

## Pre-Storage SDK v1.6.0

Mercury now has a local SDK entry point for host agents and memory systems:

```js
import { auditMemoryWrite, shouldWriteMemory } from "mercury-method-lab";

const result = auditMemoryWrite({
  content: "AI-generated memory candidate...",
  source_refs: ["conversation:source"],
  audit_refs: ["review:gate"],
  risk_level: "low"
});

if (shouldWriteMemory(result)) {
  await memoryStore.write(result.packet.claim, result.provenance);
}
```

Run the local demo:

```powershell
npm run demo:memory-hook
npm run benchmark:audit
```

See `docs/SDK-API.md`, `docs/INTEGRATION-DEMO.md`, `docs/BENCHMARKS.md`, and `docs/OWASP-AISVS-C8-MAPPING.md`.

---

## Start Here

If you are new, open `docs/START-HERE.md` first. It routes humans, agents, audit runners, and method readers to the right command or document.

Most users can start here:

```powershell
npm run dashboard
```

Then open:

```text
http://127.0.0.1:4788/lite.html
```

Paste an AI answer and click `开始检查`.

The first visible layer now shows:

- routing decision
- content summary
- Human Review Checklist with A/B/C choices
- technical details only after expansion

---

## Human Review UX v1.5.0

This release turns `human_review_required: true` from a dead end into an actionable review path.

- Audit results now include `content_summary`.
- Audit results now include `human_review_checklist`.
- HTML reports render A/B/C review choices and a copyable review record.
- Lite Mode defaults to Chinese user-facing guidance and hides internal fields behind `查看技术详情`.
- `docs/SCOPE.md` defines what Mercury does not own: databases, second brains, storage backends, or certification claims.
- `docs/EXPORT-GUIDE.md` explains how to carry Markdown/JSON/HTML outputs into external tools without treating raw captures as memory.

---

## Method Blueprint v1.4.0

This release moves the center of gravity from "tool surface" to "reference method":

- `docs/FAILURE-MODES.md` now groups the 22 modes into five top-level families.
- `docs/ROUTING-THEORY.md` explains why Mercury uses `accept / revise / quarantine / discard`.
- `docs/PROOF-PACK-COVERAGE-MATRIX.md` shows what Proof Pack 001 covers and which cases are still missing.
- `docs/RELATED-WORK.md` places Mercury beside hallucination detection, fact verification, data quality, provenance, and AI risk work.
- `docs/AGENT-AUDIT-BLUEPRINT.md` gives teams a practical adoption guide without forcing this repository's exact structure.

Mercury is not claiming to be a certification authority. It is a blueprint other agent and memory-system builders can inspect, cite, adapt, or improve.

---

## Have An AI Conversation To Audit?

Fastest path:

```powershell
npm run capture -- --file examples/ai-conversation-capture.md
```

Paste path:

```powershell
npm run dashboard
```

Then open `http://127.0.0.1:4788/lite.html`, paste an AI answer, click `开始检查`, and click `保存来源` only if you want Mercury to preserve the source plus a temporary Audit Packet.

Dropzone path:

```text
00_inbox/ai-conversations/
```

Put a `.md` or `.txt` AI conversation there, then run:

```powershell
npm run capture:dropzone
```

Captured material starts as source evidence, not memory:

```yaml
human_reviewed: declined
audit_refs: []
risk_level: high
```

See `docs/THREE-MINUTE-START.md`.

---

## 30-Second Anchor

```
input: a plausible-sounding AI conclusion
gate:  source_refs present? ❌  audit_refs present? ❌
routing_decision: discard
reason: hypothesis cannot be promoted without evidence
output: archived proof, no runtime DB write
```

```
✅ Mercury Lab runs this check before anything enters long-term memory
❌ Most memory tools skip the check and promote everything
```

---

## Proof Pack 001

The short-term reactivation does not expand features. It accumulates real interception cases first.

`docs/PROOF-PACK-001.md` records the first proof-pack seed: each case explains why the source narrative sounds plausible, what evidence is missing, how it could pollute long-term memory, and how Mercury should route it.

Cycle 02 method work is locked in `docs/CYCLE-02-COMMITMENT.md`: no new major framework names, no fake human review, and no fake charter users.

`v1.3.0` is a separately documented product-surface unfreeze limited to dashboard, Lite Mode, settings, and entry-point usability. See `docs/PRODUCT-SURFACE-PRESSURE-TEST.md`.

`v1.3.1` keeps that work on a patch line: it adds Lite/dropzone capture and records the Cycle 02/version-line debt in `docs/REVIEW-LEDGER.md` instead of pretending it did not happen.

`v1.4.0` is a method-depth release: taxonomy, routing theory, coverage matrix, related work, and implementer blueprint. It adds no new dashboard feature.

Low-token reactivation:

```powershell
npm run cycle:status
npm run cycle:check
```

---

## Evidence-First Audit Packets

`examples/audit-packets/` contains runnable audit packet examples:

```powershell
npm run audit    # writes dist/audit-results.json
npm run audit:flow # writes dist/memory-flow/
npm run report   # writes dist/reports/index.html
npm run test     # verifies routing decisions and HTML output
npm run audit:profile # prints local audit timing
npm run cycle:status # prints Cycle 02 status without long doc reads
npm run cycle:check  # checks proof/failure/review structure
```

Audit output uses four routing decisions:

```text
accept / revise / quarantine / discard
```

Markdown/YAML are the trusted record. HTML is the human delivery layer.

---

## Agent Audit Blueprint

For teams building agents or memory systems, the reusable control point is:

```text
before_write(memory_entry):
  require source_refs
  require audit_refs or quarantine
  classify failure_modes
  choose routing_decision
  record provenance
  only write when routing_decision == accept
```

Start with `docs/AGENT-AUDIT-BLUEPRINT.md`, then use `docs/ROUTING-THEORY.md` when route decisions are disputed.

---

## Product Surface v1.3.x

`v1.3.x` moves Mercury toward a real product surface without lowering audit gates:

```powershell
npm run dashboard       # Full Dashboard: settings / onboarding / notifications / artifacts
npm run dashboard:check # Static product-layer and Lite Mode check
npm run capture:check   # Verify Lite/dropzone capture keeps review declined
```

After local startup:

```text
Full Dashboard: http://127.0.0.1:4788
Lite Mode:      http://127.0.0.1:4788/lite.html
```

- `dashboard/lite.html` is a single-file Lite Mode for paste, URL prefill, audit, result review, copy-as-Markdown, and optional source capture.
- `00_inbox/ai-conversations/` is the file dropzone for `.md` / `.txt` AI conversation captures.
- Full Dashboard adds 7 settings categories, first-run onboarding, command palette, icons, toast/system notifications, and recoverable error UI.
- Lite and capture output keep `human_reviewed: declined` by default and do not bypass the audit contract.

---

## What It Is NOT

- NOT a second brain
- NOT a RAG tool
- NOT an AI writing assistant
- NOT a general-purpose Skill framework
- IS an audit gate for memory ingestion

---

## Release Gate (must pass before any release)

```powershell
npm run validate   # audit all artifacts for provenance declarations
npm run index     # rebuild JSON index
npm run doctor    # diagnose system state
npm run release:gate # current release gate
npm run capture:check # capture path must preserve declined review state
```

These checks must pass before the project is considered reproducible.

---

## The Problem

You had an hour-long conversation with an AI. Generated some genuinely good ideas.

Then what?

They just sat in the chat history. Two weeks later you either can't find them, or you find them but can't remember why they seemed important.

Mercury Lab solves this.

---

## Core Principles

```
❌ Cannot store speculation as fact
❌ Cannot have the same person write material and audit it
❌ Cannot skip quality check before entering memory
❌ Cannot let an AI judge, audit, and approve its own conclusion
❌ Cannot define "success metrics" readable by agents (they become gaming targets)
```

---

## v0.9.0: Methodology Integrity

### The AI Collaboration Paradox → Fixed

The project rule says "AI cannot self-audit." But the CHANGELOG said "AI collaborated on this." This is an audit contradiction.

**The fix:**

```
The problem is not "AI wrote it."
The problem is "AI wrote it without declaring it."

All outputs now require a provenance declaration:
  [AI_GENERATED]   ← AI drafted, human reviewed
  [HUMAN_ONLY]    ← pure human, no AI involved
  [AI_ASSISTED]   ← AI assisted, human verified
```

See `docs/METHODOLOGY-INTEGRITY.md`

### The Necessarily-Attacked Surface → Identified

When attempting to define "audit success metrics" (e.g., "promote rate < 15%"), we discovered:

> **Any quantified success metric readable by an agent becomes a gaming target.**

The correct audit direction is not measuring "success to a percentage" — it is detecting "absence of specific failure modes."

See `docs/AUDIT-METRICS-DECLINED.md`

---

## Quick Start

```powershell
npm install
npm run doctor       # diagnose system state
npm run audit        # audit packet examples
npm run audit:flow   # simulate accept/revise/quarantine/discard flow
npm run report       # generate HTML audit reports
npm run test         # test the audit loop
npm run audit:profile # inspect local audit performance
npm run validate     # audit provenance
npm run index        # rebuild index
npm run dashboard    # http://127.0.0.1:4788
```

---

## End-to-End Demo

`docs/v0.9-proof-of-audit.md` shows the complete interception chain:

```
Raw AI conversation
  → enters 00_raw/
  → passes through fact-cleaner / redteam-auditor / constraint-checker
  → 04_memory_candidates/ marks routing_decision = discard
  → 05_decision_logs/ records never_promote violation reason
  → 07_audit_reports/ generates audit report
  → 10_exports/demo-preaudit-bundle.json outputs the audit bundle

Anyone can walk through this in 15 minutes.
```

---

## The Minimal Workflow (4 Layers)

```
00_raw/                    ← raw material entry
  ↓ fact-cleaner / redteam-auditor
04_memory_candidates/      ← routing_decision: discard / archive / review / promote
  ↓ audited
07_audit_reports/       ← audit trail (unforgegable)
  ↓ approved
Long-term memory (OpenClaw / gbrain / Mercury Agent)
```

Full 12-layer directory structure in `docs/MINIMAL-WORKFLOW.md`

---

## How It Works

```
Received an idea
  -> What is it really? (fact / speculation / hypothesis)
  -> Did it pass the quality check?
  -> Passed -> goes into the sample library, can be called on later
  -> Not passed -> archived, but does not enter long-term memory

Not everything needs to be acted on. Sometimes writing it down is enough.
```

---

## Docs Index

| What you want | Where to go |
|---|---|
| Start here | `docs/START-HERE.md` |
| Audit kernel | `docs/AUDIT-KERNEL.md` |
| Scenario packs | `docs/SCENARIO-PACKS.md` |
| Adapter contract | `docs/ADAPTER-CONTRACT.md` |
| Review UX guide | `docs/REVIEW-UX-GUIDE.md` |
| Ecosystem position | `docs/ECOSYSTEM-POSITION.md` |
| Mercury Agent relationship | `docs/MERCURY-AGENT-RELATIONSHIP.md` |
| Local SDK API | `docs/SDK-API.md` |
| Integration demo | `docs/INTEGRATION-DEMO.md` |
| Benchmark notes | `docs/BENCHMARKS.md` |
| OWASP AISVS C8 mapping | `docs/OWASP-AISVS-C8-MAPPING.md` |
| Scope boundary | `docs/SCOPE.md` |
| Export guide | `docs/EXPORT-GUIDE.md` |
| i18n UX policy | `docs/I18N-UX-POLICY.md` |
| End-to-end interception case | `docs/v0.9-proof-of-audit.md` |
| Minimal workflow | `docs/MINIMAL-WORKFLOW.md` |
| Pre-audit contract | `docs/AUDIT-CONTRACT.md` |
| AI collaboration paradox fix | `docs/METHODOLOGY-INTEGRITY.md` |
| Why success metrics are dangerous | `docs/AUDIT-METRICS-DECLINED.md` |
| Agent audit blueprint | `docs/AGENT-AUDIT-BLUEPRINT.md` |
| Routing theory | `docs/ROUTING-THEORY.md` |
| Proof pack coverage matrix | `docs/PROOF-PACK-COVERAGE-MATRIX.md` |
| Related work | `docs/RELATED-WORK.md` |
| 3-minute AI conversation intake | `docs/THREE-MINUTE-START.md` |
| v2.0 alpha preflight guide | `docs/ITERATION-GUIDE-2.0.0-alpha.1.md` |
| v1.9.0 proof governance guide | `docs/ITERATION-GUIDE-1.9.0.md` |
| v1.8.0 scenario iteration guide | `docs/ITERATION-GUIDE-1.8.0.md` |
| v1.7.0 kernel iteration guide | `docs/ITERATION-GUIDE-1.7.0.md` |
| v1.6.0 SDK iteration guide | `docs/ITERATION-GUIDE-1.6.0.md` |
| Product surface pressure test | `docs/PRODUCT-SURFACE-PRESSURE-TEST.md` |
| Version history | `CHANGELOG.md` |
| Governance principles | `docs/GOVERNANCE.md` |

---

## Relationship to Mercury Agent

Mercury Lab is not a fork. It is a method layer. Mercury Agent is one possible upstream source of agent outputs, not the boundary of the method.

| Layer | Owner |
| --- | --- |
| Runtime, CLI, Telegram, daemon, scheduler, tools, Second Brain | Mercury Agent |
| Evidence, artifacts, method routing, audit, migration, public practice docs | Mercury Lab |

---

## Tech Stack

- Node.js + native `node:http` (no framework dependency)
- Markdown/YAML as the only source of truth
- JSON Schema for artifact validation
- `npm run` as the single command entry point
- OpenClaw agent compatible
