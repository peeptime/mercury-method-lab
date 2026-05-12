# Iteration Guide 2.0.1

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Admission Lab self-audit
  audit_ref: user 2.0.1 rename and critique brief 2026-05-12
```

## Release Name

`2.0.1` - Admission Reframe.

Public name: **Mercury Admission Lab**.

Repository/package compatibility remains `peeptime/mercury-method-lab` / `mercury-method-lab`.

## Why This Patch Exists

This release narrows the public claim. The project is not presented as a validated standard, certification authority, or production-proven audit framework. It is presented as an evidence-first memory admission lab.

The useful distinction is:

```text
Scoring = how credible this content appears.
Admission = whether this content deserves to be remembered.
```

## What Changed

- README and README.en now lead with **Mercury Admission Lab**.
- Version surfaces move to `2.0.1` with codename `Admission Reframe`.
- Public copy now foregrounds known limits instead of burying them:
  - no external team adoption proof
  - no third-party human review
  - no precision/recall benchmark
  - no cross-model certification
  - no completed multi-agent contamination model
  - no adversarial prompt-injection hardening claim
- Roadmap now prioritizes empirical validation:
  - Ground-Truth Track
  - Cross-Model Audit
  - Programmable Checks
  - Adversarial Injection Tests
  - Multi-Agent Contamination Track
  - Human Trust Anchor

## Boundaries

Do not use this patch to claim:

- Mercury is externally validated.
- Mercury has adoption beyond the project owner.
- AI-assisted audit output is human-reviewed.
- performance benchmarks prove detection accuracy.
- OWASP AISVS compliance.
- multi-agent contamination is solved.

Keep `human_reviewed: declined` until a named human reviewer signs off.

## Verification

Use the project gate:

```powershell
npm run release:gate
```

Fast preflight:

```powershell
npm run validate:incr
npm run index:incr
npm run skills:check
```

The bad-memory proof must continue to export:

```yaml
routing_decision: discard
```
