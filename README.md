# Mercury Method Lab

Version: `0.4` — Audit Infrastructure

English entry: [README.en.md](README.en.md)

---

## AI 审计聚焦点

> 给外部评审者 / 大模型看：当审计这个项目时，请聚焦这里。

**Mercury Lab 解决了什么真实痛苦？**

> 大模型是概率模型，它的输出是"意图命中的答案"，不是"经过验证的结论"。
> 人们的认知曲线面前无法感知自己在曲线的哪个位置，因此容易陷入"愚蠢之巅"——AI 输出看起来专业，导致用户误判结论可靠，但实际没有验证逻辑。

**这不是修 bug，不是对抗 AI 进步，而是：给 AI 的判断输出提供审计基础设施。**

Mercury Lab 的护城河是**硬约束架构**，不是更好的提示词。

---

## 对外沟通语言（投资人 / 合作方）

| 不要说 | 应该说 |
|--------|--------|
| "解决幻觉" | "企业 AI 需要审计基础设施" |
| "牺牲效率" | "我们提供可问责的判断轨迹" |
| "约束架构" | "AI 需要治理层，我们是那个层" |

**核心叙事：**

| 竞品做的是 | Mercury Lab 做的是 |
|-----------|------------------|
| LangChain / AutoGen / CrewAI | AI 的**执行层** | AI 的**治理层** |
| Dify / Coze | 帮 AI 做事 | 帮 AI 的输出变得可信 |

> 没有执行层，AI 不知道做什么。没有治理层，AI 输出不知道能不能信。企业用 AI 不仅需要执行能力，还需要审计能力。Mercury Lab 是 AI 的合规层。

---

## Mercury Lab 的人格

Mercury Lab 不是"更聪明的 AI"，而是一个有判断人格的 AI 约束系统。

它的默认人格是 **V8.1 现实同频**：

- 先理解"现状为什么合理"
- 再判断"哪里出现断裂或失真"
- 不被骗，但也不相信任何人

它的核心价值：**让 AI 输出从"听起来对"变成"有据可查、有迹可循"**。

这不是分析工具，而是 AI 输出的质量门卫。

---

## 设计哲学：约束而非功能

**逆向设计：用约束而非功能来定义产品。**

大多数 AI 产品定义自己"能做什么"。
Mercury Lab 定义自己"不能做什么"。

> 禁止把推测存成事实
> 禁止同一个人既取证又审计
> 禁止跳过 artifact 层
> 禁止让同一 AI 自己判断、自己审计后直接定案

这不是功能限制，而是**把约束变成产品本身**。

当别人在卖"更聪明的 AI"时，Mercury Lab 在卖"更可靠的判断过程"。

---

## 核心差异：LLM vs Mercury Lab

**LLM 的默认优化目标：给出尽可能完整、连贯的答案。**
Mercury Lab 的设计目标：约束判断过程，并暴露不确定性。

| 维度 | LLM（默认） | Mercury Lab |
|------|------------|-------------|
| 优化目标 | 给一个"看起来合理且完整"的答案 | 让判断过程"不可跳过、可审计" |
| 行为倾向 | 补充信息、扩展论证、提高可读性 | 限制推断、暴露假设、保留不确定性 |
| 输出风格 | 连贯叙述（像顾问） | 结构化约束（像审计员） |
| 风险 | 说得越多越容易掩盖错误 | 说得越少但更容易发现问题 |
| 处理不确定性 | 被"合理解释"吸收掉 | 强制显性化（假设 / 缺证据） |

### 更本质的区别

**LLM 在优化"答案质量"**
**Mercury Lab 在优化"判断过程的可靠性"**

### 现实建议

> 不要在"选 LLM 还是 Mercury"之间做选择。

**正确用法：**

```
LLM（推理模式）生成方案 → Mercury（约束）做审计 → 人做最终决策
```

- 如果只用 Mercury：会觉得它"太慢、太保守"
- 如果只用 LLM：会逐渐发现"有些地方它说得太顺了"
- 两个一起用：LLM 负责找可能性，Mercury 负责判断哪些可能性值得信

---

Mercury 是 V8.0 的后台冰箱，不是终审法官。

现在的定位更准确地说：Mercury 是可复用的信息建筑与执行闭环底座，V8 是第一套接入的方法，不是唯一方法。

当前项目命名为 **Mercury Method Lab**：它是 Mercury Agent 兼容工作流的方法、证据、审计与迁移实验室，不是 `cosmicstack-labs/mercury-agent` 的 fork，也不是把本地目录锁死为唯一 Mercury 运行时。

## Mercury Lab 的人格

Mercury Lab 不是“更聪明的 AI”，而是一个有判断人格的 AI 约束系统。

它的默认人格是 **V8.1 现实同频**：

