# Mercury Method Lab 2.0 Preflight Requirements

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_window: 2026-05-10
  source_refs:
    - user brief: technical-VC posture, Generative UI, A2A, palette, drag attach, skill packaging
    - docs/ITERATION-STRATEGY-V2.md as lower-weight historical strategy input
    - karpathy-guidelines skill installed from forrestchang/andrej-karpathy-skills
    - A2A protocol references: AgentCard, Task, Message, Artifact, Part
  audit_refs:
    - docs/RULE-VERSION-GOVERNANCE.md
    - docs/ANTI-GAMING-TESTS.md
    - docs/PROOF-PACK-COVERAGE-MATRIX.md
```

This document is the preflight contract for the 2.0 work train. It is intentionally not a release note.

## Role

For 2.0, Codex should act as a technical, risk-oriented investor operator:

- protect the strongest thesis: evidence-first memory admission
- pay down the debt that prevents adoption: real integrations, real cases, review flow, and lightweight skills
- avoid empty release theater while still allowing useful releases when they carry real capability or evidence
- strengthen existing advantages before chasing generic engineering breadth
- surface risk like an investor, but ship like an engineer

## Input Weighting

The current project-owner brief is the controlling requirement source. `docs/ITERATION-STRATEGY-V2.md` is valuable, but lower-weight: use it for problem diagnosis and concrete gaps, not for hard limits the project owner does not support.

| Source | Weight | Meaning |
|---|---:|---|
| Current project-owner brief | 1.0 | Build 2.0 around evidence-chain assistance, Generative UI, A2A readiness, drag attach, palette/UI language, Karpathy-style coding discipline, and final skill packaging. |
| `docs/ITERATION-STRATEGY-V2.md` | 0.45 | Keep its diagnosis: engineering landing, real integrations, real case summaries, and review flywheel. Do not inherit its unsupported restrictions as hard governance. |

Resolution: build the 2.0 capabilities in the sequence the current brief requires. Use the V2 strategy file as a warning label for weak areas, not as a freeze policy.

## Core 2.0 Thesis

Mercury 2.0 is not mainly a dashboard, not mainly a document set, and not mainly a memory store.

It is an evidence-chain assistant for AI outputs:

```text
user material
  -> credible evidence-chain extraction
  -> source and confidence attribution
  -> missing-evidence questions with A/B/C choices
  -> durable case/review record
  -> portable output for agents, humans, and skills
```

The user's current strongest formulation:

1. Find the credible evidence chain that a strong model can infer from the user's material.
2. Store that evidence chain in a durable, auditable form.
3. Identify missing evidence and give concrete user choices to complete it.
4. Support the user with AI assistance without letting AI approve itself.

This is stronger than "audit a packet." It is a guided path from messy material to a defensible memory or decision.

## Product Surface Resolution

### Generative UI

Generative UI should mean "the review surface is generated from the evidence gaps," not "the app invents more UI."

Allowed:

- generate A/B/C choices from detected evidence gaps
- generate an evidence-chain map from input material
- generate a review checklist from source credibility and lifecycle state
- generate a compact next-action panel for missing evidence

Not allowed:

- decorative UI expansion
- free-form AI chat that bypasses the audit route
- AI-generated approval without named human review

### Drag Attach

Drag attach is a normal intake affordance and should be treated as part of capture, not as a new product category.

Target behavior:

```text
drag file/text/archive into Lite or dashboard
  -> preserve as source evidence
  -> create temporary audit packet
  -> run structural audit
  -> show evidence chain + missing-evidence choices
