# Mercury Method Lab

Version: `0.2.0` — Open Orbit

Mercury Method Lab is a local-first method, evidence, audit, and migration workspace for Mercury Agent-compatible workflows.

It is **not** a fork of [`cosmicstack-labs/mercury-agent`](https://github.com/cosmicstack-labs/mercury-agent). It is a companion layer that keeps method reasoning, evidence chains, memory candidates, decision logs, action plans, and audit reports separate from the runtime.

## Relationship To Mercury Agent

| Layer | Owner |
| --- | --- |
| Runtime, CLI, Telegram, daemon, scheduler, tools, permissions, Second Brain | Upstream Mercury Agent |
| Evidence, artifacts, method routing, audit, migration bundles, public practice docs | Mercury Method Lab |

Current upstream compatibility target:

```text
@cosmicstack/mercury-agent >=1.1.0 <2.0.0
```

Check it with:

```powershell
npm run check:upstream
```

## Quick Start

```powershell
npm run doctor
npm run check:upstream
npm run validate
npm run index
npm run sync:skills
npm run dashboard
```

Open the local dashboard at:

```text
http://127.0.0.1:4788
```

## Submission Layer

Users do not need to touch internal directories such as `00_raw/`.

Public intake paths:

- GitHub Issues for non-Git users.
- `submissions/viewpoints/*.md` for markdown/Git users.
- `submissions/agent-queue/*.json` for OpenClaw-like, Hermes-like, or future agents.

Promote a viewpoint into raw evidence:

```powershell
npm run import:viewpoint -- submissions/viewpoints/2026-05-01-example-viewpoint.md
```

See [docs/agent-first-submission-layer.md](docs/agent-first-submission-layer.md).

## Core Loop

```text
capture -> normalize -> validate -> reason -> decide -> act -> audit -> export -> review
```

The project keeps Markdown/YAML artifacts as the source of truth. JSON and SQLite indexes are generated views.

## Key Docs

- Project positioning: [docs/project-positioning.md](docs/project-positioning.md)
- Upstream compatibility: [docs/upstream-mercury-agent-compatibility.md](docs/upstream-mercury-agent-compatibility.md)
- Memory migration: [docs/memory-architecture-migration.md](docs/memory-architecture-migration.md)
- Rule routing: [docs/rule-routing.md](docs/rule-routing.md)
- Agile roadmap: [docs/agile-roadmap.md](docs/agile-roadmap.md)
- Publication plan: [docs/publication-plan.md](docs/publication-plan.md)
- License/source policy: [docs/license-and-source-policy.md](docs/license-and-source-policy.md)
- Agent-first submission layer: [docs/agent-first-submission-layer.md](docs/agent-first-submission-layer.md)
- User submission guide: [docs/user-submission-guide.en.md](docs/user-submission-guide.en.md)

## Third-Party Skill Pack Boundary

Third-party prompt or skill packs can be studied as examples, but they must not be copied into this repository unless their license and source policy allow it.

`dbskill` is treated as a study-only reference. The useful gap is creator and commercial diagnosis; the implementation must be original to Mercury Method Lab.
