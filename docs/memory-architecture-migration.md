# Memory Architecture Migration

## Decision

Allow migration of accumulated knowledge into a new memory architecture, including upstream Mercury Agent's Second Brain or a future architecture.

The migration is allowed only if it preserves:

- source evidence
- uncertainty markers
- decision history
- audit trail
- rollback path

## Why Migration Should Be Allowed

The current artifact-first model is strong for auditability, but runtime agents need fast recall. A future memory architecture can improve:

- relevant recall
- personalization
- active project state
- scheduled review
- cross-channel continuity

The risk is losing provenance. Therefore migration must be reversible and source-linked.

## Memory Layers

| Layer | Current Location | Migration Role |
| --- | --- | --- |
| Evidence | `00_raw/` | Never rewrite. Link from migrated memory. |
| Cleaned fact | `02_cleaned/` | Candidate source for factual memory. |
| Uncertainty | `03_uncertain/` | Keep as caution or exclusion signal. |
| Memory candidate | `04_memory_candidates/` | Primary queue for approved runtime memory. |
| Decision | `05_decision_logs/` | Source for project and decision memory. |
| Action | `06_action_plans/` | Source for active project memory. |
| Audit | `07_audit_reports/` | Source for risk, contradiction, and decay policy. |
| Runtime memory | `~/.mercury/memory/` or future target | Recall layer, never sole source of truth. |

## Migration Envelope

Use a neutral envelope before writing to any target memory system:

```json
{
  "schema_version": "0.1",
  "id": "memory-slug",
  "type": "identity | preference | goal | project | habit | decision | constraint | relationship | episode | reflection | method | evidence",
  "summary": "short reusable memory",
  "source_refs": ["04_memory_candidates/example.yaml"],
  "confidence": "low | medium | high",
  "risk": "low | medium | high",
  "durability": "ephemeral | active | durable",
  "created_at": "YYYY-MM-DD",
  "review_at": "YYYY-MM-DD",
  "migration_target": "mercury-agent-second-brain | future-memory-v2",
  "rollback": "bundle-relative rollback instruction"
}
```

## Migration Pipeline

1. Inventory candidate artifacts.
2. Exclude rejected, uncertain, or unapproved candidates.
3. Map each candidate to a target memory type.
4. Generate migration envelopes.
5. Dry-run recall against sample prompts.
6. Write an audit report.
7. Import through a target-aware adapter.
8. Keep rollback instructions and source links.

## Cutover Gates

Do not cut over to a new memory architecture until:

- at least one migration bundle can be rebuilt from source artifacts
- recall quality is better than manual artifact search for repeated tasks
- false recall failure modes are documented
- rollback has been tested on a copy
- license/source review is clean

## Forbidden

- Do not delete artifacts after migration.
- Do not import unapproved candidates into runtime memory.
- Do not convert uncertainty into durable memory.
- Do not write directly into upstream SQLite without a schema-aware adapter.
- Do not mix third-party text into public exports without source review.

