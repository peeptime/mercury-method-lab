# Mercury Method Lab

**面向高频 AI 对话者的"洞察样本沉淀系统"。**

主打的是：**不让聪明变成垃圾。**

Version: `0.8.0`

English entry: [README.en.md](README.en.md)

---

## 3 分钟看懂

从这里开始，不需要先理解整套方法论：

- [DEMO.md](DEMO.md)：一段混乱想法如何变成可复盘项目材料
- [docs/AUDIT-CONTRACT.md](docs/AUDIT-CONTRACT.md)：进入 gbrain / Mercury Agent / OpenClaw 记忆前的审计契约
- [examples/](examples/)：完整样本链，展示 raw → goal check → classified sample → action plan → audit report → reuse decision
- [sample_index.md](sample_index.md)：样本库索引如何证明它不是简单清洗碎片

最小样本：

```text
用户原始碎片
  → goal-validator 检查
  → classified sample
  → action_plan
  → audit_report
  → reuse decision
```

---

## 核心定位

它不是普通知识库，也不是通用 AI 审计平台，更不是另一个 second brain。

它也不是帮你思考的系统，而是帮你判断哪些思考值得留下、推进、复用。

更准确地说，它不是"第二前额叶"，而是**前额叶里的一个质检闸门**，也是长期 Agent Brain 前面的 pre-ingestion audit gate。

它解决的问题是：**高价值想法经常出现在聊天、碎片、临时判断和项目讨论中，但如果没有目标验证、类型判级、案例绑定、审计记录和复用出口，它们很快会变成干净但无用的知识碎片。**

**Mercury Lab 的目标，是把这些碎片加工成可追踪、可判断、可复用的项目样本。**

对 gbrain、Mercury Agent、OpenClaw 这类系统来说，Mercury Lab 的角色不是替代它们的 memory / graph / retrieval，而是先回答：

```text
这段内容应该丢弃、冷存、复核，还是升格进入长期记忆？
```

---

## 核心差异：LLM vs Mercury Lab

**LLM 在优化"答案质量"。**
**Mercury Lab 在优化"判断过程的可靠性"。**

| 维度 | LLM（默认） | Mercury Lab |
|------|-------------|-------------|
| 优化目标 | 给一个"看起来合理且完整"的答案 | 让判断过程"不可跳过、可审计" |
| 行为倾向 | 补充信息、扩展论证、提高可读性 | 限制推断、暴露假设、保留不确定性 |
| 输出风格 | 连贯叙述（像顾问） | 结构化约束（像审计员） |
| 风险 | 说得越多越容易掩盖错误 | 说得越少但更容易发现问题 |
| 处理不确定性 | 被"合理解释"吸收掉 | 强制显性化（假设 / 缺证据） |

---

## 正确用法

```
LLM（推理模式）生成方案 → Mercury（约束）做审计 → 人做最终决策
```

- 如果只用 Mercury：会觉得它"太慢、太保守"
- 如果只用 LLM：会逐渐发现"有些地方它说得太顺了"
- 两个一起用：LLM 负责找可能性，Mercury 负责判断哪些可能性值得信

---

## Mercury Lab 的人格

Mercury Lab 不是"更聪明的 AI"，而是一个有判断人格的 AI 约束系统。

它的默认人格是 **V8.1 现实同频**：

- 先理解"现状为什么合理"
- 再判断"哪里出现断裂或失真"
- 不被骗，但也不相信任何人

它的核心价值：**让 AI 输出从"听起来对"变成"有据可查、有迹可循"**。

这不是分析工具，而是 AI 输出的质量门卫。

---

## 设计哲学：约束而非功能

**逆向设计：用约束而非功能来定义产品。**

大多数 AI 产品定义自己"能做什么"。
Mercury Lab 定义自己"不能做什么"。

> 禁止把推测存成事实
> 禁止同一个人既取证又审计
> 禁止跳过 artifact 层
> 禁止让同一 AI 自己判断、自己审计后直接定案

这不是功能限制，而是**把约束变成产品本身**。

当别人在卖"更聪明的 AI"时，Mercury Lab 在卖"更可靠的判断过程"。

---

## 快速开始

```powershell
npm install
npm run doctor
npm run dashboard
```

Dashboard 默认地址：`http://127.0.0.1:4788`

生成给外部 brain 的前置审计 bundle：

```powershell
npm run index
npm run export:memory
npm run export:gbrain
```

这些命令只生成 export bundle，不会直接写入 gbrain 或 Mercury Agent 的运行时数据库。

---

## 执行模式

| 模式 | 消耗 | 速度 |
|------|------|------|
| Agent 模式（默认） | AI Agent token | 快 |
| API 模式 | API token | 慢 |

---

## 核心产物：Judgment Audit Report

每次分析输出：

- **原始材料**：00_raw/
- **结构化分析**：01_segmented/
- **红队审计**：07_audit_reports/
- **索引更新**：11_indexes/

`npm run index` 现在会生成两层索引：

- `11_indexes/source-index.json`：文件级 artifact 索引
- `11_indexes/sample-index.json`：样本级索引，暴露判级、项目绑定、复用和反馈缺口

---

## 分工

- **Mercury Agent upstream**：运行时、CLI/Telegram、权限工具、调度器、Second Brain、daemon
- **Mercury Method Lab**：方法路由、证据链、artifact 状态、记忆候选、决策日志、行动计划、审计报告

---

## 禁止事项

- 不允许把推测存成事实
- 不允许直接覆盖 raw 原始材料
- 不允许把所有东西都写进长期记忆
- 不允许让同一个 agent 自己取证、自己判断、自己审计后直接定案
- 不允许清理掉未解释的异常信号

---

## 入库流程

```
inbox → raw → segmented → cleaned → uncertain → memory_candidates → decision_logs / action_plans / audit_reports
```

---

## 工程入口

| 命令 | 说明 |
|------|------|
| `npm run doctor` | 检查目录、脚本和运行环境 |
| `npm run dashboard` | 启动本地 Web GUI（默认 http://127.0.0.1:4788） |
| `npm run index` | 重建索引 |
| `npm run validate` | 审计 artifact 结构 |
| `npm run v8:analyze -- --text "..."` | 用 V8 分析一段文本 |

---

## 文档索引

- 架构边界：[docs/architecture.md](docs/architecture.md)
- 判断收口规则：[docs/JUDGMENT-CLOSURE-RULE.md](docs/JUDGMENT-CLOSURE-RULE.md)
- V8 方法文档：[docs/methods/](docs/methods/)
- 治理目标：[docs/GOVERNANCE.md](docs/GOVERNANCE.md)
- 示例样本：[examples/](examples/)
