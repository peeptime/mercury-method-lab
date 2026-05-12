# Iteration Guide 2.0.2

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Admission Lab self-audit
  audit_ref: user 2.0.2 admission-contract brief 2026-05-12
```

## Release Name

`2.0.2` - Admission Contract.

## Objective

Close the gap after a user selects an A/B/C review choice.

Mercury should not leave ambiguous whether the admitted knowledge object is source material, a claim, model framing, user judgment, a hypothesis, or a future follow-up question.

## Core Claim

```text
Mercury does not produce truth verdicts.
Mercury produces structured admission choices.
```

## What Changed

- Added `buildAdmissionContract()` in `src/mercury-audit/admission-contract.mjs`.
- Added `MEMORY_OBJECT_TYPES`:
  - `fact`
  - `hypothesis`
  - `attribution`
  - `interpretation`
  - `open_question`
  - `preference`
  - `decision_record`
  - `temporary_note`
  - `reference`
- Evidence-chain choices now carry `admission_policy` metadata.
- Admission contracts separate:
  - `source_material`
  - `model_framing`
  - `user_judgment`
  - `admitted_object`
- Future usage policy records whether the admitted object may be used as fact, participate in reasoning, trigger action, require source recheck, or require citation.
- `benchmark:v2` now includes the admission-contract path.

## Boundary

Admission Contract is not a database adapter, sync protocol, or automatic truth verifier. It is a local SDK object that records the epistemic status and future-use constraints of a user choice.

Keep `human_reviewed: declined` unless a named human reviewer explicitly signs off.

## Verification

Focused checks:

```powershell
npm run test:evidence
npm run test:sdk
npm run benchmark:v2
```

Release check:

```powershell
npm run release:gate
```

The bad-memory proof must continue to export:

```yaml
routing_decision: discard
```
