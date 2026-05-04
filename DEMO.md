# Demo: From Messy Thought To Reviewable Sample

This demo answers the first GitHub question: "What do I put in, and what comes out?"

Mercury Method Lab is not trying to replace ChatGPT. It turns high-value AI conversation fragments into project materials that can be classified, audited, reused, and later challenged.

Its job is simple: keep smart thoughts from becoming clean but useless waste. It does not think for you; it acts as a quality gate for which thoughts should be kept, advanced, reused, or discarded.

## Raw Input

```text
AI 工具最近很火。是不是传统咨询会被快速替代？
我要不要把项目方向改成 AI 咨询替代？
```

## What A Normal Chat Often Does

It usually produces a plausible essay:

- AI will automate some consulting work.
- Strategy work still needs humans.
- Companies should adopt AI carefully.
- You should explore opportunities.

That may be useful, but it hides the decision state. You still do not know whether this is a fact, a hypothesis, a weak signal, a decision, or an action plan.

## What Mercury Produces

Mercury turns the fragment into a chain:

| Step | Output | Why It Matters |
|---|---|---|
| 1. Goal check | The input is analyzable but not decision-ready. | Prevents vague excitement from becoming a project direction. |
| 2. Classified sample | Type: `hypothesis`; confidence: `medium`; risk: `medium`. | The idea is stored as a sample, not promoted to truth. |
| 3. Action plan | Collect evidence for budget migration, customer replacement, and workflow substitution. | Creates a next verification action. |
| 4. Audit report | Main risk: confusing media heat with structural replacement. | Makes the likely error visible. |
| 5. Reuse decision | Reuse this as a weak-signal checklist for future AI-replacement claims. | The sample becomes a reusable judgment asset. |

## Result

The original fragment:

```text
"AI consulting replacement seems hot."
```

Becomes:

```text
Weak signal, not yet a strategic pivot.
Track evidence of budget migration before changing direction.
Reuse this sample whenever a new "AI will replace X" claim appears.
```

## Files

The complete example is in [examples/ai-consulting-replacement/](examples/ai-consulting-replacement/):

- [raw.md](examples/ai-consulting-replacement/raw.md)
- [goal-check.md](examples/ai-consulting-replacement/goal-check.md)
- [classified-sample.yaml](examples/ai-consulting-replacement/classified-sample.yaml)
- [action-plan.md](examples/ai-consulting-replacement/action-plan.md)
- [audit-report.md](examples/ai-consulting-replacement/audit-report.md)
- [reuse-decision.md](examples/ai-consulting-replacement/reuse-decision.md)

## Try It Locally

```powershell
npm install
npm run validate
npm run index
```

For a real run:

```powershell
npm run v8:analyze -- --mode agent --text "AI 工具最近很火。是不是传统咨询会被快速替代？" --title "AI consulting replacement check"
```

Agent mode writes a bounded task pack instead of asking the agent to inspect the whole repository.
