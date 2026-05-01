# Changelog

## Unreleased

### Added

- Recorded system wiki strategy as a next-version discussion topic instead of opening a separate GitHub Wiki immediately.

## 0.2.0 — Open Orbit

Architecture hardening release.

### Added

- Project identity: **Mercury Method Lab**.
- Upstream Mercury Agent compatibility policy for `cosmicstack-labs/mercury-agent`.
- Runtime compatibility check: `npm run check:upstream`.
- Memory architecture migration policy with reversible migration envelopes.
- Rule routing policy for factual cleaning, structural judgment, content diagnosis, action translation, audit, migration, and publication.
- Agile roadmap, publication plan, and source/license policy.
- Public `.gitignore` guardrails for secrets, logs, generated indexes, and local state.
- English reader entrypoint in `README.en.md`.
- Agent-first submission layer for markdown viewpoints and OpenClaw/Hermes-like agent queue envelopes.
- GitHub Issue and PR templates for public intake.
- `npm run import:viewpoint` to promote user viewpoint markdown into raw artifacts without approving it as truth.

### Changed

- Package name changed from `v8-mercury-backend` to `mercury-method-lab`.
- Package version changed from `0.1.0` to `0.2.0`.
- README now describes this repository as a companion method lab, not the Mercury runtime.

### Compatibility

- Observed upstream package: `@cosmicstack/mercury-agent@1.1.4`.
- Target range: `>=1.1.0 <2.0.0`.
- Integration mode: companion workspace, not fork and not vendor copy.

## 0.1.0

Initial local V8 Mercury backend workspace.
