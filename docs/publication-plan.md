# Publication Plan

## Public Name

Mercury Method Lab.

## Public Position

A local-first method lab for evidence-backed judgment, auditable memory, and action translation. Designed as a companion layer for Mercury Agent-compatible runtimes.

## Repository Shape

Recommended public files:

- `README.md` in English
- `README.zh-CN.md` in Chinese
- `LICENSE`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `docs/project-positioning.md`
- `docs/upstream-mercury-agent-compatibility.md`
- `docs/rule-routing.md`
- `docs/memory-architecture-migration.md`
- `examples/`

## Reader Tracks

| Reader | Entry Path | Goal |
| --- | --- | --- |
| Chinese solo builder | `README.zh-CN.md` -> quickstart -> examples | Run local loop and adapt methods |
| English agent builder | `README.md` -> architecture -> compatibility | Understand companion architecture |
| Mercury Agent user | compatibility doc -> skill sync -> memory migration | Reuse runtime without forking |
| Self-media creator | content diagnostics examples | Turn ideas into publishable experiments |
| Auditor/reviewer | audit docs -> state machine -> examples | Inspect evidence and failure modes |

## Open Surface

Publish:

- architecture
- sanitized templates
- example artifacts
- routing docs
- migration envelopes
- original skills
- validation scripts

Keep private:

- personal profile
- private decision logs
- raw sensitive sources
- API keys and local configs
- unlicensed third-party text
- unresolved commercial strategy

## GitHub Release Routine

1. Run `npm run doctor`.
2. Run `npm run validate`.
3. Run `npm run index`.
4. Run `npm run check:upstream`.
5. Review `git diff`.
6. Commit with a versioned message.
7. Push to GitHub.
8. Create a release note when version changes.

## First Public Release

Suggested tag: `v0.2.0-open-orbit`.

Release message:

```text
Mercury Method Lab 0.2.0 establishes the upstream-compatible architecture boundary:
it is a method, evidence, audit, and migration companion for Mercury Agent-compatible runtimes,
not a fork, prompt pack, or dbskill derivative.
```

