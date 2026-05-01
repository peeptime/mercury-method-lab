# 2026-04-25 Mercury Ark Coding Plan Integration

## 日期
2026-04-25

## 背景
目标是让本地 Mercury 成为 V8.0 的结构管理后台雏形，并严格接入火山方舟 Coding Plan。

## 结论
- Mercury 不重构源码，采用最小接入方案。
- 火山方舟只走 OpenAI-compatible `https://ark.cn-beijing.volces.com/api/coding/v3`。
- API key 不写入任何项目文件，只从环境变量 `ARK_API_KEY` 读取。
- Mercury 通过 `openai` provider 接入方舟 Coding Plan。
- Mercury 默认模型使用 `doubao-seed-2.0-code`。
- 低成本模式通过运行时环境变量 `ARK_MODEL=doubao-seed-2.0-lite` 临时切换。
- `doubao-embedding-vision` 只记录为后续 embedding / 检索候选，不作为 Mercury 主聊天模型。

## 证据
- 测试脚本 [test_ark_coding_plan.mjs](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/test_ark_coding_plan.mjs) 返回 `OK`。
- Mercury 状态已识别 5 个本地 skills。
- Mercury 主目录已建立在 `C:\Users\Administrator\.mercury\`。

## 关键修正
1. 放弃 `npm -g` 作为当前主路径，改用 `npx` 运行 Mercury。
2. 修正 Mercury 配置方式：`mercury.yaml` 只保留 provider 结构、base URL、model，不写 `apiKey` 空值，避免覆盖环境变量。
3. 新增启动脚本 [start_mercury_ark.ps1](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/start_mercury_ark.ps1)，在运行时把 `ARK_API_KEY` 映射给 Mercury 识别的 `OPENAI_API_KEY`。
4. 5 个 V8.0 后台 skills 已复制到 `~/.mercury/skills/`。
5. 为了避免 Mercury 交互式 CLI 阻塞自动化测试，新增最小 skill harness [run_mercury_skill_test.mjs](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/run_mercury_skill_test.mjs) 用于回放 skill 调用。

## 风险
- Windows 全局 npm 目录权限问题仍未解决，因此当前默认启动方式仍是 `npx`。
- Mercury 交互式 CLI 适合人工前台使用，不适合当前自动化抓取。
- 未来若 Mercury 升级 provider 配置结构，需要复查 `mercury.yaml` 与环境变量映射是否兼容。

## 复查时间
2026-05-02

