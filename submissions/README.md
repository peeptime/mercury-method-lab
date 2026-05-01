# Submissions

This directory is the public/user-facing intake layer.

It is intentionally thin:

- humans can submit markdown files
- agents can read structured metadata
- maintainers can promote valid submissions into the internal artifact flow

Do not put processed judgments here. Processed artifacts belong in `00_raw/` and later internal stages.

## Directories

| Directory | Purpose |
| --- | --- |
| `viewpoints/` | User-submitted viewpoints, claims, essays, notes, or arguments. |
| `agent-queue/` | Agent-readable task envelopes for OpenClaw, Hermes-like agents, or future runtimes. |

## Rule

`submissions/` is intake, not truth. Nothing here is reusable memory until it has been promoted, cleaned, reviewed, and indexed.
