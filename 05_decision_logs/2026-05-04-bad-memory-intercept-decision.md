# Decision Log: Bad Memory Intercept

## Artifact Metadata

- schema_version: 0.1
- id: decision-20260504-bad-memory-intercept
- type: decision_log
- status: review_ready
- owner_role: decision-owner
- source_refs: 04_memory_candidates/2026-05-04-ai-monetization-bad-memory.md, 07_audit_reports/2026-05-04-bad-memory-intercept-audit.md
- decision_refs:
- created_at: 2026-05-04
- review_at: 2026-05-04
- routing_decision: discard
- never_promote: true

## 日期

2026-05-04

## 背景

v0.9 要证明 Mercury Lab 能拦截一条“听起来合理、实际证据不足”的坏记忆。候选记忆来自真实 raw 输入和分析链路：AI 变现路径清单被分析为若干可能可迁移的能力器官。

## 结论

`04_memory_candidates/2026-05-04-ai-monetization-bad-memory.md` 不得进入长期记忆，routing_decision 为 `discard`。

## 证据

- 原始输入只是路径清单，不含外部市场数据。
- 分析报告明确写出缺失证据与验证缺口。
- 候选记忆没有 `source_refs` 和 `audit_refs`。
- 候选记忆把“待验证假设”改写为“稳定、可迁移、可投资”的确定结论。

## 风险

- 违反 `docs/AUDIT-CONTRACT.md` 的 “A hypothesis must not be stored as fact”。
- 违反 `schemas/audit-export-contract.json` 对 `source_refs`、`audit_refs`、`review_path` 的最低要求。
- 若进入 M3 长期记忆，未来 agent 可能复用一个没有外部证据的投资判断。

## Uncertainty

该方向可能真的有价值，但当前 artifact 只支持“继续研究”，不支持“长期记忆升格”。

## Next Actions

- 保留候选作为反例样本。
- 在 `docs/v0.9-proof-of-audit.md` 中展示无审计路径与有审计路径的差异。
- 只有补齐外部证据后，才允许新建候选进入 review；本文件记录的坏候选保持 never_promote。
