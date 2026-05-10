# Mercury Method Lab

**不让聪明变成垃圾。**

Version: `2.0.0-alpha.1`

Latest release: [v2.0.0-alpha.1 Evidence Chain Preflight](https://github.com/peeptime/mercury-method-lab/releases/tag/v2.0.0-alpha.1)

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: |
    Project-level provenance reflects the lowest-reviewed referenced component.
    Until referenced docs are human-reviewed, the project README cannot claim true.
  audit_ref: docs/REVIEW-LEDGER.md
```

---

## 2.0 Alpha Direction

Mercury 2.0 moves from an author-centered method repository toward a portable AI audit framework.

The controlling goal is:

```text
messy user material
  -> credible evidence chain
  -> source attribution and confidence basis
  -> missing-evidence choices
  -> durable case/review record
  -> portable output for humans, agents, and skills
```

`docs/ITERATION-STRATEGY-V2.md` is treated as lower-weight historical strategy input: Mercury keeps its diagnosis about real integrations, real cases, and review flywheels, but does not inherit unsupported hard-freeze restrictions.

See `docs/V2-PREFLIGHT-REQUIREMENTS.md` and `docs/V2-WORK-TRAIN.md`.

---

## Proof Governance v1.9.0

Mercury now has a second proof pack and governance controls for the cases most likely to break a portable audit framework:

- multi-agent memory contamination
- stale truth reused as current memory
- test-passing-but-wrong code claims
- chart and data overclaim
- human-review disagreement
- audit gaming attempts

The SDK also exposes anti-gaming detection and ruleset-version helpers so host systems can re-audit old accepted memories when the audit standard changes.

See `docs/PROOF-PACK-002.md`, `docs/RULE-VERSION-GOVERNANCE.md`, `docs/MEMORY-LIFECYCLE-GOVERNANCE.md`, `docs/HUMAN-REVIEW-DISAGREEMENT.md`, and `docs/ANTI-GAMING-TESTS.md`.

---

## Scenario Packs v1.8.0

Mercury 现在提供可复用场景包，让不同场景使用不同证据要求：

- `ai-coding`
- `personal-knowledge`
- `investment-research`
- `enterprise-delivery`
- `legal-medical-risk`

SDK 可以传入 `scenario`，自动得到场景默认 profile / standard，以及面向人的 review guidance。

看 `docs/SCENARIO-PACKS.md`、`docs/ADAPTER-CONTRACT.md`、`docs/REVIEW-UX-GUIDE.md`。

---

## Audit Kernel v1.7.0

Mercury 现在把可迁移审计判断从作者本地工作流里拆出来。

SDK 会经过一个可配置 audit kernel：

- audit profiles
- audit standards
- source credibility floors
- memory lifecycle checks
- reviewer disagreement handling

看 `docs/AUDIT-KERNEL.md`、`docs/ECOSYSTEM-POSITION.md`、`docs/MERCURY-AGENT-RELATIONSHIP.md`。

Mercury Method Lab 不是 Mercury Agent 的 fork、插件或官方扩展。Mercury Agent 可以是上游输出来源之一；audit kernel 本身要保持 agent-agnostic。

---

## Pre-Storage SDK v1.6.0

Mercury 现在有一个本地 SDK 入口，给 Agent / memory system 在写入长期记忆前调用：

```js
import { auditMemoryWrite, shouldWriteMemory } from "mercury-method-lab";

const result = auditMemoryWrite({
  content: "AI-generated memory candidate...",
  source_refs: ["conversation:source"],
  audit_refs: ["review:gate"],
  risk_level: "low"
});

if (shouldWriteMemory(result)) {
  await memoryStore.write(result.packet.claim, result.provenance);
}
```

本地验证：

```powershell
npm run demo:memory-hook
npm run benchmark:audit
```

看 `docs/SDK-API.md`、`docs/INTEGRATION-DEMO.md`、`docs/BENCHMARKS.md`、`docs/OWASP-AISVS-C8-MAPPING.md`。

---

## Start Here

新用户先读 `docs/START-HERE.md`。

最短路径：

```powershell
npm run dashboard
```

然后打开：

```text
http://127.0.0.1:4788/lite.html
```

粘贴一段 AI 输出，点击 `开始检查`。

默认第一层只显示：

- 处理方式
- 内容摘要
- Human Review Checklist 的 A/B/C 选项
- 技术详情折叠展示

---

## Human Review UX v1.5.0

这个版本把 `human_review_required: true` 从“到此为止”改成“下一步怎么复核”。

- Audit result 新增 `content_summary`。
- Audit result 新增 `human_review_checklist`。
- HTML report 显示 A/B/C 复核选项，并可复制 review record。
- Lite Mode 默认使用中文用户可见层，内部字段放进 `查看技术详情`。
- `docs/SCOPE.md` 明确 Mercury 不做数据库、second brain、存储后端或认证机构。
- `docs/EXPORT-GUIDE.md` 说明 Markdown/JSON/HTML 如何进入外部工具，但 raw capture 不能直接当记忆。

---

## One Sentence

Mercury Method Lab 是一个面向 AI 长期记忆、Agent 输出和 FDE 交付物的证据优先审计层。

它不负责让 AI 更能干活，而是负责判断 AI 干出来的东西是否有资格留下来。

---

## 30 秒判断锚点

```
input: a plausible-sounding AI conclusion
gate:  source_refs present? ❌  audit_refs present? ❌
routing_decision: discard
reason: hypothesis cannot be promoted without evidence
output: archived proof, no runtime DB write
```

```
✅ Mercury Lab runs this check before anything enters long-term memory
❌ Most memory tools skip the check and promote everything
```

---

## Method Blueprint v1.4.0

This release moves the center of gravity from "tool surface" to "reference method":

- `docs/FAILURE-MODES.md` now groups the 22 modes into five top-level families.
- `docs/ROUTING-THEORY.md` explains why Mercury uses `accept / revise / quarantine / discard`.
- `docs/PROOF-PACK-COVERAGE-MATRIX.md` shows what Proof Pack 001 covers and which cases are still missing.
- `docs/RELATED-WORK.md` places Mercury beside hallucination detection, fact verification, data quality, provenance, and AI risk work.
- `docs/AGENT-AUDIT-BLUEPRINT.md` gives teams a practical adoption guide without forcing this repository's exact structure.

Mercury is not claiming to be a certification authority. It is a blueprint other agent and memory-system builders can inspect, cite, adapt, or improve.

---

## Have An AI Conversation To Audit?

Fastest path:

```powershell
npm run capture -- --file examples/ai-conversation-capture.md
```

Paste path:

```powershell
npm run dashboard
```

Then open `http://127.0.0.1:4788/lite.html`, paste an AI answer, click `开始检查`, and click `保存来源` only if you want Mercury to preserve the source plus a temporary Audit Packet.

Dropzone path:

```text
00_inbox/ai-conversations/
```

Put a `.md` or `.txt` AI conversation there, then run:

```powershell
npm run capture:dropzone
```

Captured material starts as source evidence, not memory:

```yaml
human_reviewed: declined
audit_refs: []
risk_level: high
```

See `docs/THREE-MINUTE-START.md`.

---

## Proof Pack 001

Cycle 02 的方法层规则写在 `docs/CYCLE-02-COMMITMENT.md`：不新增主要框架名，不伪造 human review，不伪造 charter users，先把 Proof Pack 001、Failure Mode Dictionary、review ledger 和 charter user records 做实。

`v1.3.0` 是一次单独记录的产品层解冻，范围限定在 dashboard / Lite Mode / 设置与入口体验，见 `docs/PRODUCT-SURFACE-PRESSURE-TEST.md`。
`v1.3.1` 继续保持 patch 线，只补 Lite / dropzone capture，并在 `docs/REVIEW-LEDGER.md` 里记录 Cycle 02 版本线债务，不把它粉饰成已经履约。
`v1.4.0` 是方法论深挖版本：taxonomy、routing theory、coverage matrix、related work 和 implementer blueprint；不新增 dashboard 功能。

低 token 复位入口：

```powershell
npm run cycle:status
npm run cycle:check
```

短期重启不做功能膨胀，先积累真实拦截判例。

`docs/PROOF-PACK-001.md` 记录第一组坏记忆审计样本：每个案例说明原始叙事为什么可信、缺什么证据、如果进入长期记忆会造成什么污染，以及 Mercury 应该如何路由。

---

## Evidence-First Audit Packets

`examples/audit-packets/` 里有可运行的审计包样例：

```powershell
npm run audit    # 生成 dist/audit-results.json
npm run audit:flow # 生成 dist/memory-flow/ 路由模拟
npm run report   # 生成 dist/reports/index.html
npm run test     # 验证四类 routing decision 和 HTML 输出
npm run audit:profile # 输出本地审计性能概况
npm run cycle:status # 低 token 查看 Cycle 02 状态
npm run cycle:check  # 检查 proof/failure/review 结构
```

审计输出使用四档路由：

```text
accept / revise / quarantine / discard
```

Markdown/YAML 是可信记录，HTML 是给人看的交付层。

---

## Agent Audit Blueprint

For teams building agents or memory systems, the reusable control point is:

```text
before_write(memory_entry):
  require source_refs
  require audit_refs or quarantine
  classify failure_modes
  choose routing_decision
  record provenance
  only write when routing_decision == accept
```

Start with `docs/AGENT-AUDIT-BLUEPRINT.md`, then use `docs/ROUTING-THEORY.md` when route decisions are disputed.

---

## Product Surface v1.3.x

`v1.3.x` 把 Mercury 的工程入口向真实产品推进一步，但不降低审计门槛：

```powershell
npm run dashboard       # Full Dashboard: settings / onboarding / notifications / artifacts
npm run capture:check   # Verify Lite/dropzone capture keeps review declined
npm run dashboard:check # 静态检查产品层和 Lite Mode
```

本地启动后：

```text
Full Dashboard: http://127.0.0.1:4788
Lite Mode:      http://127.0.0.1:4788/lite.html
```

- `dashboard/lite.html` 是单文件 Lite Mode，支持粘贴、URL prefill、审计、查看结果、复制 Markdown 和可选 source capture。
- `00_inbox/ai-conversations/` 是 `.md` / `.txt` AI 对话 dropzone。
- Full Dashboard 新增 7 类 Settings、首次引导、命令面板、图标系统、toast/系统通知和可恢复错误 UI。
- 所有 Lite / capture 输出默认保留 `human_reviewed: declined`，不绕过审计契约。

---

## 它不是什么

- 不是 second brain
- 不是 RAG 工具
- 不是 AI 写作助手
- 不是通用 Skill 框架
- 是一道入脑前审计闸门

---

## 发布验收（必须通过才能 release）

```powershell
npm run validate   # 审计所有 artifact 的 provenance 声明
npm run index     # 重建 JSON 索引
npm run doctor    # 诊断系统状态
npm run capture:check # capture path must preserve declined review state
npm run release:gate # 当前版本发布门禁
```

这些检查通过，才说明当前处于可复现状态。

---

## 这个问题你有没有

你和 AI 聊了一个小时，生成了很多听起来很厉害的想法。

然后呢？

然后它们就停在聊天记录里了。隔两周你再去找，要么找不到了，要么找得到但已经不记得当时为什么觉得它很厉害了。

Mercury Lab 就是来解决这个的。

---

## 核心原则

```
❌ 不允许把推测存成事实
❌ 不允许同一个人既写材料又审计材料
❌ 不允许跳过质检直接进记忆
❌ 不允许让 AI 自己判断、自己审计、自己通过
❌ 不定义可被 agent 读取的"成功指标"（这会变成 gaming 目标）
```

---

## v0.9.0 新增：方法论自洽性

> **这是 v0.9.0 最重要的变化。**

### AI 协作悖论 → 已修复

项目规则说"不允许 AI 自审"，但 CHANGELOG 自承"AI 协作完成"。这是审计悖论。

**修复方式：**

```
问题不在"AI写了"，在于"写了但没声明"。

所有产出现在必须有 provenance 声明：
  [AI_GENERATED]   ← AI起草，有 human review
  [HUMAN_ONLY]     ← 纯人工，无AI参与
  [AI_ASSISTED]    ← AI辅助，human审核
```

详见 `docs/METHODOLOGY-INTEGRITY.md`

### 必然攻击的需求 → 已识别

试图定义"审计成功指标"（如 promote率 < 15%）时发现：

> **任何可被 agent 读取的量化成功指标，都会成为 gaming 目标。**

正确的审计方向不是测量"成功达到某个百分比"，而是检测"特定失败模式的缺失"。

详见 `docs/AUDIT-METRICS-DECLINED.md`

---

## 快速开始

```powershell
npm install
npm run doctor       # 诊断系统状态
npm run audit        # 审计 Audit Packet 样例
npm run audit:flow   # 模拟 accept/revise/quarantine/discard 流向
npm run report       # 生成 HTML 审计报告
npm run test         # 跑审计闭环测试
npm run audit:profile # 查看本地审计性能
npm run cycle:status # 查看 Cycle 02 状态
npm run cycle:check  # 检查 Cycle 02 结构
npm run validate     # 审计 provenance
npm run index        # 重建索引
npm run dashboard    # http://127.0.0.1:4788
```

---

## 看一个端到端案例

`docs/v0.9-proof-of-audit.md` 展示了完整的拦截链路：

```
一段真实AI对话
  → 进入 00_raw/
  → 经过 fact-cleaner / redteam-auditor / constraint-checker
  → 04_memory_candidates/ 标记 routing_decision = discard
  → 05_decision_logs/ 记录 never_promote 违反原因
  → 07_audit_reports/ 生成审计报告
  → 10_exports/demo-preaudit-bundle.json 输出审计包
```

任何人都能在 15 分钟内走完这条路。

---

## 它的工作流（最小 4 层）

```
00_raw/                    ← 原始材料入口
  ↓ fact-cleaner / redteam-auditor
04_memory_candidates/      ← routing_decision: discard / archive / review / promote
  ↓ audited
07_audit_reports/         ← 审计轨迹（不可伪造）
  ↓ approved
长期记忆（OpenClaw / gbrain / Mercury Agent）
```

完整 12 层目录结构见 `docs/MINIMAL-WORKFLOW.md`

---

## 项目是怎么工作的

```
收到一个想法
  → 先问：它到底是什么？（事实 / 推测 / 假设）
  → 再问：它通过了质检吗？
  → 通过了 → 进样本库，可以被以后调用
  → 没通过 → 存档，但不进长期记忆

不是所有东西都需要被执行。有的写下来就够了。
```

---

## 文档索引

| 你要做什么 | 去哪里 |
|-----------|--------|
| 先从这里开始 | `docs/START-HERE.md` |
| 看 audit kernel | `docs/AUDIT-KERNEL.md` |
| 看场景包 | `docs/SCENARIO-PACKS.md` |
| 看 adapter contract | `docs/ADAPTER-CONTRACT.md` |
| 看复核 UX 指南 | `docs/REVIEW-UX-GUIDE.md` |
| 看生态位置 | `docs/ECOSYSTEM-POSITION.md` |
| 看与 Mercury Agent 的关系 | `docs/MERCURY-AGENT-RELATIONSHIP.md` |
| 看本地 SDK API | `docs/SDK-API.md` |
| 看 memory-write hook demo | `docs/INTEGRATION-DEMO.md` |
| 看本地 benchmark 说明 | `docs/BENCHMARKS.md` |
| 看 OWASP AISVS C8 映射 | `docs/OWASP-AISVS-C8-MAPPING.md` |
| 看项目边界 | `docs/SCOPE.md` |
| 看导出方式 | `docs/EXPORT-GUIDE.md` |
| 看中文/i18n 可见层规则 | `docs/I18N-UX-POLICY.md` |
| 看端到端拦截案例 | `docs/v0.9-proof-of-audit.md` |
| 看最小工作流 | `docs/MINIMAL-WORKFLOW.md` |
| 看前置审计契约 | `docs/AUDIT-CONTRACT.md` |
| 看 AI 协作悖论修复 | `docs/METHODOLOGY-INTEGRITY.md` |
| 看"为什么不能定义成功指标" | `docs/AUDIT-METRICS-DECLINED.md` |
| Agent audit blueprint | `docs/AGENT-AUDIT-BLUEPRINT.md` |
| Routing theory | `docs/ROUTING-THEORY.md` |
| Proof Pack coverage matrix | `docs/PROOF-PACK-COVERAGE-MATRIX.md` |
| Related work | `docs/RELATED-WORK.md` |
| 看 Evidence-First Audit Packet 闭环 | `docs/EVIDENCE-FIRST-AUDIT-LAYER.md` |
| 看 HTML 审计报告样例 | `dist/reports/index.html`（运行 `npm run report` 后生成） |
| 3 分钟 AI 对话 intake | `docs/THREE-MINUTE-START.md` |
| 看 v2.0 alpha preflight guide | `docs/ITERATION-GUIDE-2.0.0-alpha.1.md` |
| 看 v1.9.0 proof governance guide | `docs/ITERATION-GUIDE-1.9.0.md` |
| 看 v1.8.0 scenario iteration guide | `docs/ITERATION-GUIDE-1.8.0.md` |
| 看 v1.7.0 kernel iteration guide | `docs/ITERATION-GUIDE-1.7.0.md` |
| 看 v1.6.0 SDK iteration guide | `docs/ITERATION-GUIDE-1.6.0.md` |
| 看产品层压力测试记录 | `docs/PRODUCT-SURFACE-PRESSURE-TEST.md` |
| 继续迭代/讨论项目 | 激活 `mercury-v8-iter` Skill |
| 看版本历史 | `CHANGELOG.md` |
| 看完整样本链 | `examples/` |
| 了解治理原则 | `docs/GOVERNANCE.md` |

---

## 技术栈

- Node.js + 原生 `node:http`（无框架依赖）
- Markdown/YAML 作为唯一 source of truth
- JSON Schema 验证 artifact 结构
- `npm run` 作为唯一命令入口
- 支持 OpenClaw agent 直接调用
