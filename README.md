# Mercury Method Lab

**不让聪明变成垃圾。**

Version: `1.2.1`

```yaml
provenance:
  authors: project_owner + QClaw
  ai_assisted: true
  human_reviewed: true
  reviewer: project_owner
  audit_ref: docs/METHODOLOGY-INTEGRITY.md
```

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

## Proof Pack 001

Cycle 02 的当前规则写在 `docs/CYCLE-02-COMMITMENT.md`：不发 `v1.3.0`，不新增主要框架名，先把 Proof Pack 001、Failure Mode Dictionary、review ledger 和 charter user records 做实。

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
npm run release:gate # 1.0.0 冻结期发布门禁
```

三步通过，才说明当前处于可复现状态。

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
| 看端到端拦截案例 | `docs/v0.9-proof-of-audit.md` |
| 看最小工作流 | `docs/MINIMAL-WORKFLOW.md` |
| 看前置审计契约 | `docs/AUDIT-CONTRACT.md` |
| 看 AI 协作悖论修复 | `docs/METHODOLOGY-INTEGRITY.md` |
| 看"为什么不能定义成功指标" | `docs/AUDIT-METRICS-DECLINED.md` |
| 看 Evidence-First Audit Packet 闭环 | `docs/EVIDENCE-FIRST-AUDIT-LAYER.md` |
| 看 HTML 审计报告样例 | `dist/reports/index.html`（运行 `npm run report` 后生成） |
| 看 v1.0 冻结指南 | `docs/ITERATION-GUIDE-1.2.1.md` |
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
