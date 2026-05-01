# Agile Roadmap

## Product Goal

Make Mercury Method Lab a public, bilingual, Mercury Agent-compatible method lab for evidence-backed judgment, memory migration, audit, and action translation.

## MVP Definition

The MVP is done when a new reader can:

1. understand the project position in 10 minutes
2. run `doctor`, `validate`, and `index`
3. see how V8 enters the artifact flow
4. understand how upstream Mercury Agent fits
5. create or inspect a memory candidate
6. follow a rule route from raw input to audit or action
7. know what is original, what is dependency, and what is forbidden to import

## Sprint 0 — Architecture Hardening

Status: current `0.2.0`.

Deliverables:

- project identity and version policy
- upstream Mercury Agent compatibility policy
- memory migration policy
- rule routing policy
- public release plan
- source/license boundary

Acceptance:

- docs explain why this is not a dbskill derivative
- docs explain why this is not locked to local Mercury
- config captures upstream compatibility target
- validation still passes

## Sprint 1 — Public Repository Readiness

Deliverables:

- bilingual README
- LICENSE decision
- CONTRIBUTING
- SECURITY
- examples
- quickstart
- release notes
- agent-first submission layer
- GitHub Issue and PR templates

Acceptance:

- Chinese and English readers can understand the same project
- no private material or API key is exposed
- public scope is clearly narrower than private workspace scope
- OpenClaw/Hermes-like agents can consume submission envelopes without a custom web backend

## Sprint 2 — Rule Router MVP

Deliverables:

- `content-diagnostics` skill
- routing smoke tests
- sample artifacts
- high-risk audit examples

Acceptance:

- same input routes consistently
- high-risk conclusions require audit
- content/commercial diagnosis is original and source-clean

## Sprint 3 — Memory Migration MVP

Deliverables:

- migration envelope generator
- dry-run migration bundle
- rollback note
- upstream Mercury Agent version check integrated into release routine

Acceptance:

- approved candidates can be exported without deleting artifacts
- migration can be reviewed before import
- upstream schema changes do not silently corrupt local memory

## Next Version Discussion Backlog

These items are intentionally recorded as discussion topics for the next iteration, not as current-sprint commitments.

### System Wiki Strategy

Question:

- Should Mercury Method Lab keep `docs/` as the versioned system wiki, or open a separate GitHub Wiki / documentation site for readers?

Context:

- Current recommendation: keep the system wiki inside `docs/` until interfaces and user flows stabilize.
- Revisit after the next public iteration, especially if external users need a cleaner reading surface.

Decision criteria:

- repeated external usage questions
- stable tutorials that do not change every commit
- tagged releases with stable behavior
- non-developer readers needing a simpler entrypoint
- `docs/` becoming too dense for onboarding
