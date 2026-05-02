# Analysis Persona Design

## 背景

这次调整修复一个架构污染点：把 `V8.0` 当成执行模式，会让系统把两件事混在一起。

- `V8.0` / `V8.1` / `V8.5` 是分析人格，决定判断姿态。
- `api` / `agent` 是执行通道，决定谁来消耗 token、谁来写 artifact。

如果两个轴线混在一起，Agent 会把 V8.0 的“先怀疑表面解释”和 V8.1 的“先解释现实均衡”同时当成主流程，输出就容易变成：不会被骗，但也不相信任何人，最终判断犹豫。

## 设计决策

默认人格改为 `v8.1-reality-sync`。

V8.1 的作用不是削弱 V8.0，而是给 V8.0 加现实同频的前置秩序：

1. 先解释当前均衡为什么成立。
2. 承认主流定价、主流偏好、主流行为不是随机噪音。
3. 再判断哪里出现失真、错配、断裂或伪共识。
4. 只有发现可改写路径时，才进入强批判和突围判断。

## 配置

配置文件：`config/methods.json`

```json
{
  "active_method": "v8",
  "analysis_persona": "v8.1-reality-sync",
  "execution_mode": "api"
}
```

字段边界：

| 字段 | 作用 |
|------|------|
| `active_method` | 选择 Mercury Lab 的方法族和 artifact flow |
| `analysis_persona` | 选择 PSP 分析人格 |
| `execution_mode` | 选择执行通道 |

## 人格注册

| 人格 | 状态 | 用途 |
|------|------|------|
| `v8.1-reality-sync` | active | 默认主分析人格，先同频现实均衡，再判断断裂和杠杆 |
| `v8.0-breakthrough` | reserved | 强叙事污染、伪结构、伪权力、伪杠杆识别 |
| `v8.5-correction` | reserved | 审计过度聪明、概念偷换、伪深刻 |

## 执行纪律

一次主分析只加载当前 `analysis_persona` 的主提示词。

不要在主流程里同时加载 V8.0、V8.1、V8.5，再让模型自己融合。融合不是稳定能力，会把“怀疑一切”和“解释均衡”混成不敢下判断。

V8.0 可以作为切换人格使用；V8.5 可以作为审计人格使用。它们不再默认挤进 V8.1 主分析。

## 对 OpenClaw / 外部 Agent 的意义

外部智能体不需要理解 Mercury Lab 的所有历史文档。它只需要：

1. 读取 `config/methods.json`。
2. 确认 `analysis_persona`。
3. 确认 `execution_mode`。
4. API 模式调用 `npm run v8:analyze`。
5. Agent 模式按当前人格落盘并审计。

这样 Mercury Lab 不再把“怎么跑”和“以谁的判断姿态跑”交给外部智能体猜。
