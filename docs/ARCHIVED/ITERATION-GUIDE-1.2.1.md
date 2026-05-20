# Iteration Guide 1.2.1

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/CYCLE-02-COMMITMENT.md
```

Version `1.2.1` is a Cycle 02 commitment patch.

It is not a new feature release. It narrows the next work loop around proof cases, failure modes, human review honesty, external user records, and agent token economy.

## Current Objective

- Keep the release line on `v1.2.x`.
- Finish evidence before adding concepts.
- Use Proof Pack 001 as the case base.
- Use Failure Mode Dictionary entries as citation handles.
- Keep charter user records honest, even when empty.
- Use low-token scripts before reading long docs.

## Start Here

```powershell
npm run cycle:status
npm run cycle:check
npm run validate:incr
```

Then read only the file named by the task.

## Stop List

- No `v1.3.0`, `v1.4.0`, or `v2.0.0` during Cycle 02.
- No new major framework names.
- No fake charter users.
- No fake human review.
- No quantified audit success metrics.
- No full-project reading when a status script answers the question.

## Validation

```powershell
npm run cycle:check
npm run validate:incr
npm run index:incr
npm run audit
npm run report
npm run audit:flow
npm run test
npm run audit:profile
npm run release:gate
```
