# Agent Queue

This directory is for agent-readable envelopes.

OpenClaw, Hermes-like agents, or future runtimes can inspect these files and decide whether to:

- validate a submission
- promote it into `00_raw/`
- run a route from `config/rule-routing.json`
- create a memory candidate
- request human review

Queue files should be JSON and should not contain secrets.

## Context Budget Rule

Agent queue files are task packs, not invitations to inspect the whole repository.

When a queue file includes `context_mode: "closed_task_pack"` or `context_policy`, the agent must:

- start from the queue JSON itself
- use embedded `source_text` before opening `raw_artifact`
- read only paths listed in `context_policy.allowed_reads`
- write only paths listed in `requested_outputs` or `context_policy.write_targets`
- avoid `docs/`, `00_raw/`, `01_segmented/`, `07_audit_reports/`, `11_indexes/`, and `.git/` except for explicitly listed paths
- stop and request human review if more context is needed

The goal is to prevent Agent mode from spending most of its intelligence budget rediscovering the project.

### `/goal` 照妖镜集成

Agent 模式在读取 queue JSON 后、启动 PSP 分析之前，必须先运行 `/goal` 5 维度验证。

```
读取 queue JSON
  ↓
验证 source_text 是否通过 5 维度
  ↓
  ├─ 不通过 → 返回照妖镜问题到对话，不写盘，不推进分析
  └─ 通过   → 继续分析，生成 action_plan（含四关检验 + Judgment Closure）
```

**注意**：`goal-validator` 的验证逻辑应内嵌到 Agent 上下文中，不调用 `scripts/goal-validator.mjs` 新建进程。

### Stop Rule（Context Budget 补充）

当 queue JSON 内的 `source_text` 不完整且未通过 5 维度验证时，Agent **必须停止**并请求人工复核，不得用全项目扫描补上下文。

Example:

```json
{
  "schema_version": "0.1",
  "task_type": "promote-submission",
  "source_path": "submissions/viewpoints/2026-05-01-example.md",
  "preferred_route": "factual-cleaning",
  "requested_outputs": ["raw_artifact", "routing_recommendation"],
  "human_review_required": true
}
```