- 先理解“现状为什么合理”
- 再判断“哪里出现断裂或失真”
- 不被骗，但也不相信任何人

它的核心价值：**让 AI 输出从“听起来对”变成“有据可查、有迹可循”**。

这不是分析工具，而是 AI 输出的质量门卫。

## 最小启动

```powershell
npm install
npm run doctor
npm run dashboard
```

Dashboard 默认地址：`http://127.0.0.1:4788`

API 模式需要一个 LLM token。默认火山方舟 Coding Plan：

```powershell
$env:ARK_API_KEY="..."
npm run test:llm
```

部署门槛见 [docs/DEPLOYMENT-ONBOARDING.md](docs/DEPLOYMENT-ONBOARDING.md)。

## 用户提交层

普通用户不需要接触 `00_raw/` 等内部目录。公开提交入口是：

- GitHub Issue：适合不会 Git 的用户。
- `submissions/viewpoints/*.md`：适合会 Git 或本地写 markdown 的用户。
- `submissions/agent-queue/*.json`：适合 OpenClaw、爱马仕类智能体或未来 runtime 直接读取。

将观点提交转入内部原始证据层：

```powershell
npm run import:viewpoint -- submissions/viewpoints/2026-05-01-example-viewpoint.md
```

协议见 [docs/agent-first-submission-layer.md](docs/agent-first-submission-layer.md)。

如需接入火山方舟 Coding Plan：

```powershell
$env:ARK_API_KEY="..."
npm run test:ark
npm run start:ark
```

配置只从环境变量读取。不要把 `ARK_API_KEY` 写入项目文件。

## 当前架构边界

这一版已经把两个轴拆开：

- `analysis_persona`：V8.1 / V8.0 / V8.5，决定判断人格。
- `execution_mode`：API / Agent，决定执行通道。

新增 skill 或管理框架 Markdown 不需要重构架构。规则见 [docs/ARCHITECTURE-SHIFT-REPORT.md](docs/ARCHITECTURE-SHIFT-REPORT.md)。

## 分工
- Mercury Agent upstream：运行时、CLI/Telegram、权限工具、调度器、Second Brain、daemon
- Mercury Method Lab：方法路由、证据链、artifact 状态、记忆候选、决策日志、行动计划、审计报告、迁移包
- V8.0：暗面结构穿透
- fact-cleaner：事实清洗
- constraint-checker：现实约束
- equilibrium-explainer：顺向解释
- action-translator：行动落地
- redteam-auditor：反方审计

## 禁止事项
- 不允许把推测存成事实
- 不允许直接覆盖 raw 原始材料
- 不允许把所有东西都写进长期记忆
- 不允许让同一个 agent 自己取证、自己判断、自己审计后直接定案
- 不允许清理掉未解释的异常信号

## 入库流程
`inbox -> raw -> segmented -> cleaned -> uncertain -> memory_candidates -> decision_logs / action_plans / audit_reports`

`00_inbox/` 用于预入库材料：有沉淀价值、暂时不改变判断链、需要时再提取。规范见 [docs/pre-ingestion-policy.md](docs/pre-ingestion-policy.md)。

状态流转见 [docs/architecture.md](docs/architecture.md) 和 [config/state-machine.json](config/state-machine.json)。
权限配置见 [docs/permissions-and-audit.md](docs/permissions-and-audit.md) 和 [config/permissions.json](config/permissions.json)。
方法注册见 [config/methods.json](config/methods.json)，架构入口见 [config/architecture-entrypoints.json](config/architecture-entrypoints.json)。
项目定位见 [docs/project-positioning.md](docs/project-positioning.md)。
上游兼容策略见 [docs/upstream-mercury-agent-compatibility.md](docs/upstream-mercury-agent-compatibility.md)。
记忆迁移策略见 [docs/memory-architecture-migration.md](docs/memory-architecture-migration.md)。
规则路由见 [docs/rule-routing.md](docs/rule-routing.md)。

## 每次重要判断必须留下
- 原始材料
- 分割版本
- 清洗版本
- 记忆候选
- 行动计划
- 反方审计

## 本地接入说明
- Mercury 主目录：`~/.mercury/`
- Mercury skills 目录：`~/.mercury/skills/`
- 本项目目录：`v8-mercury-backend/`
- 本轮目标：先跑通本地最小闭环，不接 Telegram，不上云，不扩展到别的 agent 项目

## 火山方舟 Coding Plan 约束
- OpenAI-compatible Base URL 固定为 `https://ark.cn-beijing.volces.com/api/coding/v3`
- 禁止改成 `https://ark.cn-beijing.volces.com/api/v3`
- API key 只从环境变量 `ARK_API_KEY` 读取
- Mercury 主聊天模型默认 `doubao-seed-2.0-code`
- 低成本模式可临时设置 `ARK_MODEL=doubao-seed-2.0-lite`
- `doubao-embedding-vision` 仅用于 embedding / 检索，不作为 Mercury 主聊天模型

