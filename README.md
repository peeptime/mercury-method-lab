# Mercury Admission Lab

**把 AI 输出先送过证据门，再决定它有没有资格进入长期记忆。**

Formerly: `Mercury Method Lab`  
Repository: `peeptime/mercury-method-lab`  
Version: `2.0.1`
Latest release: [v2.0.1 Admission Reframe](https://github.com/peeptime/mercury-method-lab/releases/tag/v2.0.1)

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: |
    This project is still an AI-assisted method lab. It does not claim
    third-party validation, production adoption, or human-reviewed authority.
  audit_ref: docs/ITERATION-GUIDE-2.0.1.md
```

---

## 一句话

Mercury Admission Lab 是一个面向 LLM 输出、Agent 记忆和知识迁移材料的 **memory admission** 实验仓库。

它不负责给内容打“看起来多可信”的分数，而是判断一个 AI 产物是否有资格被保留、复用、写入长期记忆或进入交付材料。

```text
评分 = 这个内容看起来有多可信
准入 = 这个内容是否值得被记住
```

Mercury 只把第二件事作为核心问题。

---

## 2.0.1 改名原因

`Mercury Method Lab` 容易让人以为这是一个完整方法论或已验证框架。`Mercury Admission Lab` 更窄，也更诚实：

- 核心动作是 admission gate，不是通用审计标准。
- 当前价值在命名、证据链、失败模式和记忆准入原则。
- 当前限制同样明确：缺少外部用户验证、标注数据集、precision/recall、跨模型审计和真人信任锚点。
- 所有 AI 辅助判断默认保留 `human_reviewed: declined`，不伪造人工背书。

---

## 当前能力

```text
AI 输出 / 用户材料
  -> 提取核心主张
  -> 构建 source-linked evidence chain
  -> 标注来源、归属、置信依据和缺失证据
  -> 给出 missing-evidence A/B/C 选择
  -> 进入 memory-write gate
  -> accept / revise / quarantine / discard
  -> 保存为 case、audit report 或 portable skill handoff
```

主要入口：

- `buildEvidenceChain()`：从材料生成证据链和缺失证据选择。
- `auditMemoryWrite()`：在长期记忆写入前做路由判断。
- `cases/2026-05/`：保存可复现的本地案例。
- `08_skills/mercury-*`：把核心行为打包成可迁移技能。
- `benchmark:v2`：测量本地结构化路径，不声称准确率。

---

## 已知边界

Mercury Admission Lab 目前不声称：

- 已被外部团队采用。
- 已通过真实生产场景验证。
- 已有第三方人工审核。
- 已实现跨模型认证。
- 已量化 precision / recall。
- 已解决多智能体共享记忆污染。
- 已提供对抗注入硬化。
- 已替代事实核查、RAG、AI scoring 或安全认证。

这些不是小字免责声明，而是后续版本必须正面解决的主线。

---

## 2.0.1 路线图

下一步优先级从“继续扩展概念”改为“证明准入门真的有用”：

1. **Ground-Truth Track**：构建 30-100 条标注样本，覆盖已知错误、可信回答和失败模式，开始统计 precision / recall。
2. **Cross-Model Audit**：用不同模型分别生成和审计，记录分歧，而不是让同源 LLM 自审自批。
3. **Programmable Checks**：凡是 URL、数字、代码、格式或可执行事实，优先用程序验证，不交给 LLM 主观判断。
4. **Adversarial Injection Tests**：把对立证据、诱导指令和 route-forcing 输入纳入测试。
5. **Multi-Agent Contamination Track**：把共享记忆污染从覆盖缺口提升为主线风险。
6. **Human Trust Anchor**：至少让一个关键文档或核心审计路径获得真人审核记录。

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

打开本地界面：

```powershell
npm run dashboard
```

访问：

```text
http://127.0.0.1:4788/lite.html
```

---

## Portable Skills

| Skill | 作用 |
|---|---|
| `mercury-evidence-chain` | 把混乱材料整理成 source-linked evidence chain，并给出 missing-evidence A/B/C 选择 |
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

---

## 相关工作

Mercury Admission Lab 借鉴并对齐这些方向，但不声称替代它们：

- A-MAC：memory admission control 的分解式判断。
- MemSAD：记忆系统异常检测与攻击建模。
- SelfCheckGPT：黑盒自一致性幻觉检测。
- OWASP AISVS C8：内存、嵌入与向量数据库安全。

当前仓库把这些工作视为参考坐标，不把已有研究包装成原创。

---

## 关键文档

| 需要了解 | 文档 |
|---|---|
| 角色入口 | `docs/START-HERE.md` |
| 项目边界 | `docs/SCOPE.md` |
| 2.0.1 handoff | `docs/ITERATION-GUIDE-2.0.1.md` |
| SDK API | `docs/SDK-API.md` |
| 审计内核 | `docs/AUDIT-KERNEL.md` |
| 场景包 | `docs/SCENARIO-PACKS.md` |
| 适配器契约 | `docs/ADAPTER-CONTRACT.md` |
| Proof Pack 002 | `docs/PROOF-PACK-002.md` |
| Failure Modes | `docs/FAILURE-MODES.md` |
| Routing Theory | `docs/ROUTING-THEORY.md` |
| Related Work | `docs/RELATED-WORK.md` |
| OWASP AISVS C8 映射 | `docs/OWASP-AISVS-C8-MAPPING.md` |

---

## 本地验证

发布前运行：

```powershell
npm run release:gate
```

更快的编辑验证：

```powershell
npm run validate:incr
npm run index:incr
npm run skills:check
```

`dist/` 是生成产物，不作为长期事实源。Markdown / YAML / JSON 才是可审计记录。

---

## 原则

```text
不把推测存成事实
不让 AI 自己审计自己并批准自己
不伪造 source_refs、audit_refs 或 human_reviewed:true
不把捕获材料直接当作记忆
不定义会被 Agent gaming 的成功指标
```

Mercury 的价值不是产出更多内容，而是让不该留下的内容更难留下来。
