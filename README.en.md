# Mercury Method Lab

**An insight-sample precipitation system for high-frequency AI conversationalists.**

It keeps smart thoughts from becoming clean but useless waste.

Version: `0.7.3`

Mercury Method Lab is a local-first method, evidence, audit, and migration workspace for Mercury Agent-compatible workflows.

It is **not** a fork of [`cosmicstack-labs/mercury-agent`](https://github.com/cosmicstack-labs/mercury-agent). It is a companion layer that keeps method reasoning, evidence chains, memory candidates, decision logs, action plans, and audit reports separate from the runtime.

It is not a system that thinks for you. It helps decide which thoughts deserve to be kept, advanced, reused, or discarded. Think of it less as a second brain and more as a quality gate inside the judgment loop.

## Start Here

You do not need to understand the whole method first:

- [DEMO.md](DEMO.md): how a messy idea becomes reviewable project material
- [examples/](examples/): a complete sample chain from raw input to reuse decision
- [sample_index.md](sample_index.md): how the sample library index proves this is more than cleaned notes

Minimal flow:

```text
raw user fragment
  -> goal-validator check
  -> classified sample
  -> action_plan
  -> audit_report
  -> reuse decision
```

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
npm install
npm run doctor
npm run dashboard
```

Open the local dashboard at:

```text
http://127.0.0.1:4788
```

API execution mode needs an LLM token. The default provider is Ark Coding Plan:

```powershell
$env:ARK_API_KEY="..."
npm run test:llm
```

See [docs/DEPLOYMENT-ONBOARDING.md](docs/DEPLOYMENT-ONBOARDING.md).

Provider support now includes hosted OpenAI-compatible APIs and local runtimes:

- `openai`
- `openai-compatible-custom`
- `local-openclaw`
- `ollama-local`
- `vllm-local`
- `lm-studio-local`

Local providers do not require API keys by default. Hosted providers accept aliases such as `MERCURY_API_KEY`, `OPENAI_API_KEY`, and `MERCURY_OPENAI_API_KEY`.

## Architecture Boundary

This release separates two axes:

- `analysis_persona`: V8.1 / V8.0 / V8.5 judgment posture.
- `execution_mode`: API / Agent execution channel.

Adding a new skill or management Markdown file should not require architecture refactoring. See [docs/ARCHITECTURE-SHIFT-REPORT.md](docs/ARCHITECTURE-SHIFT-REPORT.md).

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

`npm run index` now writes two generated views:

- `11_indexes/source-index.json`: file-level artifact index
- `11_indexes/sample-index.json`: sample-level index for grading, project binding, reuse, and feedback gaps

## Key Docs

- Project positioning: [docs/project-positioning.md](docs/project-positioning.md)
- Architecture shift report: [docs/ARCHITECTURE-SHIFT-REPORT.md](docs/ARCHITECTURE-SHIFT-REPORT.md)
- Deployment onboarding: [docs/DEPLOYMENT-ONBOARDING.md](docs/DEPLOYMENT-ONBOARDING.md)
- Judgment closure rule: [docs/JUDGMENT-CLOSURE-RULE.md](docs/JUDGMENT-CLOSURE-RULE.md)
- Upstream compatibility: [docs/upstream-mercury-agent-compatibility.md](docs/upstream-mercury-agent-compatibility.md)
- Memory migration: [docs/memory-architecture-migration.md](docs/memory-architecture-migration.md)
- Rule routing: [docs/rule-routing.md](docs/rule-routing.md)
- Agile roadmap: [docs/agile-roadmap.md](docs/agile-roadmap.md)
- Publication plan: [docs/publication-plan.md](docs/publication-plan.md)
- License/source policy: [docs/license-and-source-policy.md](docs/license-and-source-policy.md)
- Agent-first submission layer: [docs/agent-first-submission-layer.md](docs/agent-first-submission-layer.md)
- User submission guide: [docs/user-submission-guide.en.md](docs/user-submission-guide.en.md)
- GUI intake workflow: [docs/gui-intake-workflow.md](docs/gui-intake-workflow.md)
- System wiki decision: [docs/system-wiki-decision.md](docs/system-wiki-decision.md)

## Third-Party Skill Pack Boundary

Third-party prompt or skill packs can be studied as examples, but they must not be copied into this repository unless their license and source policy allow it.

`dbskill` is treated as a study-only reference. The useful gap is creator and commercial diagnosis; the implementation must be original to Mercury Method Lab.
