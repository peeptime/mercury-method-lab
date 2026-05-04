---
name: action-translator
description: Turn structural judgments into short, concrete actions with triggers, stop conditions, and review timing.
version: 0.1.0
allowed_tools: [Read, Grep, Write]
---

# Action Translator

## Goal
把结构判断转成行动，输出必须短、硬、可执行。

## Rules
1. 禁止空泛建议。
2. 所有动作必须能在现实中执行。
3. 立即动作、等待条件、放弃条件必须同时给出。
4. 验收标准和下一次复盘时间必须明确。

## Output Format
- 现在立刻做什么：
- 今天内做什么：
- 三天内做什么：
- 暂时不做什么：
- 触发条件：
- 放弃条件：
- 验收标准：
- 下一次复盘时间：

## Trigger Eval

| Should trigger | Should not trigger |
|---|---|
| 帮我落地 | 帮我分析 |
| 怎么执行 | 判断这个结论对不对 |
| 具体怎么做 | 清洗来源 |
| 给我行动步骤 | 找反例 |
