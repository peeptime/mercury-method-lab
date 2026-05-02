# Mercury Lab 入口文档

> **谁来读这份文档？** AI agent、未来的你自己、任何需要了解 Mercury Lab 的人。
> **读完这份文档后，你应该知道：我在哪、要做什么、从哪开始。**

---

## 我在 Mercury Method Lab

Mercury Lab 是 AI 推理质量的**约束器**，不是聊天界面，是**执行闭环**。

它的核心价值：让 AI 的每个结论都有据可查、有迹可循、有审计出口。

---

## 两个核心概念

### 1. Artifact（工件）

你在 Mercury Lab 里产生的每个文件，都是一个 **Artifact**。

Artifact 分两种：
- **原始材料**：`00_raw/` —— 你输入的原文，不可修改
- **处理结果**：`01_segmented/`、`02_cleaned/`、`03_uncertain/` 等 —— 处理后的结论

每个 Artifact 必须记录：来源、方法、创建时间。

### 2. 方法路由

Mercury Lab 支持多种分析方法。当前激活方法是 **PSP/V8**，当前分析人格是 **V8.1 现实同频**。

配置文件：`v8-mercury-backend/config/methods.json` → `active_method: v8`

分析人格：`config/methods.json` → `analysis_persona`

- `v8.1-reality-sync`：默认人格。先解释现实均衡为什么成立，再判断是否存在失真、断裂、错配或可触达杠杆。
- `v8.0-breakthrough`：突围人格。适合强叙事污染、伪结构、伪权力、伪杠杆识别。
- `v8.5-correction`：纠偏人格。用于审计过度聪明、概念偷换和伪深刻，不作为默认主分析人格。

执行模式：`config/methods.json` → `execution_mode`

- `api`：默认模式。Agent 不自己展开主分析，直接调用 `npm run v8:analyze`，由 Mercury Lab 脚本消耗 API token、写入分析和审计 artifact。
- `agent`：Agent 模式。Agent 使用自身上下文和当前分析人格完成分析，但仍必须写入 `00_raw/`、`01_segmented/`、`07_audit_reports/` 并更新索引。

PSP 人格提示词文件位置：
```
v8-mercury-backend/docs/methods/PSP-V8.0-突围者事件研判执行提示词.md
v8-mercury-backend/docs/methods/PSP-V8.1-与市场同频的真实理解事件研判执行提示词.md
v8-mercury-backend/docs/methods/纠偏压缩PSP-聪明人装聪明验证-v8.5.md
```

架构边界：V8.0 / V8.1 / V8.5 是“分析人格”，API / Agent 是“执行通道”。不得把人格版本当成运行模式，也不得在一次主分析中混读多个 PSP 人格，除非当前人格文档显式要求对照审计。

---

## 标准工作流

```
收到输入
  ↓
写入 00_raw/（文件名格式：YYYYMMDD-描述.md）
  ↓
调用当前 PSP 分析人格 → 写入 01_segmented/
  ↓
事实清洗 → 写入 02_cleaned/
  ↓
分流判断：
  ├─ 有异常 → 03_uncertain/
  ├─ 有价值 → 04_memory_candidates/
  ├─ 有决策 → 05_decision_logs/
  ├─ 有行动 → 06_action_plans/
  └─ 必有审计 → 07_audit_reports/
  ↓
输出结论
```

**禁止跳过原始材料层。** 不能在原始材料上直接写结论。

---

## 五条禁止事项

1. ❌ 不允许把推测存成事实
2. ❌ 不允许直接覆盖 raw 原始材料
3. ❌ 不允许把所有东西都写进长期记忆
4. ❌ 不允许让同一个 agent 自己取证、自己判断、自己审计后直接定案
5. ❌ 不允许清理掉未解释的异常信号

---

## 目录结构

```
v8-mercury-backend/
├── 00_raw/          # 原始材料入口
├── 00_inbox/        # 预入库材料（有价值但暂不处理）
├── 01_segmented/    # PSP 结构化分析
├── 02_cleaned/     # 事实清洗
├── 03_uncertain/  # 异常信号、待追踪项
├── 04_memory_candidates/  # 值得长期积累的结论
├── 05_decision_logs/      # 决策过程记录
├── 06_action_plans/       # 行动计划
├── 07_audit_reports/      # 审计报告（必须）
├── 08_skills/             # Mercury Lab Skill 存放区
├── 09_templates/          # 模板
├── 10_exports/            # 导出/迁移包
├── 11_indexes/           # 索引文件
├── config/                # 方法、状态机、权限配置
├── docs/                  # 架构文档
├── scripts/               # 工具脚本
└── submissions/          # 外部提交入口
    ├── viewpoints/       # 人工提交
    └── agent-queue/       # AI 提交队列
```

