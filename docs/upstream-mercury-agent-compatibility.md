# Upstream Mercury Agent Compatibility

## Decision

Mercury Method Lab should support `cosmicstack-labs/mercury-agent` version iteration without locking itself to the current local workspace.

Relationship:

```text
Mercury Agent = runtime
Mercury Method Lab = method, evidence, audit, migration, and publication layer
```

The local project should integrate by adapter and export, not by vendoring upstream source code.

## Upstream Snapshot

Observed on 2026-05-01:

| Item | Value |
| --- | --- |
| Repository | `https://github.com/cosmicstack-labs/mercury-agent` |
| Package | `@cosmicstack/mercury-agent` |
| Observed version | `1.1.4` |
| License | MIT |
| Runtime home | `~/.mercury/` |
| Core memory | `~/.mercury/memory/` |
| Skills | `~/.mercury/skills/` |

## Compatibility Policy

Target range: `>=1.1.0 <2.0.0`.

Reason:

- `1.0.0` introduced the stable `~/.mercury/` data architecture and Second Brain.
- `1.1.x` is actively evolving providers while keeping the core runtime boundary recognizable.
- `2.x` may change memory, skills, permissions, or daemon contracts and must be reviewed before adoption.

## Stable Integration Surfaces

| Surface | Local Use | Rule |
| --- | --- | --- |
| `~/.mercury/skills/` | Sync approved local skills | Use Agent Skills format, do not assume loader internals. |
| `~/.mercury/memory/` | Runtime recall target | Export through migration bundles, do not write SQLite directly without adapter. |
| `~/.mercury/permissions.yaml` | Runtime safety | Treat as upstream-owned runtime config. |
| `~/.mercury/schedules.yaml` | Future review cadence | Use only through upstream CLI/tooling unless schema is explicitly supported. |
| CLI commands | Smoke checks and manual operation | Detect version before relying on command behavior. |

## Adapter Contract

Every upstream integration should use a small adapter contract:

```json
{
  "adapter": "mercury-agent",
  "upstream_version": "detected at runtime",
  "source": "Mercury Method Lab artifact or bundle",
  "target": "skills | memory | schedule | export",
  "mode": "sync | dry-run | migrate | rollback",
  "audit_ref": "07_audit_reports/...",
  "rollback": "documented"
}
```

## Upgrade Routine

Before adopting a new upstream version:

1. Run `npm run check:upstream`.
2. Read upstream changelog for memory, skills, permissions, providers, daemon, and scheduler changes.
3. Update `config/upstream-mercury-agent.json` if compatibility assumptions changed.
4. Run local `doctor`, `validate`, `index`, and skill sync smoke tests.
5. Record the result in a decision log.

## Non-Lock-In Rule

No local document should describe the current directory as "the Mercury runtime." This repository is a method lab. Runtime ownership belongs to upstream Mercury Agent or any future compatible agent runtime.

