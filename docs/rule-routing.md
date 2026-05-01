# Rule Routing

## Purpose

Rule routing prevents every task from activating every method. It keeps the system fast, explainable, and less likely to turn all questions into V8-style structural analysis.

## Default Rule

Route by:

1. task type
2. evidence maturity
3. risk level
4. required output

## Routes

| Route | Trigger | Primary Capability | Gate |
| --- | --- | --- | --- |
| Factual cleaning | Raw claims, source uncertainty, timelines | `fact-cleaner` | Facts and inference separated |
| Structural judgment | Power, incentives, rules, paths, market structure | V8 method | Equilibrium check before strong conclusion |
| Content/commercial diagnosis | Self-media, audience, offer, trust, conversion | planned `content-diagnostics` | Original rule text only |
| Action translation | Need next steps or stop conditions | `action-translator` | Acceptance criteria exists |
| High-risk audit | Money, law, trust, irreversible direction | `redteam-auditor` | Audit report exists |
| Memory migration | Approved knowledge needs runtime recall | migration envelope | Rollback path exists |
| Publication | GitHub or bilingual reader support | publication plan | License/source clean |
| Agent submission intake | User markdown or agent queue envelope arrives | `submissions/` protocol | Raw artifact promotion only, no truth approval |

## Risk Escalation

High-risk work must create or reference an audit artifact when it affects:

- money
- legal exposure
- public trust
- irreversible project direction
- third-party licensing
- public claims about another project

## dbskill-Inspired Gap

The missing useful capability is not dbskill itself. The gap is a creator/commercial diagnosis route.

Implement it as a new original skill:

```text
content-diagnostics
  -> audience path
  -> offer clarity
  -> trust mechanism
  -> content format fit
  -> monetization risk
  -> next publishable experiment
```

No dbskill text, atoms, naming, or structure should be imported.

## Agent-First Intake

When an OpenClaw-like or Hermes-like agent sees a queue envelope in `submissions/agent-queue/`, it should:

1. validate the referenced markdown file exists
2. check frontmatter and source policy
3. run `npm run import:viewpoint -- <path>` when promotion is allowed
4. recommend a route from this document
5. stop before memory import unless a reviewed artifact exists
