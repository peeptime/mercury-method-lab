# Architecture Shift Report

## 结论

Mercury Method Lab 不是对 `cosmicstack-labs/mercury-agent` 的 fork，也不是把上游污染成本地方法系统。

更准确的关系是：

```text
Mercury Agent = runtime / channel / permission / memory / daemon
Mercury Method Lab = method / evidence / artifact / audit / deployment guide
```

这次改动的核心不是继续叠功能，而是把边界写清楚：新增 skill、PSP 人格或管理框架 Markdown 不应该再触发架构重构。它们只进入注册层、同步层或文档层。

## 上游 Mercury Agent 的稳定特征

根据上游 README 和 package 描述，Mercury Agent 的核心是：

- CLI / Telegram 多通道访问
- 24/7 daemon 与系统服务
- 权限硬化工具调用
- token budget
- Second Brain 记忆
- Agent Skills
- 多 provider fallback

参考来源：

- `https://github.com/cosmicstack-labs/mercury-agent`
- `https://raw.githubusercontent.com/cosmicstack-labs/mercury-agent/main/README.md`
- `https://raw.githubusercontent.com/cosmicstack-labs/mercury-agent/main/package.json`

上游运行数据位于 `~/.mercury/`，包括 config、skills、permissions、schedules、memory、daemon 日志等。

## 本项目的特质化方向

Mercury Method Lab 没有接管上游 runtime，而是把上游的 agent 特征特质化为一套方法实验室：

| 上游能力 | 本项目映射 | 是否接管 |
|----------|------------|----------|
| CLI / Telegram channel | 暂不接管，只提供本地 Dashboard 与 artifact 入口 | 否 |
| Permission-first tools | 转成 `config/permissions.json` 与审计规则 | 部分映射 |
| Second Brain | 转成 `04_memory_candidates/` 与迁移包 | 不直接写 upstream SQLite |
| Skills | `08_skills/` + `npm run sync:skills` | 只同步 skill 文件 |
| Scheduler | 只保留未来接口，不实现 daemon 调度 | 否 |
| Provider fallback | `config/model-providers.json` 管 API provider | 局部复用 |
| Daemon/service | 只在文档和部署准备度中提示 | 否 |

## 能力发生了什么偏移

新增能力：

- Artifact 状态机：`00_raw` 到 `07_audit_reports` 的证据闭环。
- PSP/V8 分析人格：`analysis_persona` 显式选择 V8.1 / V8.0 / V8.5。
- API / Agent 执行通道：`execution_mode` 只决定谁执行。
- V8/PSP 自动化脚本：输入文本或文件，调用 LLM，写 raw / segmented / audit。
- Dashboard：本地查看 artifact、模式、人格式、部署准备度。
- 静默批量提交：`submissions/viewpoints/` 与 `submissions/agent-queue/`。
- 外部方法文档收纳：`docs/methods/`，不再依赖工作区外路径。

弱化或删除的倾向：

- 不做上游 daemon 替代品。
- 不接管 Telegram。
- 不直接写上游 Second Brain SQLite。
- 不把 `~/.mercury/permissions.yaml` 当成本项目内部配置。
- 不把每个新增 Markdown 都升级成系统架构。
- 不让 Agent 临场猜 V8 文件、路径和输出契约。

## 是否经济

如果以后提交新的 skill 或管理框架 Markdown，不需要重构。

新增内容只按三类处理：

| 类型 | 进入位置 | 需要改架构吗 |
|------|----------|--------------|
| 新 skill | `08_skills/<name>/SKILL.md`，再运行 `npm run sync:skills` | 不需要 |
| 新分析人格 | `docs/methods/` + `config/methods.json.personas` | 不需要 |
| 新管理框架 Markdown | `docs/` 或 `09_templates/`，必要时加到 README 索引 | 不需要 |

只有满足以下条件才考虑架构修改：

1. 新增一种 artifact 生命周期状态。
2. 新增一种执行通道。
3. 新增一种上游 runtime 适配器。
4. 改变安全边界、权限边界或记忆写入边界。

## 当前版本收束原则

这一版应停止大功能叠加。

优先做：

- UI 首屏可理解。
- 部署门槛显式化。
- README / docs 指向清楚。
- 上游边界稳定。
- artifact 和 skill 不留未追踪状态。

暂不做：

- 完整 OpenClaw runtime。
- Telegram 接入。
- 云端部署。
- 多用户权限系统。
- 独立外部事实验证平台。

## 风险

最大风险不是“污染上游”，而是本项目自己膨胀成第二个 Mercury runtime。

防线是：

- runtime 留给上游或未来兼容 agent。
- 本项目只做方法、证据、审计和可迁移 artifact。
- 新增文档先注册，不急着变成代码。
