# Ecosystem Position

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/RELATED-WORK.md
```

Mercury Method Lab is not trying to replace LLM observability, prompt testing, RAG evaluation, red-team scanners, or AI gateways.

It occupies a narrower point:

> pre-storage admission control for AI-generated claims that want to become durable memory, project truth, or delivery evidence.

## Neighbor Map

| Neighbor | Typical Center | Mercury Difference |
|---|---|---|
| Langfuse | traces, prompt management, evaluations, human annotation | Mercury decides whether a claim may be retained, not how a trace behaved. |
| Promptfoo | prompt/model testing and red-team checks | Mercury audits memory candidates after output, before durable write. |
| Garak | vulnerability probing and attack samples | Mercury borrows failure-mode discipline but routes content into memory outcomes. |
| Arize Phoenix | LLM/RAG observability and retrieval analysis | Mercury is an intervention gate, not only an observability layer. |
| TruLens | RAG quality measures such as relevance and groundedness | Mercury converts evidence gaps into accept/revise/quarantine/discard. |
| Ragas | RAG evaluation metrics | Mercury avoids exposed success metrics as release gates; it focuses on refusal reasons. |
| DeepEval | automated LLM test cases and eval metrics | Mercury treats tests as evidence, not durable-memory permission. |
| Giskard | AI risk testing and scenario scanning | Mercury is narrower: AI memory and claim retention. |
| Helicone | AI gateway logs, cost, latency, prompt tracking | Mercury does not proxy calls; it audits candidate memory. |
| Agent security checklists | permission, injection, memory, confirmation risks | Mercury provides a portable memory-admission kernel for one part of that checklist. |

## Position In One Sentence

Observability tools help teams see what happened. Evaluation tools help teams score what happened. Mercury helps teams decide what is allowed to remain.

## What To Integrate With

Mercury should sit beside those tools:

```text
trace / eval / red-team signal
  -> Mercury audit kernel
  -> memory admission route
  -> host store / quarantine / discard
```

This is why v1.7 moves judgment into a portable kernel instead of adding another dashboard.
