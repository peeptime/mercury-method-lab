# Mercury Ark Coding Plan Runbook

## 目的
用于无记忆恢复时，快速说明这次本地 Mercury 接入的关键约束、启动方式和排错点。

## 固定约束
- 只走 `https://ark.cn-beijing.volces.com/api/coding/v3`
- 禁止使用 `https://ark.cn-beijing.volces.com/api/v3`
- API key 只从环境变量 `ARK_API_KEY` 读取
- Mercury 默认模型：`doubao-seed-2.0-code`
- 低成本模型：`doubao-seed-2.0-lite`
- embedding 模型：`doubao-embedding-vision`
- 不把 `Auto` 写进本地配置
- 不把 secret 写进 markdown、yaml、脚本常量或日志

## 关键文件
- 测试脚本：[test_ark_coding_plan.mjs](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/test_ark_coding_plan.mjs)
- Mercury 启动脚本：[start_mercury_ark.ps1](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/start_mercury_ark.ps1)
- Skill 测试脚本：[run_mercury_skill_test.mjs](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/run_mercury_skill_test.mjs)
- Mercury 配置：[mercury.yaml](/C:/Users/Administrator/.mercury/mercury.yaml)

## 启动前
在当前 PowerShell 会话里设置：

```powershell
$env:ARK_API_KEY="你的火山方舟 key"
```

如需低成本模式，再设置：

```powershell
$env:ARK_MODEL="doubao-seed-2.0-lite"
```

## 验证 Coding Plan
```powershell
node "Z:\AI 202604\trae01\v8-mercury-backend\scripts\test_ark_coding_plan.mjs"
```

预期结果：只输出 `OK`

## 启动 Mercury
```powershell
powershell -ExecutionPolicy Bypass -File "Z:\AI 202604\trae01\v8-mercury-backend\scripts\start_mercury_ark.ps1"
```

## 快速检查
```powershell
npx.cmd --cache "Z:\AI 202604\trae01\.npm-cache" @cosmicstack/mercury-agent status
```

预期：
- `Provider: OpenAI`
- `Setup: complete`
- 已识别 5 个本地 skills

## 常见故障
### 1. 返回 401
- 检查当前 PowerShell 会话是否设置了 `ARK_API_KEY`
- 检查 key 是否有效

### 2. Mercury 提示 No LLM providers available
- 检查 `ARK_API_KEY` 是否已映射进当前进程
- 检查 [mercury.yaml](/C:/Users/Administrator/.mercury/mercury.yaml) 中不要写入空的 `apiKey`

### 3. 误走普通在线推理
- 检查 base URL 是否仍为 `/api/coding/v3`

### 4. skills 未识别
- 检查 `C:\Users\Administrator\.mercury\skills\` 下 5 个 skill 目录是否存在

