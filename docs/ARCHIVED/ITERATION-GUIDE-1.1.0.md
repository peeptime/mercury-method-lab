# Iteration Guide 1.1.0

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: user iteration brief 2026-05-09
```

## Theme

Evidence-First Audit Layer for Agent / FDE / Long-Term Memory.

This version adds a runnable audit packet loop without turning Mercury Method Lab into an agent framework.

## Deliverables

- Audit Packet YAML examples in `examples/audit-packets/`.
- Structural audit logic in `scripts/audit-core/`.
- JSON audit result output through `npm run audit`.
- Human-readable HTML reports through `npm run report`.
- Directional tests through `npm run test`.
- Schema reference in `schemas/audit-packet.schema.json`.

## Boundary

- Markdown/YAML remain source of truth.
- HTML is generated delivery output.
- No database, backend adapter, AI scoring, RAG, or frontend framework.
- No quantified success metrics; blockers remain refusal points.

## Validation

```powershell
npm run audit
npm run report
npm run test
npm run release:gate
```
