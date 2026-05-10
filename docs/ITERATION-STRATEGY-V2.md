# v2.0 战略前瞻文件（完整版）

> 基于：外部评估报告 × 2 + 实测反馈 + AI Native 语境重估
> 日期：2026-05-10
> Provenance：`[HUMAN_ONLY]`

---

## 一句话定位（v2.0 核心主题）

> **从"文档丰富的方法论"走向"AI 级别的真实拦截佐证"**

v1.x 的核心矛盾：文档远跑在代码前面，外部评估一针见血指出"代码量不大，真实拦截案例几乎看不到"。

v2.0 的唯一任务：把这个矛盾解决掉。

---

## 现状坐标（外部评估基准）

| 维度 | 评分 | 行动 |
|------|------|------|
| 问题定义 | 9/10 | 保持 |
| 方法论深度 | 8/10 | 保持，继续扩展 Proof Pack |
| **工程落地** | **5/10** | 🔴 下版唯一核心 |
| 文档能力 | 9/10 | 冻结，不新增 |
| **产品感** | **6/10** | 跟随 M1/M3 解决 |
| **诚实度** | **10/10** | 保持，护城河 |

---

## 三个必须达成的 Milestones

### M1：跑通 3 个真实集成 🔴 最高优先级

**数字验收标准：**
- 至少 1 个集成有外部反馈记录（GitHub issue / 对话截图 / 文档引用均可）
- 每个集成跑通完整 audit 闭环（输入 → 审计 → 路由 → 结果）

**行动序列（按顺序）：**

```
第1步：OpenClaw SDK 集成 demo
  → 在 examples/integration-demo/ 下建 openclaw-hook.mjs
  → 模拟 OpenClaw agent 写入记忆前的 pre-write 审计
  → 跑通 → 截图/记录结果 → 这就是第一个"真实案例"

第2步：Starter Kit（Hello World SDK）
  → 一个 README.md，5 步让外部开发者跑通第一次 audit()
  → 这是降低集成门槛的核心文档，不是新功能

第3步：Cursor / VS Code 插件集成示例
  → 不需要完整插件
  → 只需要一个脚本：捕获 Cursor AI 回答 → 送入 Mercury → 返回审计结果
  → 证明"任何 AI 输出管道都可以接入"
```

---

### M2：积累 100 个真实审计判例

**数字验收标准：**
- 累计审计记录 ≥ 100 条（含已拦截 + 已通过）
- 其中 human_reviewed 状态非 declined ≥ 10 条
- 每条记录包含：原始文本（截取）、路由决定、blocker 摘要

**行动序列：**

```
第1步：整理已有记录
  → 将 dist/captures/results/ 里的 JSON 文件整理为结构化判例
  → 这是已有的数据，不需要重新收集

第2步：建立 cases/ 目录
  → cases/YYYY-MM/  按月归档
  → 每条记录：input.md + audit-result.json + review-status.yaml

第3步：Proof Pack 003
  → 以"AI Coding 实际输出"为核心样本类型
  → 优先收录日常使用中拦截的真实案例
```

---

### M3：推进 10 个 approved 案例，打通 Human Review 飞轮

**数字验收标准：**
- human_reviewed: approved ≥ 10 条
- 每条 approved 记录包含：作者自审签字 + 复核结论 + 时间戳

**行动序列：**

```
第1步：Dashboard 内嵌快速复核
  → 在 checklist 选项上点 A/B/C → 自动生成 review 记录
  → 不需要写文章，只需要点选项

第2步：设定每日最低标准
  → 每天完成 1 条审计记录的 review
  → 10 条 = 10 天，不难，但需要纪律

第3步：review 记录可导出
  → 导出为 review-log.yaml，进入 proofs/ 目录
```

---

## v2.0 额外警示

### release theater 必须停止

9 天 14 个 release，v0.4 → v1.9.0，0 star。这不是迭代速度，这是表演。

**v2.0 节奏原则：**
```
没有真实集成案例 → 不发新 release
没有真实判例积累 → 不改版本号
Proof Pack 003 → 必须在有外部贡献案例后才发布
```

### AI Native 语境重估：什么才算"真实佐证"

在 AI coding 为主的行业里，"真实佐证"的定义已经变了：

| 旧框架（传统求职） | AI Native 框架（真实有效） |
|-----------------|------------------------|
| 人类用户的使用反馈 | AI agent 接入 SDK 并产生拦截记录 |
| PR review 经历 | 其他 AI agent 读取并处理 Mercury 输出 |
| 团队协作经历 | AI → AI 管道中的审计节点被真实调用 |

**结论：** 你自己实际应用里已经有真实拦截记录。v2.0 的任务是把它们整理成结构化摘要，不需要找"人类用户"来证明。

---

## 今日起第一件事（打开文件后直接做）

```
优先级 1：整理已有的审计记录
  → dist/captures/results/ 下的 JSON → 提取为 10 条判例摘要
  → 写入 docs/REAL-CASES-SUMMARY.md
  → 这一步不需要任何人配合，今天就能完成

优先级 2：跑通 OpenClaw SDK 集成 demo
  → 在 examples/integration-demo/ 建 openclaw-hook.mjs
  → 完成后截图 → 加入 REAL-CASES-SUMMARY.md

优先级 3：写 Starter Kit README
  → 5 步让外部开发者跑通第一次 audit()
  → 这是降低集成门槛的核心
```

---

## 三个月后的 v2.0 验收清单

```
M1
  □ OpenClaw 集成 demo 跑通并有记录
  □ Starter Kit README 可用
  □ 至少 1 个外部集成反馈记录

M2
  □ 审计记录 ≥ 100 条
  □ human_reviewed: approved ≥ 10 条
  □ Proof Pack 003 草稿完成

M3
  □ Dashboard 快速复核功能上线
  □ review-log.yaml 可导出
  □ 每日 review 节奏建立

整体
  □ docs/REAL-CASES-SUMMARY.md 存在且持续更新
  □ release theater 停止（表现为：版本号停留在 v1.9 直到 M1 完成）
```

---

## v2.0 主动不做什么

```
❌ 不新增主要框架名（外部评估已警告）
❌ 不增加 Dashboard UI 复杂度（v1.5 UX 已解决）
❌ 不写新文档（已有 94 个，冻结）
❌ 不做存储后端适配（非项目职责）
❌ 不定义可量化成功指标（诚实度护城河）
❌ 不做 AI 自动评分（哲学冲突）
❌ 不发无实质内容的 release（v1.9 之后 freeze 直到 M1 完成）
```

---

## 三个最高 ROI 的行动

| 排名 | 行动 | ROI 说明 |
|------|------|---------|
| 🥇 | 整理已有拦截记录为 REAL-CASES-SUMMARY.md | 今天就能做，直接回答"零真实案例"质疑 |
| 🥈 | OpenClaw SDK 集成 demo | 优先级最高的外部集成，我们的生态最成熟 |
| 🥉 | Starter Kit README | 降低集成门槛是获取外部用户的唯一路径 |

---

## 总结

```
v1.x：我知道怎么做（方法论完整，文档充分）
v2.0：我已经做过了（真实拦截佐证，集成可查，review 飞轮转起来）
```

---

*本文档整合了：外部评估 × 2 + 实测反馈 + AI Native 语境重估。*
*version: 2.0-complete · 2026-05-10*