模型供应商统一配置在 [config/model-providers.json](config/model-providers.json)。默认 provider 是 `ark-coding-plan`，也可以用 `MERCURY_MODEL_PROVIDER` 临时切换。

已预留通用 OpenAI-compatible 与本地开源 runtime：

- `openai`
- `openai-compatible-custom`
- `local-openclaw`
- `ollama-local`
- `vllm-local`
- `lm-studio-local`

本地 provider 默认不要求 API key。托管 provider 支持 `MERCURY_API_KEY`、`OPENAI_API_KEY`、`MERCURY_OPENAI_API_KEY` 等 alias，详见 [docs/model-providers.md](docs/model-providers.md)。

## 工程入口

- `npm run check:upstream`：检查 `@cosmicstack/mercury-agent` 最新版本是否落在当前兼容策略内。
- `npm run doctor`：检查目录、脚本和运行环境。
- `npm run dashboard`：启动本地 Web GUI，默认地址 `http://127.0.0.1:4788`。
- `npm run index`：重建 JSON / SQLite 索引，供 GUI 和后续检索使用。
- `npm run import:viewpoint -- <文件>`：把 `submissions/viewpoints/*.md` 提升为 `00_raw/` 原始 artifact。
- `npm run ingest:doc -- <文件或URL> [输出名]`：可选入口，默认关闭；仅在 `MERCURY_MARKITDOWN_ENABLED=true` 时用 MarkItDown 转换外部材料并写入 `00_raw/`。
- `npm run validate`：审计 artifact 结构、必填字段和 secret 风险。
- `npm run sync:skills`：把仓库里的 `08_skills/` 同步到 Mercury 运行目录。
- `npm run test:llm`：验证当前模型供应商连通性。
- `npm run test:ark`：兼容旧命令，等同于当前 provider 测试。
- `npm run start:llm`：用当前模型供应商启动 Mercury。
- `npm run start:ark`：兼容旧命令，等同于 `start:llm`。

## 文档规范

- 架构边界：[docs/architecture.md](docs/architecture.md)
- 信息建筑蓝图：[docs/information-architecture-blueprint.md](docs/information-architecture-blueprint.md)
- 执行闭环：[docs/execution-loop.md](docs/execution-loop.md)
- 预入库规范：[docs/pre-ingestion-policy.md](docs/pre-ingestion-policy.md)
- Markdown 标准：[docs/markdown-standard.md](docs/markdown-standard.md)
- 模型供应商：[docs/model-providers.md](docs/model-providers.md)
- 判断收口规则：[docs/JUDGMENT-CLOSURE-RULE.md](docs/JUDGMENT-CLOSURE-RULE.md)
- 架构入口：[docs/architecture-entrypoints.md](docs/architecture-entrypoints.md)
- OpenClaw 预留：[docs/openclaw-integration.md](docs/openclaw-integration.md)
- 本地 GUI：[dashboard/index.html](dashboard/index.html)
- 布局与样式：[docs/layout-and-style.md](docs/layout-and-style.md)
- 权限与审计：[docs/permissions-and-audit.md](docs/permissions-and-audit.md)
- 可选集成：[config/integrations.json](config/integrations.json)
- 项目定位：[docs/project-positioning.md](docs/project-positioning.md)
- 架构偏移报告：[docs/ARCHITECTURE-SHIFT-REPORT.md](docs/ARCHITECTURE-SHIFT-REPORT.md)
- 部署上手：[docs/DEPLOYMENT-ONBOARDING.md](docs/DEPLOYMENT-ONBOARDING.md)
- 上游兼容：[docs/upstream-mercury-agent-compatibility.md](docs/upstream-mercury-agent-compatibility.md)
- 记忆迁移：[docs/memory-architecture-migration.md](docs/memory-architecture-migration.md)
- 规则路由：[docs/rule-routing.md](docs/rule-routing.md)
- 敏捷路线：[docs/agile-roadmap.md](docs/agile-roadmap.md)
- 公开发布：[docs/publication-plan.md](docs/publication-plan.md)
- 授权与来源：[docs/license-and-source-policy.md](docs/license-and-source-policy.md)
- Agent-first 提交层：[docs/agent-first-submission-layer.md](docs/agent-first-submission-layer.md)
- 用户提交指南：[docs/user-submission-guide.zh-CN.md](docs/user-submission-guide.zh-CN.md)
- GUI 入库工作流：[docs/gui-intake-workflow.md](docs/gui-intake-workflow.md)
- 系统 Wiki 判断：[docs/system-wiki-decision.md](docs/system-wiki-decision.md)