---

## 上游兼容

Mercury Lab 不是独立运行的 runtime。它依赖 **Mercury Agent**（`cosmicstack-labs/mercury-agent`）提供运行时能力。

- **Mercury Lab 负责**：方法、证据链、Artifact 状态、审计、迁移
- **Mercury Agent 负责**：24/7 运行时、CLI/Telegram、权限工具、调度器、Second Brain

当前兼容版本：`>=1.1.0 <2.0.0`

详见 `docs/upstream-mercury-agent-compatibility.md`

---

## 关键配置文件

| 文件 | 作用 |
|------|------|
| `config/methods.json` | 方法注册与激活状态 |
| `config/state-machine.json` | Artifact 状态流转定义 |
| `config/permissions.json` | 权限配置 |
| `config/architecture-entrypoints.json` | 架构入口点 |

---

## 常见操作

### 分析一段文本

先读取 `config/methods.json.execution_mode`，再决定执行方式。

#### API 模式（`execution_mode: "api"`）

优先使用最小可执行脚本，不要让 agent 自己探索 V8.0 文件和输出路径，也不要重复消耗 Agent token 做同一轮 V8.0 主分析：

```powershell
npm run v8:analyze -- --text "要分析的原始材料" --title "材料标题"
npm run v8:analyze -- --file .\path\to\input.md --title "材料标题"
```

脚本会自动完成：

1. 写入 `00_raw/`，保留原始材料。
2. 读取 `config/methods.json` 里的 `analysis_persona`，只加载当前人格的主提示词。
3. 调用 `config/model-providers.json` 里的 active LLM provider。
4. 写入 `01_segmented/` PSP 结构化分析。
5. 写入 `07_audit_reports/` red-team 审计报告。
6. 默认重建 `11_indexes/source-index.json`。

如果只想生成 artifact，不想重建索引，可加 `--no-index`。

#### Agent 模式（`execution_mode: "agent"`）

Agent 可以自己执行 PSP 分析，但必须保持 Mercury Lab 的存储闭环：

1. 写入 `00_raw/YYYY-MM-DD-描述.md`，保留原始材料。
2. 按当前 `analysis_persona` 的固定输出结构生成 `01_segmented/YYYY-MM-DD-描述-v8-analysis.md`。
3. 写入 `07_audit_reports/YYYY-MM-DD-描述-v8-audit.md`；如果不是独立 red-team adapter，审计中必须注明“此审计由 AI Agent 手工生成，未经过 V8-redteam adapter”。
4. 运行 `npm run index` 更新索引。
5. 运行 `npm run validate` 检查 artifact 契约。

Agent 模式禁止只在对话里给结论而不落盘。跳过 `00_raw/` 或 `07_audit_reports/` 等于绕过 Mercury Lab。

### 判断收口

完整 PSP 分析必须在尾部给出：

1. `停止条件`：满足什么条件后停止继续分析。
2. `推翻条件`：什么信号出现说明当前判断错了。
3. `复盘时间`：何时回来检查。
4. `记忆建议`：M0-M4 记忆等级与理由。

记忆等级：

| 等级 | 含义 |
|------|------|
| `M0` | 不建议记忆 |
| `M1` | 可短期保留 |
| `M2` | 可作为项目上下文 |
| `M3` | 可进入长期方法论 |
| `M4` | 重大修正，需高优先级保存 |

### 提交一个问题/观点

1. 写入 `submissions/viewpoints/YYYYMMDD-描述.md`
2. 格式：Markdown + frontmatter
3. 运行 `npm run import:viewpoint -- submissions/viewpoints/文件名.md`
4. 系统自动提升为 `00_raw/` 原始材料

### 查看当前激活方法

```powershell
Get-Content config/methods.json
```

---

## 我需要帮助时去哪找

| 需要什么 | 去哪 |
|---------|------|
| PSP 人格细节 | `docs/methods/` |
| Artifact 状态流转 | `docs/architecture.md` |
| 禁止事项详解 | `references/forbidden-rules.md` |
| 上游兼容策略 | `docs/upstream-mercury-agent-compatibility.md` |
| 用户提交指南 | `docs/user-submission-guide.zh-CN.md` |

---

## 设计者/第一用户

你（peeptime）是 Mercury Lab 的设计者，也是第一验证者。

Mercury Lab 目前主要服务于你自己的使用场景。有朝一日如果需要服务其他人——设计思路是：把 artifact 和 audit 模型变成公开实践指引（见 `docs/publication-plan.md`）。

---

*最后更新：2026-05-02 | 版本：0.3.4 | 位置：v8-mercury-backend/docs/AGENT_ENTRY.md*
