# Lifecycle Management

Mercury uses file metadata as the source of truth. The GUI edits the metadata inside Markdown/YAML artifacts and appends every GUI mutation to `data/lifecycle-log.jsonl`.

## Artifact States

- `staged`: captured but not yet organized.
- `deferred`: parked for later review.
- `indexed`: visible in project indexes.
- `draft`: work in progress.
- `review_ready`: ready for review.
- `audited`: reviewed by audit role.
- `approved`: accepted as reusable project knowledge.
- `superseded`: replaced by newer work.
- `rejected`: intentionally closed.

Allowed state transitions are defined in `config/state-machine.json`.

## Operating Loop

1. Put new material into the right artifact directory or create it from the GUI.
2. Fill `owner_role`, `source_refs`, and `review_at` as early as possible.
3. Move status forward only when the required evidence exists.
4. Use the GUI note field when changing metadata or state.
5. Run `validate` before treating a batch as stable.
6. Promote stable artifacts to `approved`, or close stale work as `superseded` / `rejected`.

## GUI Responsibilities

- Select artifacts and inspect metadata/content.
- Update status, owner role, and review date.
- Create tracked artifacts from templates.
- Run allowlisted maintenance commands.
- Append lifecycle events to `data/lifecycle-log.jsonl`.

## Log Policy

The lifecycle log is append-only operational history. It should not replace decision logs or audit reports.

- Use lifecycle log entries for "who changed what, when, and why".
- Use `05_decision_logs` for durable decisions.
- Use `07_audit_reports` for review findings and risk assessment.
- Use `06_action_plans` for next steps and acceptance criteria.
