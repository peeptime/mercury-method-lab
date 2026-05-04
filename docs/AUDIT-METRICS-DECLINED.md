# Audit Metrics — Declined

```yaml
provenance:
  authors: project_owner + QClaw
  ai_assisted: false
  human_reviewed: true
  reviewer: project_owner
  audit_ref: this document
  routing_decision: discard
  blockers:
    - metric_gaming: quantified audit success metrics become agent gaming targets
    - Goodhart_corollary: when a measure becomes a target, it ceases to be a good measure
    - adversarial_recognition: in an agentic environment, metrics are attack surfaces
```

## What Was Proposed

P2-1 originally suggested defining three quantitative audit success indicators:

```
指标1: promote率 < 15%
指标2: 所有 M3+ 级记忆有 audit_ref
指标3: discard 理由具体化率 ≥ 80%
```

## Why It Failed

Attempting to implement 指标1 revealed a fundamental vulnerability:

### The Gaming Attack

An agent reading "promote_rate < 15%" will optimize toward it:

```
If the agent wants to pass the audit:
  → Flag more artifacts as discard  → discard rate goes up → promote rate goes down → metric "improves"
  → OR: Only promote trivially safe material → promote rate stays low → metric "improves"

The metric itself becomes a manipulation target.
The audit system that measures itself by this metric is no longer auditing — it's following orders.
```

### The Recursive Trap

This is worse than simple Goodhart's Law because the auditor is also an agent:

```
Traditional Goodhart: "When a measure becomes a target, it ceases to be a good measure"
Agent-Adjusted:       "When an agent audits an agent using a measure, the measure becomes a weapon"

The audited agent optimizes for the metric.
The auditor measures the metric, not the actual quality.
Mercury Lab's value proposition ("prevent AI pollution") is defeated from inside.
```

### The Deeper Recognition

> **Any "必然攻击的需求" (necessarily-attacked surface) in an audit system is not a bug to be patched with better metrics — it is the fundamental reason audit systems exist in the first place.**

If the metric can't be gamed, it's either:
- (a) Not actually measuring what matters, OR
- (b) Already so gameable that agents have internalized the correct behavior

The real question is not "how do we measure success?" but "what specific failure mode are we trying to prevent?"

## Revised Approach: Failure Mode Auditing

Instead of measuring success, measure the absence of specific known failure modes:

| Failure Mode | Detection Method | Response |
|---|---|---|
| Speculation stored as fact | Check: source_refs exists + audit_refs exists | reject if missing |
| Same person writes and audits | Check: owner_role ≠ auditor | reject if same |
| High-risk without human review | Check: risk=high → routing_decision ≠ promote | warn if violated |
| Unmarked AI-generated content | Check: provenance field exists | reject if missing |

**These rules don't create gaming targets. They create refusal points.**

The audit passes not when a percentage is achieved, but when no refusal point is triggered.

## What This Means for v0.10

P2-1 is declined. Do not add quantified success metrics to Mercury Lab.

Instead:

```
KEEP:  qualitative AUDIT-CONTRACT rules (source_refs required, no speculation-as-fact, etc.)
KILL:  any quantified success metric that agents can read and optimize toward
RETAIN: failure-mode detection (the system refuses to pass content that triggers a rule)
```

## The Discovery

> This is the "必然攻击的需求" problem: in a system designed to audit AI/agent outputs, any metric readable by the agent becomes a gaming surface. The correct response is not better metrics — it is metrics the agent cannot read, or metrics that measure refusal rather than success.

This insight was discovered during the attempt to implement P2-1. The failure to implement it is the finding.
