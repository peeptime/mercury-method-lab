# Execution Mode 设计文档

> 版本：0.3.0 → 0.3.3 迭代
> 生成时间：2026-05-01 23:05 GMT+8
> 状态：已实现（2026-05-02）

---

## 核心问题

Mercury Lab 当前存在两种智能消耗方式：
- **AI Agent 智能**：消耗 AI token（OpenClaw 等 agent）
- **API Key token**：消耗 API token（doubao 等 LLM API）

这两种消耗在做同一件事（V8.0 分析），导致：
1. 资源浪费（两方都在分析）
2. 用户无法按需选择
3. 项目职责边界不清晰

---

## 解决方案：execution_mode 配置

### 设计目标

- **正确的东西做正确的事**：AI Agent 负责理解、决策、编排；Mercury Lab 负责执行、存储、审计
- **效率优先**：用户可以选择经济优先（Agent 模式）或质量优先（API 模式）
- **存储始终激活**：无论哪种模式，Mercury Lab 的存储和状态管理必须始终激活

---

## 配置设计

### 修改 `config/methods.json`

```json
{
  "version": "0.3",
  "active_method": "v8",
  "execution_mode": "api",
  "execution_mode_description": {
    "api": "使用 V8 执行脚本 + API token（确定性高，成本高）",
    "agent": "使用 AI Agent 智能做 V8 分析（成本低，质量依赖 Agent）"
  }
}
```

| 字段 | 说明 |
|------|------|
| `execution_mode` | 当前模式：`api`（默认）或 `agent` |
| `execution_mode_description` | 模式说明，供 UI 和文档使用 |

---

## 模式定义

### API 模式（execution_mode: "api"）

**消耗**：API Key token（通过 doubao 等 LLM API）

**流程**：
```
用户输入
  ↓
AI Agent 读取配置 → execution_mode = "api"
  ↓
AI Agent 调用 run_v8_analysis.mjs
  ↓
脚本自动执行：
  - V8.0 分析（API 调用）
  - 写入 00_raw/
  - 写入 01_segmented/
  - 写入 07_audit_reports/
  - 更新索引
  ↓
AI Agent 解读结果，告知用户
```

**特点**：
- 输出稳定：12/12 章节 + 自动审计 + hash 校验
- 成本高：每次调用消耗 API token
- 确定性高：结果可复现

---

### Agent 模式（execution_mode: "agent"）

**消耗**：AI Agent token（OpenClaw 等 agent 的智能）

**流程**：
```
用户输入
  ↓
AI Agent 读取配置 → execution_mode = "agent"
  ↓
AI Agent 使用 V8.0 框架分析（消耗 AI token）
  ↓
AI Agent 按标准格式写入 artifact：
  - 00_raw/（原始材料）
  - 01_segmented/（V8.0 分析结果）
  - 07_audit_reports/（审计报告——自己写或留空待外部审计）
  ↓
AI Agent 执行 npm run index 更新索引
  ↓
AI Agent 告知用户结果
```

**特点**：
- 成本低：消耗 AI Agent 的智能（通常免费或已包含在订阅中）
- 质量依赖 AI 智能：取决于 AI 的 V8.0 训练数据、上下文理解
- 需要 AI Agent 严格遵守 artifact 格式

---

## 关键约束

### 存储始终激活

无论哪种模式，Mercury Lab 的存储管理必须始终激活：

| artifact 目录 | API 模式 | Agent 模式 |
|--------------|---------|-----------|
| 00_raw/ | ✅ 自动 | ✅ AI 写入 |
| 01_segmented/ | ✅ 自动 | ✅ AI 写入 |
| 02_cleaned/ | 可选 | 可选 |
| 03_uncertain/ | 可选 | 可选 |
| 05_decision_logs/ | 可选 | 可选 |
| 07_audit_reports/ | ✅ 自动 | ✅ AI 写或留空 |
| 11_indexes/ | ✅ 自动更新 | ✅ AI 执行更新 |

**Agent 模式如果跳过存储，Mercury Lab 将变成空壳。**

---

### 模式切换方式

| 方式 | 适合场景 | 实现 |
|------|---------|------|
| 修改 `config/methods.json` | 长期固定模式 | 手动编辑 |
| Dashboard UI 切换 | 用户临时切换 | UI 按钮 |
| 命令行参数 `--mode api` | 单次使用 | 脚本参数 |

---

### Agent 模式的质量保障

`execution_mode: "agent"` 时，AI Agent 必须：
1. 读取 `AGENT_ENTRY.md` 了解 V8.0 框架
2. 严格生成 12/12 章节（与 API 模式一致）
3. 写入完整的 artifact 元数据（schema_version、id、type、status 等）
4. 在审计中注明"此审计由 AI Agent 手工生成，未经过 V8-redteam adapter"

---

## 版本更新

| 项目 | 值 |
|------|---|
| 当前版本 | 0.2.0 |
| 更新后版本 | 0.3.3 |
| 更新内容 | 新增 execution_mode 配置字段 |
| 兼容性 | 向后兼容（默认 execution_mode = "api"） |

---

## 待实现清单

| 优先级 | 任务 | 状态 |
|--------|------|------|
| 🔴 P0 | 修改 `config/methods.json`，加 `execution_mode` 字段 | 已实现 |
| 🔴 P0 | 更新 `AGENT_ENTRY.md`，说明两种模式 | 已实现 |
| 🟡 P1 | 更新 `mercury-lab` skill，说明模式切换逻辑 | 已实现 |
| 🟡 P1 | 更新 Dashboard UI，添加模式切换（可选） | 已实现 |
| 🟢 P2 | 更新 CHANGELOG.md | 已实现 |

---

## 实现记录

2026-05-02 已完成：

- `config/methods.json` 增加 `execution_mode: "api"` 和 `execution_mode_description`。
- Dashboard 后端增加 `PATCH /api/execution-mode`。
- Dashboard 前端增加 Execution mode 切换控件，可在 `api` / `agent` 间切换并写回配置。
- `docs/AGENT_ENTRY.md` 增加 API 模式和 Agent 模式说明。
- `~/.qclaw-oversea/skills/mercury-lab/SKILL.md` 增加模式切换逻辑。
- `CHANGELOG.md` 增加本次实现记录。

---

## 参考文件

- V8 执行脚本：`scripts/run_v8_analysis.mjs`
- 配置示例：`config/methods.json`
- AI 入口：`docs/AGENT_ENTRY.md`
- Skill 定义：`~/.qclaw-oversea/skills/mercury-lab/SKILL.md`

---

*本文档由 QClaw 生成，用于 Mercury Lab 迭代参考。*
*下次迭代前请确认这些设计决策的有效性。*
