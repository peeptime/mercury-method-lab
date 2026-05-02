# Mercury Lab 系统成熟度评估

> 生成时间：2026-05-01 22:22 GMT+8
> 评估者：QClaw / mercury-lab skill
> 状态：已执行第一轮 P0 修复（2026-05-01）

---

## 核心问题

**Mercury Lab 目前的"系统"，实际上是由 AI 智能在驱动，而不是由 Mercury Lab 的流程在驱动。**

---

## 成熟度评估：30%

| 维度 | 完成度 | 说明 |
|------|--------|------|
| 目录结构 | ✅ 100% | raw / segmented / cleaned / uncertain 等目录定义清晰 |
| 状态机 | ✅ 100% | artifact 流转规范完整 |
| V8.0 框架 | ✅ 100% | 提示词文档完整，逻辑清晰 |
| AI 入口（AGENT_ENTRY.md） | ✅ 100% | 已创建入口文档 |
| Dashboard UX | ✅ 100% | 8项 UX 问题全部修复 |
| Skill 连接 | 🟡 50% | mercury-lab skill 已创建，但与项目内部 08_skills/ 未打通 |
| 执行脚本 | ✅ 70% | 已新增 `npm run v8:analyze`，可从文本/文件调用 LLM 并写入 raw、segmented、audit artifact |
| 自动化审计 | 🟡 45% | 已有最小 red-team audit 调用 + 结构完整性检查，但还不是独立外部验证者 |
| 事实清洗 | ❌ 0% | 没有自动化 fact-cleaner |
| 外部验证机制 | ❌ 0% | 假设标注完整度没有外部验证 |

---

## 刚才测试的真实介入水平

| 环节 | 谁做的 | AI 介入程度 |
|------|--------|-------------|
| 文件读取 | Mercury Lab（工具） | 0% |
| V8.0 分析 | Mercury Lab 脚本 + LLM API | 55% |
| 状态机流转 | Mercury Lab（规范 + artifact 写入） | 45% |
| artifact 保存 | Mercury Lab 脚本 | 80% |
| 审计闭环 | Mercury Lab 脚本 + red-team prompt | 45% |

---

## 关键发现

### 1. V8.0 框架 vs V8.0 执行

V8.0 目前是：
- ✅ **知识**（存在提示词文件里）
- ❌ **能力**（没有对应的可执行脚本）

第一轮 P0 修复后，Mercury Lab 已经可以通过 `scripts/run_v8_analysis.mjs` 显式读取 V8.0 提示词文件、装配 prompt、调用配置中的 LLM API，并写入 artifact。

仍需注意：这不是“不依赖 AI”，而是**不依赖某一个具体 AI 或智能体临场探索**。系统仍然需要一个兼容 Chat Completions 的 LLM endpoint，例如当前配置的火山方舟 `ark-coding-plan`，或未来的 OpenClaw/local-openclaw endpoint。

### 2. 假设标注完整度验证缺失

这是《创新工程实践指导》文档中暴露的问题，也是 Mercury Lab 自身的问题：
- 系统说"假设标注不完整时不得输出最终结论"
- 但没有定义"谁来判断标注是否完整"

这个缺陷在 Mercury Lab 里同样存在——AI 自己分析、自己判断、自己审计，没有外部验证者。

### 3. 自动化 vs 人工

Mercury Lab 目前更像一套**文档规范**，而不是一套**可执行的自动化系统**。

---

## 待解决问题清单

| 优先级 | 问题 | 预计解决时间 |
|--------|------|-------------|
| ✅ P0 | **设计最小可用的 V8.0 执行脚本**（不依赖具体供应商/智能体探索，仍依赖 LLM API） | 已完成 |
| 🔴 P0 | **补充假设标注完整度的外部验证机制** | 待定 |
| 🟡 P1 | **设计自动化的 fact-cleaner 模块** | 待定 |
| 🟡 P1 | **设计自动化的 redteam-auditor 反方验证流程** | 待定 |
| 🟡 P1 | **打通 mercury-lab skill 与项目内部 08_skills/** | 待定 |
| 🟢 P2 | **用真实任务测试完整闭环**（不再只依赖 AI 智能） | 待定 |

---

## 最小可用 V8.0 执行脚本的目标

已新增：

```powershell
npm run v8:analyze -- --text "要分析的原始材料" --title "材料标题"
npm run v8:analyze -- --file .\path\to\input.md --title "材料标题"
```

执行结果：

- 写入 `00_raw/`：保存原始输入，不跳过 raw 层。
- 调用 `config/model-providers.json` 的 active provider：当前为火山方舟 `ark-coding-plan`。
- 写入 `01_segmented/`：V8.0 结构化分析结果。
- 写入 `07_audit_reports/`：red-team audit 结果，包含 `validate_artifacts.mjs` 要求的审计标题。
- 默认重建 `11_indexes/source-index.json`；如只想写 artifact，可加 `--no-index`。

工程边界：

- 当前不是完全自动化事实清洗，也不是独立第三方审计。
- 当前已把“怎么调用 V8.0”固化为脚本，降低 OpenClaw/其他智能体的探索压力。
- 真实外部验证机制仍是下一阶段问题。

---

## 参考文件

- V8.0 提示词：`Z:\AI 202604\trae01\PSP-V8.0-突围者事件研判执行提示词.md`
- AGENT_ENTRY：`v8-mercury-backend/docs/AGENT_ENTRY.md`
- UX 优化报告：`v8-mercury-backend/docs/UX-OPTIMIZATION-REPORT.md`

---

*本文档由 QClaw 生成，用于 Mercury Lab 迭代参考。*
*下次迭代前请确认这些问题的有效性，部分问题可能已在最新版本中修复。*
