# Mercury Method Lab

Version: `0.2.0` — Open Orbit

English entry: [README.en.md](README.en.md)

Mercury 是 V8.0 的后台冰箱，不是终审法官。

现在的定位更准确地说：Mercury 是可复用的信息建筑与执行闭环底座，V8 是第一套接入的方法，不是唯一方法。

当前项目命名为 **Mercury Method Lab**：它是 Mercury Agent 兼容工作流的方法、证据、审计与迁移实验室，不是 `cosmicstack-labs/mercury-agent` 的 fork，也不是把本地目录锁死为唯一 Mercury 运行时。

## 快速开始

```powershell
npm run doctor
npm run check:upstream
npm run validate
npm run index
npm run sync:skills
npm run test:llm
npm run dashboard
```

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
- 架构入口：[docs/architecture-entrypoints.md](docs/architecture-entrypoints.md)
- OpenClaw 预留：[docs/openclaw-integration.md](docs/openclaw-integration.md)
- 本地 GUI：[dashboard/index.html](dashboard/index.html)
- 布局与样式：[docs/layout-and-style.md](docs/layout-and-style.md)
- 权限与审计：[docs/permissions-and-audit.md](docs/permissions-and-audit.md)
- 可选集成：[config/integrations.json](config/integrations.json)
- 项目定位：[docs/project-positioning.md](docs/project-positioning.md)
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
