# ITERATION-GUIDE-2.1.5.md

> v2.1.5 迭代交接文档
> 日期：2026-05-13
> Provenance: `[AI_GENERATED]` drafted_by: QClaw + AI-PM Skill + UX-Research-Engine Skill
> human_reviewed: declined

---

## 本版本背景

v2.1.5 是 v2.x 系列的 **GUI 产品化深化版本**，聚焦于用户提交内容后的即时反馈体验。

主要目标：
1. 让用户在提交前就知道内容质量
2. 把 Mercury 的判断逻辑从隐性变成显性
3. 让「准入」这个核心动作在界面上有独立入口

---

## 本版本完成的内容

### 1. intake-feedback.mjs — Quick Audit 模块

**文件：** `src/mercury-audit/intake-feedback.mjs`

**四个核心函数：**

| 函数 | 功能 | 依赖 |
|------|------|------|
| `extractClaims(text)` | 从文本中提取主张列表（factual/opinion/speculative/procedural） | 无 |
| `scoreContentQuick(text)` | 5维度结构评分 + 路由建议 + 旗帜标注 | 无 |
| `analyzeContentBatch(items)` | 批量内容分析 | 无 |
| `selfAuditReport(report, source)` | Mercury 自审：检查报告是否有循环引用 | 无 |

**主张分类逻辑（无 LLM，正则驱动）：**

```
factual      — 有具体数据/来源引用
speculative  — 有 might/may/perhaps/future 类词
opinion      — 有 I think/should/clearly 类词
procedural   — 有 step/process/method/how to 类词
unclear     — 无法分类
```

**评分维度：**

```
structure    — 是否有 Markdown/列表/层级结构 (+2)
conclusion   — 是否有结论段落 (+2)
evidence     — 是否有证据引用 (+3)
specificity  — 是否有具体描述 (+3)
hedgingPenalty — 过度修饰词扣分（最高-2）
```

**路由规则：**
```
hedgeRatio > 0.1        → revise
no evidence + overall < 4 → quarantine
no conclusion + wc > 300 → revise
overall >= 7 + evidence   → accept
overall >= 6 + factual >= 2 → accept
default                   → (overall >= 5 → accept : revise)
```

### 2. Dashboard API 扩展

**新增端点：**

| 端点 | 方法 | 输入 | 输出 |
|------|------|------|------|
| `/api/intake-feedback` | POST | `{ text }` | 质量评分对象 |
| `/api/extract-claims` | POST | `{ text }` | 主张列表 |

**SDK API 版本：** `0.7.0`

### 3. GUI Feedback 面板

**触发时机：**
- 用户提交内容后自动触发（提交成功 → 调用 `/api/intake-feedback`）
- 用户在文本框输入时防抖触发（800ms 无输入后）
- 用户点击「重新分析」按钮手动触发

**UI 元素：**
- 环形质量评分图（SVG，0-10 分）
- 质量等级徽章（高/中/低）
- 四维度指标（结构/证据/结论/具体性）
- 旗帜标注列表（警告/错误类型）
- 主张样本预览（前3条，含类型标签）
- 重新分析按钮

**版本标识：** `v2026.05.13` / `asset:20260513a`

---

## 产品化升级的核心逻辑

### 为什么这个功能重要

Mercury 原来的问题是：**用户不知道自己的内容会不会被接受**。

Mercury 2.0.x 的 UX 流程是：
1. 用户提交材料
2. 系统处理
3. 用户看结果（已经晚了）

Mercury 2.1.5 增加了：
0. 用户在输入时就看到质量评分和路由建议
1. 用户提交 → 看到反馈面板
2. 继续原流程

**这个改动不改变核心判断逻辑，只让判断过程更透明。**

### 主张提取的价值

主张提取（`extractClaims`）是整个系统的「原材料」：
- F1-F5 审计引擎的所有结论都建立在主张之上
- 用户看到自己文本被分解成主张，有助于理解「为什么 Mercury 认为这条内容有问题」
- 未来可以扩展为：用户选择接受/拒绝某条主张 → 影响路由决策

### 评分算法的局限

**规则型评分的局限：**
1. 无法理解语义等价性（「中国GDP增长5%」和「中国GDP增速为5%」语义相同但正则不同）
2. 无法判断证据质量（引用了一个来源 ≠ 来源可信）
3. 数值阈值是经验值（overall >= 7 作为「高质量」阈值）

**不适用于：**
- 法律、医疗、金融等高风险场景
- 需要语义理解的内容审核
- 作为唯一决策依据

**适用于：**
- 个人知识管理中的快速过滤
- AI 协作中的即时反馈
- 作为 Mercury LLM 审计的预筛层

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/mercury-audit/intake-feedback.mjs` | 新增 |
| `src/mercury-audit/index.mjs` | 修改 SDK_VERSION 0.6.0 → 0.7.0 |
| `scripts/dashboard_server.mjs` | 新增两个 API 端点 + 导入 feedback 模块 |
| `dashboard/app.js` | 新增 Feedback JS 函数 + 绑定事件 + init() 调用 |
| `dashboard/index.html` | 新增 Feedback HTML 面板 |
| `dashboard/styles.css` | 新增 Feedback 相关样式 |
| `dashboard/product-layer.js` | 版本号 20260510a → 20260513a |
| `package.json` | 版本 2.0.2 → 2.1.5 |
| `CHANGELOG.md` | 新增 2.1.5 条目 |

---

## 后续版本建议

### v2.2.0（推荐）
- **Admission Action 独立页面**：不再把「准入判断」隐藏在工作台里，做一个独立页面专门做 A/B/C 选择
- **Feedback 历史记录**：把每次 feedback 结果存到 artifact，支持回溯
- **批量 Feedback**：支持一次性分析多个文件，给出排序

### v2.3.0（探索）
- **LLM-powered Feedback**：在规则型反馈的基础上，增加 LLM 驱动的深层分析（可选模块）
- **Feedback → Routing 联动**：用户可以在 Feedback 面板直接修改路由建议
- **外部报告导入**：支持粘贴 Mercury 生成的审计报告，触发 selfAuditReport

### 不推荐在 v2.x 做的
- 多语言界面扩展（Mercury 当前核心用户是中文用户，不应在此时分散产品注意力）
- 移动端适配（桌面端体验还未成熟）
- API 网关/插件系统（Mercury 当前是单体架构，提前做模块化是过度工程）

---

## 测试验证

```bash
# 验证新模块语法正确
node --input-type=module < src/mercury-audit/intake-feedback.mjs

# 验证服务器启动正常（会报错但能看到 import 是否成功）
cd scripts
node dashboard_server.mjs &
sleep 2 && curl -s -X POST http://127.0.0.1:4788/api/intake-feedback \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"根据2024年统计，中国GDP增长率为5.2%。这说明经济正在稳定复苏。\"}" | jq .

# 验证主张提取
curl -s -X POST http://127.0.0.1:4788/api/extract-claims \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"人工智能正在改变软件开发。Claude和GPT是最流行的模型。\"}" | jq .
```

---

## 来源参考

本版本迭代受以下 Skill 启发：
- `ai-product-manager` (ClawHub) — AI-native 产品思维
- `afrexai-ux-research-engine` (ClawHub) — UX 研究框架（CAMPS + Nielsen Heuristics）
- `design-critique` (ClawHub) — 设计评审方法论