```

Dragged material is source evidence only. It is not approved memory.

### Palette

The palette image suggests a translucent cyan/teal accent, roughly:

```css
--mercury-attach-accent: rgba(0, 255, 240, 0.18);
```

Use it narrowly for drag-hover, attached-file chips, and evidence-chain highlights. Do not repaint the whole app into a one-color theme.

### New Audit Mode

The "Think Before Coding" image becomes a coding-agent audit mode:

```text
understand before coding
list multiple interpretations
do not secretly choose
offer the simpler plan when it exists
then implement only after the route is clear
```

This should be implemented as agent behavior, release gate checks, and eventually a lightweight skill, not as a new theoretical framework name.

### Ability-System Principle

The "ability system" image points to the right 2.0 architecture:

```text
do not force all capabilities into the core
compress shared structure into a small kernel
let scenario skills carry local complexity
manage the boundary with dynamic indexes and explicit contracts
```

For Mercury, this means:

- keep the audit kernel small
- move scenario behavior into scenario packs or skills
- make cases and review logs indexable
- keep the boundary between capture, audit, review, and memory write explicit

## A2A Interpretation

A2A should be treated as an interoperability posture, not a full server requirement for the first 2.0 tranche.

Relevant A2A concepts:

- `AgentCard`: discoverable description of what an agent can do
- `Task`: durable work unit for collaboration
- `Message`: exchange payload
- `Artifact`: output produced by the agent
- `Part`: typed unit of text, file, or structured data

Mercury's natural mapping:

| A2A Concept | Mercury Mapping |
|---|---|
| AgentCard | Mercury audit capability card: evidence-chain audit, memory-write gate, review-log export. |
| Task | Audit run or evidence-chain completion task. |
| Message | User material, agent output, or reviewer response. |
| Artifact | Audit result, evidence chain, review checklist, proof case, or review log. |
| Part | Text input, attached file, JSON audit packet, Markdown review note. |

2.0 should first ship an A2A-compatible blueprint or agent-card example. A full A2A server is later work unless a real integration requires it.

## Karpathy Guideline Adoption

The installed `karpathy-guidelines` skill should inform 2.0 work:

- state assumptions before coding
- do not hide confusion
- list multiple interpretations when they exist
- prefer simple, surgical changes
- define verification before implementation

In Mercury terms: no more "agent guesses the shape and ships." The system should make uncertainty visible before code appears.

## Conflict Resolution

The project-owner brief asks for a large 2.0 sequence. `ITERATION-STRATEGY-V2.md` argues for a stricter freeze until real evidence exists.

Resolution:

- use internal work packages and commits freely
- releases are allowed when they carry real capability, evidence, or user-facing value
- the V2 strategy file's hard freeze language is not adopted
- public version jumps should still explain what evidence or capability changed
- performance optimization and skill packaging happen after the functional evidence loop is in place

The numeric gates in `ITERATION-STRATEGY-V2.md` are diagnostic prompts, not binding release criteria and not agent-readable success metrics for route decisions. They must not become audit scoring targets.

## Work Train

### Package 0: Preflight And Direction Lock

Purpose: make 2.0 requirements explicit, record weighting, and prevent the agent from mistaking older strategy notes for controlling constraints.

Deliverables:

- `docs/V2-PREFLIGHT-REQUIREMENTS.md`
- `docs/V2-WORK-TRAIN.md`
- release cadence note: releases are allowed when tied to real capability/evidence, not empty ceremony
- installed `karpathy-guidelines` skill recorded in `MEMORY.md`

Verification:

- `npm run validate:incr`
- `npm run cycle:status`

### Package 1: Real Case Foundation

Purpose: answer "where are the real cases?"

Deliverables:

- `docs/REAL-CASES-SUMMARY.md`
- `cases/YYYY-MM/<case-id>/input.md`
- `cases/YYYY-MM/<case-id>/audit-result.json`
- `cases/YYYY-MM/<case-id>/review-status.yaml`
- script to convert capture results and local audit outputs into cases

Important adjustment:

`dist/` is cleaned by release gate, so the case extractor cannot depend only on `dist/captures/results`. It must also support `00_inbox`, `00_raw`, `07_audit_reports`, and future saved capture records.

Verification:

- at least 10 structured local cases if enough source material exists
- no invented source refs
- missing fields are recorded as missing, not silently filled

### Package 2: OpenClaw And Starter Kit

Purpose: make Mercury externally callable without reading the whole repo.

Deliverables:

- `examples/integration-demo/openclaw-hook.mjs`
- `examples/starter-kit/README.md`
- `examples/starter-kit/hello-audit.mjs`
- integration result written into `docs/REAL-CASES-SUMMARY.md`

Verification:

- OpenClaw demo blocks one unsafe memory and accepts one scoped memory
- Starter Kit can run in five steps
- no runtime dependency on external LLM

### Package 3: Drag Attach And Evidence-Chain Review

Purpose: reduce input friction and make missing evidence actionable.

Deliverables:

- dashboard/Lite drag attach for `.md`, `.txt`, `.json`
- evidence-chain panel
- missing-evidence A/B/C prompts
- review-log export to `proofs/review-log.yaml`

Verification:

- dragged file creates source record and temporary audit packet
- user-visible layer is Chinese-first where appropriate
- technical details stay behind progressive disclosure

### Package 4: A2A Blueprint

Purpose: make Mercury legible to agent ecosystems without overbuilding a server.

Deliverables:

- `examples/a2a/agent-card.json`
- `docs/A2A-AGENT-CARD-BLUEPRINT.md`
- `examples/a2a/send-message-demo.mjs` or equivalent local payload fixture

Verification:

- AgentCard advertises only real Mercury capabilities
- task/message/artifact mapping produces a valid audit artifact
- no secrets in agent card

### Package 5: Performance Pass

Purpose: make the new case, review, and drag paths cheap enough for agent use.

Targets:

- avoid broad repo scans when extracting cases
- cache source index reads where safe
- keep local structural audit sub-millisecond for small packets
- keep skill use low-token by avoiding long docs unless needed

Verification:

- `npm run benchmark:audit`
- before/after timings for case extraction and starter demo
- release gate still passes

### Package 6: Lightweight Skills

Purpose: let a stranger feel Mercury's core value fast.

Minimum skill set:

| Skill | Job |
|---|---|
| `mercury-evidence-chain` | Turn messy material into a source-linked evidence chain and missing-evidence choices. |
| `mercury-memory-gate` | Decide whether a candidate memory can be accepted, revised, quarantined, or discarded. |
| `mercury-case-capture` | Convert AI outputs and review notes into a small case folder. |

Skill design:

- SKILL.md stays short
- scripts do deterministic extraction where possible
- references are loaded only when needed
- no skill may mark `human_reviewed: true`

Verification:

- fresh-agent smoke test
- each skill produces one useful artifact in under five minutes
- skills do not require reading the whole repository

## 2.0 Release Readiness

`v2.0.0` is strongest when these are true:

- at least one integration demo is runnable and recorded
- `docs/REAL-CASES-SUMMARY.md` exists
- Starter Kit is runnable
- review and case artifacts are reproducible by command
- GitHub README explains the 2.0 shift without claiming certification or external validation

## Do Not Do

- Do not add a new major framework name.
- Do not ship more dashboard complexity before the case and review loop exists.
- Do not claim A2A compliance before a real A2A-compatible artifact exists.
- Do not turn numeric milestone gates into audit success metrics.
- Do not present Proof Pack 003 as proven without real case material.
- Do not mark AI-authored work as human-approved.
- Do not invent external feedback.
- Do not treat dragged files as approved memory.

## Immediate Next Step

Start with Package 0 and Package 1:

1. finalize this preflight document
2. create `docs/V2-WORK-TRAIN.md`
3. inspect existing local capture/audit artifacts
4. build the case extraction path
5. write the first `docs/REAL-CASES-SUMMARY.md`

Only after that should Package 2 start.
