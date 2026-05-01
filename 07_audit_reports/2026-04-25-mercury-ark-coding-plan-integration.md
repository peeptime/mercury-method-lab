# 2026-04-25 Mercury Ark Coding Plan Integration Audit

## 被审计结论
本地 Mercury 已按最小闭环成功接入火山方舟 Coding Plan，可作为 V8.0 后台管理雏形继续使用。

## 关键假设
- Mercury 的 `openai` provider 可稳定兼容方舟 Coding Plan 的 OpenAI-compatible 接口。
- 后续继续通过环境变量注入 `ARK_API_KEY` 不会被本地配置覆盖。
- 当前 skill harness 产生的验证结果，与 Mercury 真正调用同一份 skill 指令的偏差可接受。

## 最可能错误点
- 把“Mercury 已能识别 skills + 方舟测试返回 OK”误判成“所有 Mercury 交互场景都已完全稳定”。

## 低频高损风险
- 后续有人误把 base URL 改成 `/api/v3`，导致跑到普通在线推理接口，脱离 Coding Plan 额度。
- 后续有人把 `apiKey` 直接写回 `mercury.yaml` 或 `.md`，造成 secret 管理失控。
- 后续 Mercury 升级后若配置合并逻辑变化，空值覆盖问题再次出现。

## 反证路径
- 定期复跑 [test_ark_coding_plan.mjs](/Z:/AI%20202604/trae01/v8-mercury-backend/scripts/test_ark_coding_plan.mjs)。
- 定期检查 [mercury.yaml](/C:/Users/Administrator/.mercury/mercury.yaml) 是否仍保持无 secret。
- 手工前台启动 Mercury，抽样验证 `/skills` 与实际对话调用表现。

## 替代解释
- 当前更准确的表述不是“Mercury 已完全产品化可用”，而是“Mercury 已形成本地最小可用后台闭环”。

## 需要重新取证的地方
- Mercury 在真实长对话中的稳定性
- Mercury 对 `openai` provider 的持续兼容性
- embedding 接入时是否需要额外索引脚本，而不是直接复用聊天链路

## 审计结论
保留

