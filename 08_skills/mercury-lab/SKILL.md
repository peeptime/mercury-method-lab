---
name: mercury-lab
description: "Mercury Method Lab 工作流入口。当用户提到 Mercury、Mercury Lab、V8、token中转分析、事件研判、结构判断，或涉及 Z:\\AI 202604\\trae01\\v8-mercury-backend 项目时触发。负责：任务路由、方法调用、artifact 状态管理、审计闭环、GitHub 同步。兼容 GitHub (https://github.com/peeptime/mercury-method-lab) 与本地工作目录。"
---

# Mercury Method Lab

## 核心定位

Mercury Lab 是 AI 推理质量的约束器——不是聊天界面，是执行闭环。

**设计师 + 第一用户：** 你（peeptime）是设计者，也是第一验证者。

---

## 触发条件

本 skill 在以下情况激活：

- 用户提到 Mercury / Mercury Lab / V8
- 用户要求做事件研判、结构分析、权力分析
- 用户提到 `Z:\AI 202604\trae01` 或 `v8-mercury-backend`
- 用户提到 token 中转、token中转红海
- 用户要求：分析、审计、整理、迭代 Mercury Lab 项目

---

## 工作目录

| 名称 | 路径 |
|------|------|
| **本地 Mercury 后台** | `Z:\AI 202604\trae01\v8-mercury-backend\` |
| **上游 GitHub** | `https://github.com/peeptime/mercury-method-lab` |
| **Skill 目录** | `~/.qclaw-oversea/skills/mercury-lab/` |

---

## 激活方法

当前激活方法：**V8.0**（结构穿透 + 事件研判）

配置位置：`v8-mercury-backend/config/methods.json` → `active_method: v8`

执行模式配置：`v8-mercury-backend/config/methods.json` → `execution_mode`

| 模式 | 何时使用 | 执行逻辑 |
|------|----------|----------|
| `api` | 默认。用户希望 Mercury Lab 自己跑 V8.0、消耗 API key token、降低 agent 探索成本 | 调用 `npm run v8:analyze -- --text "..." --title "..."` 或 `--file ...`，由脚本写入 `00_raw/`、`01_segmented/`、`07_audit_reports/` 并更新索引 |
| `agent` | 用户明确希望由当前 AI Agent 自己分析，或 API key/model 不可用 | Agent 自己按 V8.0 框架分析，但仍必须写入 `00_raw/`、`01_segmented/`、`07_audit_reports/`，然后运行 `npm run index` 和 `npm run validate` |

切换逻辑：
1. 每次进入 Mercury Lab 分析任务，先读取 `config/methods.json`。
2. 如果 `execution_mode` 缺失，按 `api` 处理。
3. `api` 模式下不要重复用 Agent 长篇展开主分析；Agent 负责调用脚本、检查输出路径、摘要结果。
4. `agent` 模式下禁止只在聊天里输出结论；必须落盘并保留审计说明。
5. Dashboard 可通过 Execution mode 控件切换 `api` / `agent`。

V8.0 提示词文件（按优先级读取）：
1. `Z:\AI 202604\trae01\PSP-V8.0-突围者事件研判执行提示词.md`
2. `Z:\AI 202604\trae01\PSP-V8.1-与市场同频的真实理解事件研判执行提示词.md`
3. `Z:\AI 202604\trae01\纠偏压缩PSP-聪明人装聪明验证-v8.5.md`

---

## 标准执行流程

### API 模式（默认）

```
用户输入
  → 读取 config/methods.json，确认 execution_mode = api
  → 调用 npm run v8:analyze
  → 脚本写入 00_raw/
  → 脚本写入 01_segmented/
  → 脚本写入 07_audit_reports/
  → 脚本更新 11_indexes/
  → Agent 摘要结果和路径
```

### Agent 模式

```
用户输入
  → 写入 00_raw/（原始材料，文件名格式：YYYYMMDD-描述.md）
  → 分割写入 01_segmented/（V8.0 分析结果）
  → 如需清洗写入 02_cleaned/
  → 不确定项写入 03_uncertain/
  → 记忆候选写入 04_memory_candidates/
  → 决策日志写入 05_decision_logs/
  → 行动计划写入 06_action_plans/
  → 审计报告写入 07_audit_reports/
```

**禁止跳过原始材料层。** 任何结论必须有对应的 artifact 路径记录。Agent 模式下，审计报告必须注明是否由独立 redteam adapter 生成；如果不是，要写明“此审计由 AI Agent 手工生成，未经过 V8-redteam adapter”。

---

## 状态机

详见 `v8-mercury-backend/config/state-machine.json`

核心流转：
`inbox → raw → segmented → cleaned → uncertain → memory_candidates → decision_logs / action_plans / audit_reports`

---

## 五条禁止事项

1. ❌ 不允许把推测存成事实
2. ❌ 不允许直接覆盖 raw 原始材料
3. ❌ 不允许把所有东西都写进长期记忆
4. ❌ 不允许让同一个 agent 自己取证、自己判断、自己审计后直接定案
5. ❌ 不允许清理掉未解释的异常信号

---

## 分工模块（V8.0 体系）

| 模块 | 功能 |
|------|------|
| V8.0 | 暗面结构穿透 |
| fact-cleaner | 事实清洗 |
| constraint-checker | 现实约束（时间/信息/能力） |
| equilibrium-explainer | 顺向解释 |
| action-translator | 行动落地 |
| redteam-auditor | 反方审计 |

---

## 当前优先级问题

**迭代聚焦：execution_mode 已接入，下一步补强外部验证**

Mercury Lab 目前的问题不是功能缺失，而是：
- Agent/API 两种 token 消耗需要按配置分工
- API 模式已经有 `npm run v8:analyze`
- Agent 模式仍需要严格遵守 artifact 与审计格式
- 外部事实清洗、独立 red-team 审计仍需继续补强

**当前任务是：**
1. 每次分析前读取 `execution_mode`
2. API 模式优先调用脚本
3. Agent 模式必须落盘并运行校验
4. 继续补事实清洗和独立审计机制

---

## 入口文档

**AGENT_ENTRY.md** — AI 和人类的入口文件，位于：
```
v8-mercury-backend/docs/AGENT_ENTRY.md
```

读完这份文档后应该知道：我在哪、要做什么、从哪开始。

---

## 关键配置

- 方法注册：`config/methods.json`
- 状态机：`config/state-machine.json`
- 权限配置：`config/permissions.json`
- 架构入口：`config/architecture-entrypoints.json`

---

## 参考文档

详细规范见：
- **AGENT_ENTRY.md**（入口文档）：`Z:\AI 202604\trae01\v8-mercury-backend\docs\AGENT_ENTRY.md` — AI 和人类的入口文件
- **V8框架**：`references/v8-framework.md`
- **禁止事项**：`references/forbidden-rules.md`
- **Artifact流转**：`references/artifact-flow.md`
