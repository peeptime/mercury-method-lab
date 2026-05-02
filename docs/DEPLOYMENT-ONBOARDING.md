# Deployment Onboarding

## 最小可运行目标

新用户不需要先理解 Mercury Lab 的全部目录。

最小目标是：

```text
安装 Node -> 配置一个 LLM token -> 启动 Dashboard -> 提交文本 -> 生成 raw / segmented / audit
```

## 系统要求

| 项目 | 要求 |
|------|------|
| Node.js | 20+ |
| 操作系统 | Windows / macOS / Linux |
| Git | 推荐，用于更新和提交 artifact |
| LLM token | API 模式必需 |
| OpenClaw-like agent | 可选，仅 Agent 模式或本地 endpoint 需要 |

上游 Mercury Agent 支持 macOS LaunchAgent、Linux systemd user unit、Windows Task Scheduler。本项目不安装系统服务，只作为方法实验室运行。

## 第一次启动

```powershell
npm install
npm run doctor
npm run dashboard
```

Dashboard 默认地址：

```text
http://127.0.0.1:4788
```

## API token

默认 provider 是火山方舟 Coding Plan：

```powershell
$env:ARK_API_KEY="..."
npm run test:llm
```

长期使用可以把 `ARK_API_KEY` 设置为用户环境变量。不要把 token 写进仓库文件。

## OpenClaw-like agent 关联

OpenClaw-like agent 不是必需项。

只有在以下情况需要配置：

- 想用 `execution_mode: "agent"`。
- 想让本地 agent endpoint 执行 PSP 分析。
- 想让外部 agent 读取 `submissions/agent-queue/` 静默处理。

预留 provider：

```json
"local-openclaw": {
  "base_url_env": "OPENCLAW_BASE_URL",
  "api_key_env": "OPENCLAW_API_KEY",
  "model_env": "OPENCLAW_MODEL"
}
```

## 静默批量提交

面向人类：

```text
submissions/viewpoints/*.md
```

面向 agent：

```text
submissions/agent-queue/*.json
```

提升为 raw artifact：

```powershell
npm run import:viewpoint -- submissions/viewpoints/example.md
```

## 文档输入

Markdown 和纯文本可以直接提交。

PDF / Office / URL 转 Markdown 是可选能力，默认关闭：

```powershell
$env:MERCURY_MARKITDOWN_ENABLED="true"
npm run ingest:doc -- <file-or-url> [output-name]
```

## 新增 skill 或框架文档

新增 skill：

```text
08_skills/<skill-name>/SKILL.md
npm run sync:skills
```

新增 PSP 人格或方法文档：

```text
docs/methods/<name>.md
config/methods.json.personas
```

新增管理框架：

```text
docs/<name>.md
```

这些操作不需要重构架构。只有改变 artifact 生命周期、执行通道、runtime 适配器或安全边界时，才需要架构评审。

## 发布前建议

这一版先收束：

1. Dashboard 能显示部署准备度。
2. README 能说明最小运行路径。
3. Skill 同步路径明确。
4. API token / OpenClaw / 批量提交 / OS 支持都写清楚。
5. 不再叠加大型 runtime 功能。
