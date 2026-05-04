# Reuse Decision

## Artifact Metadata

- schema_version: 0.1
- id: example-reuse-ai-consulting-replacement
- type: decision_log
- status: review_ready
- owner_role: decision-owner
- sample_type: 决策
- project_id: examples.ai-consulting-replacement
- source_refs: examples/ai-consulting-replacement/classified-sample.yaml
- action_refs: examples/ai-consulting-replacement/action-plan.md
- audit_refs: examples/ai-consulting-replacement/audit-report.md
- reuse_count: 1
- feedback_status: pending
- created_at: 2026-05-04
- review_at: 2026-05-11

## 日期

2026-05-04

## 背景

The same pattern appears often: a new AI product becomes popular, then a broad replacement claim follows.

## 结论

Reuse this sample as a checklist for future "AI will replace X" claims.

## 证据

- The raw input contains excitement but no replacement evidence.
- The goal check shows the decision target is under-specified.
- The audit identifies the main failure mode: heat mistaken for structure.

## 风险

The sample may become too conservative if future replacement evidence becomes stronger.

## Reuse Rule

When a new AI replacement claim appears, ask:

- What budget moved?
- What workflow was replaced?
- Who stopped buying the old service?
- Is AI replacing the vendor, or only changing delivery inside the vendor?

## Feedback Needed

After the next comparable case, update `reuse_count`, add `reuse_refs`, and mark whether the checklist prevented a bad decision.
