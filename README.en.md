# Mercury Method Lab

**Turn AI outputs into auditable evidence chains before they become durable memory.**

Version: `2.0.0`

Latest release: [v2.0.0 Portable Evidence Chain](https://github.com/peeptime/mercury-method-lab/releases/tag/v2.0.0)

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

## What It Is

Mercury Method Lab is an evidence-first audit framework for AI-generated memory, agent outputs, and FDE delivery artifacts.

It does not make agents produce more. It decides whether the outputs agents already produced deserve to be retained, reused, written into project knowledge, or delivered to another person.

---

## Mercury 2.0 Flow

```text
user material / AI output
  -> extract core claim
  -> build credible evidence chain
  -> record source attribution and confidence basis
  -> offer missing-evidence A/B/C choices
  -> run the memory-write gate
  -> accept / revise / quarantine / discard
  -> preserve as a case, report, or portable skill handoff
```

Mercury 2.0 moves the project from an author-centered method repository toward a portable audit framework:

- `buildEvidenceChain()` builds source-linked claim chains and missing-evidence choices.
- `auditMemoryWrite()` gates durable memory writes.
- `cases/2026-05/` stores reproducible local cases.
- `08_skills/mercury-*` packages the core behavior for other agents.
- `benchmark:v2` measures the local audit-plus-evidence-chain path.

---

## 30-Second Start

```powershell
npm install
npm run demo:starter
npm run demo:openclaw
npm run cases:check
npm run test:evidence
npm run benchmark:v2
npm run skills:check
```

To open the local interface:

```powershell
npm run dashboard
```

Then visit:

```text
http://127.0.0.1:4788/lite.html
```

Lite Mode supports paste, drag-attach for `.md` / `.txt` / `.json`, evidence-chain review, and Markdown copy.

---

## Portable Skills

Mercury 2.0 adds three lightweight skills so a new agent can reuse the core method without rereading the full repository:

| Skill | Purpose |
|---|---|
| `mercury-evidence-chain` | Turn messy material into source-linked evidence chains and missing-evidence A/B/C choices |
| `mercury-memory-gate` | Route candidate memories before durable storage |
| `mercury-case-capture` | Preserve AI outputs, audit results, and review state as portable case folders |

Sync them locally:

```powershell
npm run sync:skills
```

Validate them:

```powershell
npm run skills:check
```

All skills preserve:

```yaml
human_reviewed: declined
```

They do not fabricate human approval.

---

## Relationship To Mercury Agent

Mercury Method Lab is not a fork, plugin, or official extension of Mercury Agent.

Mercury Agent can be one upstream source of agent outputs. Mercury Method Lab is a downstream audit gate. The method should remain agent-agnostic across ChatGPT, Claude, Gemini, local agents, OpenClaw, mem0, Zep, Letta, and LangMem-style systems.

---

## Core Distinction

```text
Scoring = how credible this content appears.
Admission = whether this content deserves to be remembered.
```

Mercury focuses on admission.

The routing decisions are:

```text
accept       can enter durable memory or delivery
revise       useful, but needs evidence or rewriting
quarantine   isolated until review
discard      unsupported, circular, unsafe, or too risky to retain
```

---

## Key Documents

| Need | Document |
|---|---|
| Start by role | `docs/START-HERE.md` |
| Scope boundary | `docs/SCOPE.md` |
| 2.0 preflight | `docs/V2-PREFLIGHT-REQUIREMENTS.md` |
| 2.0 work train | `docs/V2-WORK-TRAIN.md` |
| 2.0 performance | `docs/PERFORMANCE-2.0.md` |
| SDK API | `docs/SDK-API.md` |
| Audit kernel | `docs/AUDIT-KERNEL.md` |
| Scenario packs | `docs/SCENARIO-PACKS.md` |
| Adapter contract | `docs/ADAPTER-CONTRACT.md` |
| Proof Pack 002 | `docs/PROOF-PACK-002.md` |
| Failure modes | `docs/FAILURE-MODES.md` |
| Routing theory | `docs/ROUTING-THEORY.md` |
| Related work | `docs/RELATED-WORK.md` |
| OWASP AISVS C8 mapping | `docs/OWASP-AISVS-C8-MAPPING.md` |
| Mercury Agent relationship | `docs/MERCURY-AGENT-RELATIONSHIP.md` |

---

## Local Verification

Before release:

```powershell
npm run release:gate
```

Important sub-checks:

```powershell
npm run validate
npm run index
npm run doctor
npm run cases:check
npm run test:evidence
npm run benchmark:audit
npm run benchmark:v2
npm run skills:check
```

`dist/` is generated delivery output. Markdown, YAML, and JSON remain the audit source of truth.

---

## What It Is Not

- Not a second brain
- Not a RAG tool
- Not a general agent framework
- Not a certification authority
- Not a replacement for fact-checking
- Not a tool for promoting every AI output into memory

---

## Principles

```text
Do not store speculation as fact.
Do not let AI audit and approve itself.
Do not fabricate source_refs, audit_refs, or human_reviewed:true.
Do not treat captured material as approved memory.
Do not define success metrics that agents can game.
```

Mercury's value is not producing more content. It is making bad content harder to keep.
