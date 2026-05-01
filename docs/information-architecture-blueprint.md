# Mercury Information Architecture Blueprint

## Purpose

Mercury is a reusable information architecture for evidence, judgment, memory, audit, and action.

V8 is the first method running on Mercury, not the only method Mercury can host. Future methods can enter through the same artifact flow, state model, permission model, and model provider layer.

## Core Principle

Every important answer should leave a trace:

```text
source -> structure -> fact -> uncertainty -> memory -> decision -> action -> audit -> export
```

Mercury does not try to make one perfect answer. It keeps the system able to revise answers when new evidence arrives.

## Information Layers

| Layer | Directory | Role |
| --- | --- | --- |
| Source | `00_raw/` | Preserve original material |
| Structure | `01_segmented/` | Split material into usable units |
| Fact | `02_cleaned/` | Separate fact from inference |
| Uncertainty | `03_uncertain/` | Keep contradiction and weak signals visible |
| Memory | `04_memory_candidates/` | Propose reusable knowledge |
| Decision | `05_decision_logs/` | Explain why a judgment was made |
| Action | `06_action_plans/` | Translate judgment into next moves |
| Audit | `07_audit_reports/` | Challenge assumptions and failure modes |
| Skill | `08_skills/` | Store reusable reasoning operators |
| Template | `09_templates/` | Keep artifact shape stable |
| Export | `10_exports/` | Produce stable handoff outputs |

## Extension Slots

| Slot | Purpose | Current Status |
| --- | --- | --- |
| Method | V8, future methods, domain-specific playbooks | Registered in [../config/methods.json](../config/methods.json) |
| Model provider | Ark, custom OpenAI-compatible APIs, local OpenClaw | Ark active, others reserved |
| Interface | CLI, future web UI, local agents | Registered in [../config/architecture-entrypoints.json](../config/architecture-entrypoints.json) |
| Upstream runtime | Mercury Agent and future compatible runtimes | Adapter-based, not fork-based |
| Storage | Filesystem, future SQLite/Postgres/vector index | Filesystem active, database reserved |
| Memory migration | Runtime recall and future memory architectures | Reversible envelopes required |
| Ingestion | Manual markdown, optional MarkItDown | Markdown active, MarkItDown disabled |
| Audit | Script checks, future policy engine | Script checks active |

## Navigation Rule

Use this file as the map. Use the following files as operating references:

- Execution loop: [execution-loop.md](execution-loop.md)
- Markdown standard: [markdown-standard.md](markdown-standard.md)
- Model providers: [model-providers.md](model-providers.md)
- Architecture entrypoints: [architecture-entrypoints.md](architecture-entrypoints.md)
- Upstream Mercury Agent compatibility: [upstream-mercury-agent-compatibility.md](upstream-mercury-agent-compatibility.md)
- Memory migration: [memory-architecture-migration.md](memory-architecture-migration.md)
- Rule routing: [rule-routing.md](rule-routing.md)
- OpenClaw integration: [openclaw-integration.md](openclaw-integration.md)
