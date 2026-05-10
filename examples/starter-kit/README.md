# Mercury Starter Kit

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/V2-PREFLIGHT-REQUIREMENTS.md
```

This starter kit shows the smallest useful Mercury path:

```text
AI output -> audit() -> routing decision -> provenance
```

## Run

From the repository root:

```powershell
npm run demo:starter
```

Try your own candidate:

```powershell
node examples/starter-kit/hello-audit.mjs "The user always wants every future agent result stored permanently."
```

## What To Look For

- `routing_decision`: `accept`, `revise`, `quarantine`, or `discard`
- `failure_modes`: named reasons when the candidate cannot be accepted
- `required_fixes`: concrete next steps
- `provenance.human_reviewed`: always `declined` until a named human reviews it

The starter kit does not write to a real memory backend. It demonstrates the admission gate only.

