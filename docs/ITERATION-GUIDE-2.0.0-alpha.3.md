# Iteration Guide 2.0.0-alpha.3

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/A2A-AGENT-CARD-BLUEPRINT.md
```

## Purpose

`2.0.0-alpha.3` exposes Mercury's evidence-chain layer to users and agent ecosystems:

- `buildEvidenceChain()` for core claim, source nodes, missing evidence, and A/B/C choices
- Lite Mode drag attach for `.md`, `.txt`, and `.json`
- A2A-compatible AgentCard and task/message/artifact fixture

## Run

```powershell
npm run test:evidence
npm run demo:a2a
npm run dashboard:check
```

## Next Tranche

Use `2.0.0` for:

- performance benchmark and path-level optimization
- lightweight skills: evidence chain, memory gate, and case capture
- final README/GitHub release sync

## Hold Line

Dragged files and A2A messages are source material only. They are not approved memory and cannot set `human_reviewed: true`.

