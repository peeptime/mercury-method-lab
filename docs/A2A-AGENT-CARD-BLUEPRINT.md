# A2A Agent Card Blueprint

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/V2-PREFLIGHT-REQUIREMENTS.md
```

Mercury 2.0 treats A2A as an interoperability posture first, not a full server requirement.

## Mapping

| A2A Concept | Mercury Mapping |
|---|---|
| AgentCard | `examples/a2a/agent-card.json` describing evidence-chain, memory-gate, and review-record capabilities. |
| Task | An audit or evidence-chain completion job. |
| Message | User material, agent output, or reviewer response. |
| Artifact | Audit result, evidence chain, proof case, or review record. |
| Part | Text, file metadata, JSON audit result, or Markdown review note. |

## Runnable Fixture

```powershell
npm run demo:a2a
```

The fixture:

1. loads `examples/a2a/agent-card.json`
2. creates a user message containing a candidate memory
3. routes it through `audit()`
4. attaches `buildEvidenceChain()` output to an artifact

## Non-Claims

- This is not a full A2A server.
- This is not a compliance claim.
- The agent card advertises only repository-local capabilities.
- All outputs remain `human_reviewed: declined` until a named human review occurs.

