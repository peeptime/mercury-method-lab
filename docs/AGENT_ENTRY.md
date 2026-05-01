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

Mercury Lab 支持多种分析方法，当前激活的是 **V8.0**。

配置文件：`v8-mercury-backend/config/methods.json` → `active_method: v8`

V8.0 提示词文件位置：
```
Z:\AI 202604\trae01\PSP-V8.0-突围者事件研判执行提示词.md
Z:\AI 202604\trae01\PSP-V8.1-与市场同频的真实理解事件研判执行提示词.md
Z:\AI 202604\trae01\纠偏压缩PSP-聪明人装聪明验证-v8.5.md
```

---

## 标准工作流

```
收到输入
  ↓
写入 00_raw/（文件名格式：YYYYMMDD-描述.md）
  ↓
调用 V8.0 分析 → 写入 01_segmented/
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
├── 01_segmented/    # V8.0 结构化分析
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

1. 将文本写入 `00_raw/YYYYMMDD-描述.md`
2. 按 V8.0 框架分析
3. 结果写入 `01_segmented/YYYYMMDD-描述-v8分析.md`
4. 执行对抗性交叉验证（第七层）
5. 审计报告写入 `07_audit_reports/`

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
| V8.0 框架细节 | `docs/v8-framework.md` 或 `references/v8-framework.md` |
| Artifact 状态流转 | `docs/architecture.md` |
| 禁止事项详解 | `references/forbidden-rules.md` |
| 上游兼容策略 | `docs/upstream-mercury-agent-compatibility.md` |
| 用户提交指南 | `docs/user-submission-guide.zh-CN.md` |

---

## 设计者/第一用户

你（peeptime）是 Mercury Lab 的设计者，也是第一验证者。

Mercury Lab 目前主要服务于你自己的使用场景。有朝一日如果需要服务其他人——设计思路是：把 artifact 和 audit 模型变成公开实践指引（见 `docs/publication-plan.md`）。

---

*最后更新：2026-05-01 | 版本：0.2.0 | 位置：v8-mercury-backend/docs/AGENT_ENTRY.md*