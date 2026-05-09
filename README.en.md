# Mercury Method Lab

**It keeps smart thoughts from becoming clean but useless waste.**

Version: `1.2.1`

```yaml
provenance:
  authors: project_owner + QClaw
  ai_assisted: true
  human_reviewed: true
  reviewer: project_owner
  audit_ref: docs/METHODOLOGY-INTEGRITY.md
```

---

## One Sentence

Mercury Method Lab is an evidence-first audit layer for AI-generated memory, agent outputs, and FDE delivery artifacts.

It does not make agents do more work. It decides whether the work agents already produced deserves to be retained.

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

Cycle 02 is locked in `docs/CYCLE-02-COMMITMENT.md`: no `v1.3.0`, no new major framework names, and no fake human review or charter users.

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
```

All three must pass before the project is considered reproducible.

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
| End-to-end interception case | `docs/v0.9-proof-of-audit.md` |
| Minimal workflow | `docs/MINIMAL-WORKFLOW.md` |
| Pre-audit contract | `docs/AUDIT-CONTRACT.md` |
| AI collaboration paradox fix | `docs/METHODOLOGY-INTEGRITY.md` |
| Why success metrics are dangerous | `docs/AUDIT-METRICS-DECLINED.md` |
| v1.0 freeze guide | `docs/ITERATION-GUIDE-1.2.1.md` |
| Version history | `CHANGELOG.md` |
| Governance principles | `docs/GOVERNANCE.md` |

---

## Relationship to Mercury Agent

Mercury Lab is not a fork. It is a companion layer.

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
