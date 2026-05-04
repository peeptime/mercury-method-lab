# Mercury Lab 目标定义

> 版本：0.4.0
> 日期：2026-05-04
> 定位：面向高频 AI 对话者的「洞察样本沉淀系统」

---

## 核心定位

Mercury Lab 不是普通知识库，也不是通用 AI 审计平台，更不是另一个 second brain。

它解决的问题是：高价值想法经常出现在聊天、碎片、临时判断和项目讨论中，但如果没有目标验证、类型判级、案例绑定、审计记录和复用出口，它们很快会变成干净但无用的知识碎片。

**Mercury Lab 的目标，是把这些碎片加工成可追踪、可判断、可复用的项目样本，并在它们进入长期 Agent Brain 前完成前置审计。**

它和 gbrain / Mercury Agent / OpenClaw 的关系是：

| 系统 | 负责什么 |
|------|----------|
| Mercury Lab | 入脑前审计、样本判级、冷存/复核/升格/淘汰 |
| Mercury Agent | 运行时 agent、权限、token、Second Brain |
| gbrain | 长期 brain、检索、图谱、MCP、技能运行 |
| OpenClaw | Agent 执行环境与任务消费 |

Mercury Lab 不直接写入这些系统的运行时数据库，只输出 pre-audit bundle。

---

## 核心目标

**把碎片化洞察转化为项目先行的可验证样本库。**

终点是**样本可识别**，不是可复用。大多数样本不值得复用，沉淀下去是正常结果。

---

## 交互原则（已确认）

> **结论优先，开口次之，推荐要弱。**

| 原则 | 说明 |
|------|------|
| 结论优先 | 用户上传洞察，系统给一个清晰结论，不做延伸推荐 |
| 推荐要弱 | 可以有，但很弱，不能转移焦点 |
| 开口存在但不推 | 继续讨论的入口存在，用户主动才会注意到 |
| 用户不推进是正常结束 | 不需要提醒，不需要干预 |
| 继续讨论是默认支持的方向 | 但不是默认会发生的行为 |

**Mercury Lab 是冷存储，不是热提醒。**

---

## 存储原则（已确认）

不是所有 action_plan 都需要执行。有的本来就是从洞察变成存储。

| 意图类型 | 含义 | 提醒强度 |
|---------|------|---------|
| `archived` | 洞察存档，不需要执行 | none |
| `immediate` | 需要立即执行 | strict |
| `watchful` | 观望中，先存档 | light |

action_plan 模板新增 `intent`、`reminder_intensity`、`feedback_expected_from` 字段（v0.3.1）。

`feedback_expected_from` 是反馈注入口，不是热提醒。它只说明后续结果理论上应由谁回填；当 `intent=archived` 时，该字段可为 `none`，表示冷存储正常结束。

---

## 核心数据流

```
碎片输入
  → 原文保留（raw）
  → 去噪清洗（cleaned）
  → 类型判级
  → 绑定项目
  → 四关检验
  → 生成 artifact（含 intent 标注）
  → 审计/决策/行动
  → 进入样本库
  → 后续识别或淘汰
```

---

## 判级类型

| 类型 | 含义 | 样本库位置 |
|------|------|-----------|
| **废料** | 不可用，淘汰 | 不入库 |
| **素材** | 有价值但未整理 | 04_memory_candidates |
| **观察** | 事实性记录，待验证 | 02_cleaned |
| **假设** | 推断性结论，待案例检验 | 03_uncertain |
| **案例** | 经四关验证的真实场景 | 04_memory_candidates |
| **模板** | 可复用的标准化流程或格式 | 09_templates |
| **决策** | 已采纳的判断，含反馈结果 | 05_decision_logs |
| **行动计划** | 含验收条件和 intent 标注 | 06_action_plans |
| **Skill** | 已固化的可执行工作流 | 08_skills |

---

## 架构优先级

| 层级 | 内容 | 状态 |
|------|------|------|
| 基础层 | 文件型 artifact 系统 | ✅ 已做 |
| 入口层 | /goal 目标质量门 | ✅ v0.6.0 |
| 质量层 | 四关检验 | ✅ v0.6.0 |
| 存储层 | 样本库索引 + intent 分类 | ✅ v0.7.1 / v0.3.0 |
| **当前迭代** | **intent 落地 + Judgment Closure 优化** | ✅ 本次 |
| 核心缺失 | 复用追踪 | ⚠️ 未做 |
| 核心缺失 | 旧 artifact 判级标签回填 | ⚠️ 未做 |
| 支撑层 | OpenClaw Skill 说明 | ⚠️ 审计发现问题 |
| 接入层 | memory pre-audit bundle | ✅ v0.8.0 |

---

## 下一步方向

1. **intent 字段落地**（本次已完成）
   - action_plan 模板新增 `intent` 字段（archived/immediate/watchful）
   - goal-validator 生成时自动推断 intent
   - Judgment Closure 新增"结论摘要/弱推荐/继续入口"骨架

2. **样本库索引二期**
   - 将 sample-index.json 接入 Agent 检索入口
   - 给每个 artifact 回填：sample_type / project_id / reuse_count / feedback_status

3. **复用追踪机制**
   - 样本被引用时记录"被复用次数"
   - 长期无引用 → 降级或淘汰

4. **反馈注入口**
   - 确保 action_plan / decision_log metadata 中存在 `feedback_expected_from`
   - 反馈字段用于记录责任来源，不自动触发提醒
   - `archived` 样本允许 `feedback_expected_from=none`

5. **外部 brain 接入**
   - 通过 `docs/AUDIT-CONTRACT.md` 约束迁移边界
   - 通过 `config/memory-targets.json` 声明目标后端
   - 通过 `npm run export:memory` / `npm run export:gbrain` 生成可审计导出包
   - 禁止默认直接写入 Mercury Agent / gbrain 运行时数据库
