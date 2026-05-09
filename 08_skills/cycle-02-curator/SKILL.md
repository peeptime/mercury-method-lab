---
name: cycle-02-curator
description: "Use for Mercury Method Lab Cycle 02 work: proof-pack cases, failure-mode dictionary updates, review ledger hygiene, charter user records, and low-token agent reactivation. Prevents new framework expansion, fake human review, fake charter users, and unnecessary full-repo reads."
allowed_tools: [Read, Grep, Write, Bash]
---

# Cycle 02 Curator

## Purpose

Keep Mercury Method Lab on the Cycle 02 path: cases before concepts, review honesty before release polish, and cheap status checks before long context reads.

## First Reads

Read only these files first:

1. `MEMORY.md`
2. `docs/ITERATION-GUIDE-LATEST.md`
3. `docs/CYCLE-02-COMMITMENT.md`

Then read only the directly touched artifact.

## Cheap Commands

Run these before broad exploration:

```powershell
npm run cycle:status
npm run cycle:check
npm run validate:incr
```

Use full validation after edits:

```powershell
npm run release:gate
```

## Hard Rules

- Do not create `v1.3.0`, `v1.4.0`, or `v2.0.0` during Cycle 02.
- Do not add new major framework names.
- Do not fabricate charter users or external feedback.
- Do not mark `human_reviewed: true` unless a named human actually reviewed the artifact.
- Do not define quantified audit success metrics.
- Do not read full historical guides or all audit reports unless the task needs exact text from them.

## Editing Guidance

- Proof-pack edits must include the six fields: Raw Output, Why It Sounds Plausible, Evidence Gap, Memory Pollution Risk, Mercury Decision, Rule Learned.
- Failure-mode edits must include Definition, Proof Pack Reference, and Near Miss.
- Charter user records can remain empty; honest emptiness is better than fake validation.
- Review ledger entries should distinguish `true`, `declined`, and `pending`.

## Trigger Eval

| Should trigger | Should not trigger |
|---|---|
| "continue Cycle 02" | Generic README copyedit unrelated to Mercury |
| "add proof cases" | A one-line shell question |
| "failure modes" | Non-Mercury frontend work |
| "human review ledger" | General web research |
| "reduce agent token cost" | Image generation |
