# Architecture Entrypoints

## Purpose

This file keeps future architecture choices visible without forcing the project to implement all of them now.

## Entrypoints

| Entrypoint | Current Role | Future Option |
| --- | --- | --- |
| CLI | Primary local operation surface | Keep as automation backbone |
| Frontend | Local dashboard implemented | Artifact review, state table, review queue, model switching, command execution |
| Backend API | Not implemented | Add HTTP API around artifacts, skills, providers, and audits |
| Database | Not implemented | Add SQLite first, Postgres later if multi-user collaboration appears |
| Vector index | Not implemented | Add only after memory candidates need retrieval |
| Upstream Mercury Agent | Reserved | Use `cosmicstack-labs/mercury-agent` as runtime without forking or locking to local layout |
| Local agent bridge | Reserved | Let OpenClaw or other local agents read architecture and call commands |
| Memory migration | Reserved | Move approved sediment into a new memory architecture through reversible migration envelopes |

## Suggested Future Frontend

Primary screens:

- Artifact inbox
- Decision timeline
- Audit board
- Memory candidate review
- Model provider switcher
- Skill registry
- Upstream runtime status
- Memory migration bundles

Current local GUI:

```powershell
npm run dashboard
```

Open `http://127.0.0.1:4788`.

## Suggested Future Backend

Primary modules:

- `artifacts`
- `states`
- `skills`
- `providers`
- `audits`
- `exports`
- `upstream-adapters`
- `migration-bundles`

## Suggested Future Database

Start with SQLite when filesystem search becomes slow or state updates need transaction safety.

Tables:

- `artifacts`
- `artifact_links`
- `state_transitions`
- `model_runs`
- `audit_findings`
- `exports`
- `migration_envelopes`

## Upstream Runtime Rule

Mercury Method Lab is not the runtime. It can sync skills, export approved memories, and prepare migration bundles for upstream Mercury Agent, but it must not assume ownership of `~/.mercury/`.

See [upstream-mercury-agent-compatibility.md](upstream-mercury-agent-compatibility.md).
