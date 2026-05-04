# Example: AI Consulting Replacement

This example shows how Mercury Lab handles a common AI-workflow fragment:

```text
AI tools are hot. Will they quickly replace traditional consulting?
Should I pivot my project toward AI consulting replacement?
```

The point is not to produce a smarter essay. The point is to prevent a hot claim from silently becoming a strategic decision.

## Chain

| File | Role |
|---|---|
| [raw.md](raw.md) | Original fragment, preserved without interpretation. |
| [goal-check.md](goal-check.md) | Goal quality check: analyzable, but not decision-ready. |
| [classified-sample.yaml](classified-sample.yaml) | Sample metadata: type, confidence, risk, reuse state. |
| [action-plan.md](action-plan.md) | What evidence to collect before changing direction. |
| [audit-report.md](audit-report.md) | Where the judgment is most likely wrong. |
| [reuse-decision.md](reuse-decision.md) | How future AI-replacement claims should reuse this sample. |

## Before And After

Before:

```text
AI consulting replacement seems important.
```

After:

```text
Weak signal. Do not pivot yet.
Track budget migration, customer replacement, and workflow substitution evidence.
Reuse this as the checklist for future "AI will replace X" claims.
```

## Why This Is Better Than Plain Markdown

Plain Markdown can store the thought.

Mercury stores the state of the thought:

- classification: hypothesis, not fact
- confidence: medium
- risk: medium
- next action: evidence collection
- audit risk: hype mistaken for structure
- reuse rule: future replacement claims start from this checklist
