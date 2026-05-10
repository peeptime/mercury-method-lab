# Mercury Method Lab 2.0 Work Train

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/V2-PREFLIGHT-REQUIREMENTS.md
```

This is the execution sequence for the 2.0 train. It maps work packages to alpha releases so each tranche can be tested, pushed, and audited before the next tranche starts.

## Operating Rule

```text
Real integration case -> stronger v2.0 claim.
Real case summary -> stronger Proof Pack 003.
No named human review -> no human_reviewed: true.
```

`docs/ITERATION-STRATEGY-V2.md` is a lower-weight diagnostic source. It identifies real gaps, but its hard freeze language is not adopted.

## Package Sequence

| Package | Name | Primary Debt Paid | Outputs | Verification |
|---|---|---|---|---|
| P0 | Preflight And Direction Lock | unclear 2.0 scope | `V2-PREFLIGHT-REQUIREMENTS.md`, this file, MEMORY update | `validate:incr`, `cycle:status` |
| P1 | Real Case Foundation | "zero real cases" critique | `docs/REAL-CASES-SUMMARY.md`, `cases/YYYY-MM/*` | case extractor test, no invented refs |
| P2 | OpenClaw And Starter Kit | SDK integration too abstract | `openclaw-hook.mjs`, starter kit | demo blocks/accepts correctly |
| P3 | Drag Attach And Evidence Chain | entry friction and missing evidence UX | drag attach, evidence-chain panel, A/B/C gap prompts | dashboard check + manual file drop |
| P4 | A2A Blueprint | agent interoperability unclear | AgentCard example, task/message/artifact mapping | local A2A payload fixture |
| P5 | Performance Pass | broad scans and context cost | benchmark notes, cache/index tuning | benchmark before/after |
| P6 | Lightweight Skills | project too heavy for strangers | `mercury-evidence-chain`, `mercury-memory-gate`, `mercury-case-capture` skills | fresh-agent smoke test |

## Release Mapping

| Release | Packages | Meaning |
|---|---|---|
| `v2.0.0-alpha.1` | P0 | Requirement weighting, work-train control, and release-gate alignment. |
| `v2.0.0-alpha.2` | P1 + P2 | Structured case foundation plus runnable external-call demos. |
| `v2.0.0-alpha.3` | P3 + P4 | Evidence-chain review, drag attach, and A2A-compatible blueprint. |
| `v2.0.0` | P5 + P6 | Performance pass and lightweight skills for fresh agents. |

## Package P1 Detail

Start here after P0.

1. Inspect local evidence sources:
   - `dist/captures/results/` when present
   - `00_inbox/ai-conversations/`
   - `00_raw/`
   - `07_audit_reports/`
   - `submissions/agent-queue/`
2. Create case folders:
   - `cases/YYYY-MM/<case-id>/input.md`
   - `cases/YYYY-MM/<case-id>/audit-result.json`
   - `cases/YYYY-MM/<case-id>/review-status.yaml`
3. Write `docs/REAL-CASES-SUMMARY.md`.
4. Keep missing evidence visible.

## Package P2 Detail

OpenClaw demo should be a simulated pre-write hook, not a runtime dependency.

Starter Kit should answer:

```text
How do I run audit() in five minutes without reading the whole repo?
```

## Package P3 Detail

Drag attach should only lower intake friction. It must not lower audit friction.

Use the translucent teal accent only for:

- drag hover
- attached-file chips
- evidence-chain highlights

## Package P4 Detail

Use A2A concepts conservatively:

- AgentCard advertises Mercury capabilities
- Task is an audit/evidence-chain job
- Message carries input or reviewer response
- Artifact carries audit result or review log
- Part carries text, file, or structured JSON

No full A2A server until the blueprint is validated.

## Package P6 Detail

The first skill should make the value obvious:

```text
paste messy material -> get evidence chain -> get missing evidence choices
```

It should not require a user to understand Proof Packs, routing theory, or the whole repository.

## Current Installed Skill Support

- `mercury-method-lab-iteration`: active local project workflow.
- `agent-release-hardening`: active release/version hardening.
- `karpathy-guidelines`: installed locally; restart Codex for automatic activation.

## Hold Line

If a future task tries to add another major concept before P1/P2 are done, route it to `revise`.
