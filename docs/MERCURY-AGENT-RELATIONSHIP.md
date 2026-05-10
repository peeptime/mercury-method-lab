# Relationship To Mercury Agent

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/ECOSYSTEM-POSITION.md
```

Mercury Method Lab uses a name that can be confused with Mercury Agent. This document makes the relationship explicit instead of pretending the risk does not exist.

## Relationship

| Question | Answer |
|---|---|
| Is Mercury Method Lab a fork of Mercury Agent? | No. |
| Does it share runtime code with Mercury Agent? | No. |
| Is it a plugin or official extension? | No. |
| Can Mercury Agent outputs be audited by Mercury Method Lab? | Yes, as one possible upstream source. |
| Does Mercury Method Lab depend on Mercury Agent concepts to be useful? | It should not. v1.7 moves the audit kernel toward agent-agnostic use. |

## Clean Position

Mercury Agent is a runtime / agent system.

Mercury Method Lab is an audit method and portable kernel for deciding whether AI-generated claims deserve durable memory.

The relationship is:

```text
any agent output, including Mercury Agent output
  -> Mercury Method Lab audit kernel
  -> accept / revise / quarantine / discard
```

## Brand Debt

The shared "Mercury" name creates interpretive debt:

- new users may assume this is an official companion project
- the method may look dependent on one upstream ecosystem
- external citations may confuse runtime capability with audit framework

The current strategy is not to hide the debt. It is to disclose the relation clearly, keep the code independent, and make the SDK / kernel usable by any host system.

## Future Rename Window

A rename remains possible if external users repeatedly misread the project as an extension of Mercury Agent. Until then, README and docs should state the relationship plainly.
