# Mercury Method Lab

**把 AI 输出变成可审计证据链，而不是直接写进长期记忆。**

Version: `2.0.0`

Latest release: [v2.0.0 Portable Evidence Chain](https://github.com/peeptime/mercury-method-lab/releases/tag/v2.0.0)

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

## 2.0 一句话

Mercury Method Lab 是一个面向 AI 长期记忆、Agent 输出和 FDE 交付材料的证据优先审计框架。

它不负责让 AI 产出更多，而是负责判断哪些 AI 输出有资格被保留、复用、写入项目知识库或进入客户交付。

---

## 2.0 工作流

```text
用户材料 / AI 输出
  -> 提取核心主张
  -> 生成可信证据链
  -> 标注来源、归属、置信依据
  -> 给出缺失证据 A/B/C 选择
  -> 进入记忆写入闸门
  -> accept / revise / quarantine / discard
  -> 保存为 case、报告或 skill 交接材料
```

2.0 的重点不是再做一个 dashboard，而是把 Mercury 的能力做成可迁移单元：

- `buildEvidenceChain()`：从材料生成证据链和缺失证据选择
- `auditMemoryWrite()`：在长期记忆写入前做路由判断
- `cases/2026-05/`：可复现的本地真实感案例
- `08_skills/mercury-*`：让陌生 Agent 快速复用 Mercury 的核心能力
- `benchmark:v2`：本地结构化性能基准

---

## 30 秒开始

```powershell
npm install
npm run demo:starter
npm run demo:openclaw
npm run cases:check
npm run test:evidence
npm run benchmark:v2
npm run skills:check
```

如果要打开本地界面：

```powershell
npm run dashboard
```

然后访问：

```text
http://127.0.0.1:4788/lite.html
```

Lite Mode 支持粘贴 AI 输出、拖入 `.md` / `.txt` / `.json` 材料、查看证据链、复制 Markdown 审计结果。

---

## Portable Skills

2.0 新增三个轻量 skill，目标是让别的 Agent 不需要重新理解整个仓库，也能使用 Mercury 的关键能力：

| Skill | 作用 |
|---|---|
| `mercury-evidence-chain` | 把混乱材料整理成来源可追踪的证据链，并给出缺失证据 A/B/C 选择 |
| `mercury-memory-gate` | 判断候选记忆能否写入长期系统，输出四档路由 |
| `mercury-case-capture` | 把 AI 输出、审计结果和复核状态保存成可迁移 case folder |

同步到本机 skill 目录：

```powershell
npm run sync:skills
```

验证：

```powershell
npm run skills:check
```

所有 skill 默认保留：

```yaml
human_reviewed: declined
```

它们不会替用户伪造人工复核。

---

## 与 Mercury Agent 的关系

Mercury Method Lab 不是 Mercury Agent 的 fork、插件或官方扩展。

Mercury Agent 可以是上游输出来源之一；Mercury Method Lab 是下游审计闸门。它的目标是保持 agent-agnostic：ChatGPT、Claude、Gemini、本地 Agent、OpenClaw、mem0、Zep、Letta、LangMem 风格系统都可以把输出送进 Mercury 进行结构化审计。

---

## 核心判断

```text
评分 = 这个内容看起来有多可信
准入 = 这个内容是否有资格被记住
```

Mercury 做的是第二件事。

输出路由只有四档：

```text
accept       可以进入长期记忆或项目交付
revise       有价值，但需要补证据或改写
quarantine   暂存隔离，不能进入长期系统
discard      无证据、错误、循环论证或污染风险过高，直接丢弃
```

---

## 关键文档

| 你要了解什么 | 文档 |
|---|---|
| 角色分流入口 | `docs/START-HERE.md` |
| 项目边界 | `docs/SCOPE.md` |
| 2.0 前置需求 | `docs/V2-PREFLIGHT-REQUIREMENTS.md` |
| 2.0 工作列车 | `docs/V2-WORK-TRAIN.md` |
| 2.0 性能基准 | `docs/PERFORMANCE-2.0.md` |
| SDK API | `docs/SDK-API.md` |
| 审计内核 | `docs/AUDIT-KERNEL.md` |
| 场景包 | `docs/SCENARIO-PACKS.md` |
| 适配器契约 | `docs/ADAPTER-CONTRACT.md` |
| Proof Pack 002 | `docs/PROOF-PACK-002.md` |
| Failure Modes | `docs/FAILURE-MODES.md` |
| Routing Theory | `docs/ROUTING-THEORY.md` |
| Related Work | `docs/RELATED-WORK.md` |
| OWASP AISVS C8 映射 | `docs/OWASP-AISVS-C8-MAPPING.md` |
| 与 Mercury Agent 的关系 | `docs/MERCURY-AGENT-RELATIONSHIP.md` |

---

## 本地验证

发布前必须通过：

```powershell
npm run release:gate
```

关键子检查包括：

```powershell
npm run validate
npm run index
npm run doctor
npm run cases:check
npm run test:evidence
npm run benchmark:audit
npm run benchmark:v2
npm run skills:check
```

`dist/` 是生成产物，不作为长期事实源。Markdown / YAML / JSON 才是可审计记录。

---

## 它不是什么

- 不是 second brain
- 不是 RAG 工具
- 不是通用 Agent 框架
- 不是认证机构
- 不是自动事实核查的替代品
- 不是把所有 AI 输出都变成长期记忆的工具

---

## 原则

```text
不把推测存成事实
不让 AI 自己审计自己并批准自己
不伪造 source_refs、audit_refs 或 human_reviewed:true
不把捕获材料直接当作记忆
不定义会被 Agent gaming 的成功指标
```

Mercury 的价值不是产出更多内容，而是让错误内容更难留下来。
