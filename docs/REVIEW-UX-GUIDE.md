# Review UX Guide

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/SCENARIO-PACKS.md
```

v1.5 introduced A/B/C review choices. v1.8 makes those choices scenario-aware.

## Review Choice Meaning

| Choice | Plain Meaning | Consequence |
|---|---|---|
| A | Keep the current route. | Preserve provenance and scope. |
| B | Repair before use. | Add source, boundary, reviewer, or rewrite. |
| C | Escalate or quarantine. | Keep out of durable memory until resolved. |

## Scenario Focus

| Scenario | Reviewer Should Ask |
|---|---|
| AI Coding | What files changed? Which tests prove the behavior? What did the agent skip? |
| Personal Knowledge | Did the user actually say this? Is it temporary? Is it AI inference? |
| Investment Research | Is the source dated? What counter-evidence is missing? Is this thesis or fact? |
| Enterprise Delivery | Who said it? Was dissent preserved? Does this create a customer commitment? |
| Legal / Medical Risk | Is there qualified review? What is the jurisdiction or clinical boundary? |

## UX Rule

Do not expose only raw blockers. Always show:

```text
decision -> plain-language consequence -> scenario focus -> next best action
```

The SDK returns this as `review_guidance`.
