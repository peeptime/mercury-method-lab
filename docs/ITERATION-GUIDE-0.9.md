# Mercury V8 迭代指南 · v0.9.0

> 文档定位：前瞻性迭代指导（12小时内执行）
> 起草时间：2026-05-04 21:00 GMT+8
> 依据：0506审计报告 × 2 + V8后端审计 + Skill审计 + **IC Memo（2026-05-04 VC视角）**
> 修订时间：2026-05-04 21:53 GMT+8（IC Memo 补充）
> 再次修订：2026-05-04 22:08 GMT+8（Opus 4.7 元认知记录）

---

## 一、核心判断：v0.9.0 的双重主题

> **从"概念声明"走向"可运行证明" + 从"投资人无法评估"走向"有具体触发条件"。**

v0.8.0 的问题已被四份报告一致锁定：

**来自4份技术审计的一致判断：**
```
问题不是框架不够好，不是文档不够多
问题是：这个系统只在你的脑子里运行，还没有在别人的文件系统里运行过。
```

**来自IC Memo（VC视角）的新发现：**
```
问题不只是工程证据薄弱
问题是：(1) 3天改8次核心定位，无锚点
        (2) 方法论与自身产出过程存在内在矛盾
        (3) 新概念≥10个 / 真实用例1个，术语密度失控
        (4) 被审计对象（gbrain/Mercury Agent/OpenClaw）不在公开repos
        (5) 身份不可核验，KYC第一步就停下
```

v0.9.0 承担双重任务：
- **技术侧**：让一个完全不认识项目的人，能走完端到端审计路径
- **叙事侧**：给投资人一套具体、可核验、可重开的评估触发条件

---

### IC Memo 的核心判决（原文）

> **PASS — NOT INVESTABLE TODAY，但保留 90天观察位**

7个重开条件，任何3项同时为真 → 升级到正式30分钟会面：
1. 身份与背景完成基础KYC（真名 + LinkedIn/简历/视频/reference之一）
2. 核心定位30天不再大改
3. 3个外部用户在公开渠道使用
4. 1个真实迁移案例（非中文假想prompt，来自真实agent工作流）
5. `Mercury Agent`/`gbrain`公开且可解释
6. 有第二个人（co-founder / 第一个员工 / 长期contributor）
7. 清晰的商业模型陈述（目标用户 + 付费触发 + 单价区间）

**v0.9 的目标：在这7条上至少让2条从"0"变为"有具体证据"。**

---

## 二、v0.9.0 绝对不能做的事（修订版）

| 禁项 | 原因 | 来自哪份报告 |
|------|------|-------------|
| 不加新的 artifact 类型 | 已经够多了 | 审计报告1 |
| 不加新的 backend adapter | gbrain/mercury_agent 均为 planned，勿动 | 审计报告1 |
| 不加 AI 自动分类功能 | 违反项目核心哲学：人判断，AI不自审 | 审计报告1/2 |
| 不加更多抽象层（如"审计的审计"） | 项目当前问题是概念密度 > 工程证据，不应继续加概念 | 审计报告2 |
| 不加任何 LLM 审计评分 | 同上，且会破坏核心价值主张 | 审计报告2 |
| 不做 RAG / fine-tuning 审计 | 场景蔓延，边界会失控 | 审计报告2 |
| **不加新术语/新概念** | **IC Memo：3天产出≥10个新词 / 1个真实用例，术语失控** | **IC Memo（新增）** |
| **不在commit/CHANGELOG中用AI协作产出来源不明的内容** | **IC Memo：CHANGELOG自承"AI协作完成"，与"不允许AI自审"规则矛盾** | **IC Memo（新增）** |
| **不在公开渠道发布含内部判断的项目定位** | **IC Memo：8次重定位是投资人最大红旗，需要30天稳定期** | **IC Memo（新增）** |

---

## 三、v0.9.0 必须做的事（按优先级排序）

### 🔴 P0 — 必须做，做不完不开工

#### P0-X（新优先项）：对齐方法论与自身产出过程

**来自IC Memo红旗2：项目的核心规则是"不允许AI自审"，但CHANGELOG自承"AI协作完成"——这是审计悖论。**

**执行路径：**

```
Step 1: 修改 CHANGELOG.md 中所有 "用户与AI协作完成" 的条目
        → 改为明确格式：
          "[AI_GENERATED] 此文档由AI起草，humanReviewed: true，reviewer: <你的身份>"
          "[HUMAN_ONLY] 此文档由人工撰写，无AI参与"

Step 2: 在 docs/AUDIT-CONTRACT.md 增加一条元规则：
        → "本项目自身产出的所有文档，必须通过本项目的审计标准"
        → 即：Mercury Lab 必须用 Mercury Lab 审计自己

Step 3: 在每份核心文档（README.md / AUDIT-CONTRACT.md / GOVERNANCE.md）
        的顶部加一段 "产出声明"（Provenance Declaration）：
        ```yaml
        provenance:
          authors: <human handles>
          ai_assisted: true/false
          audited_by: <Mercury Lab routing_decision>
          audit_ref: <链接到07_audit_reports/中的审计报告>
        ```

Step 4: 写 docs/METHODOLOGY-INTEGRITY.md
        → 内容：这个矛盾是什么、为什么存在、为什么修、怎么修
        → 让读者知道你知道这个矛盾，且已经解决
```

**验收标准：**
- 所有CHANGELOG条目有明确的human/AI产出声明
- README / AUDIT-CONTRACT / GOVERNANCE 三个核心文档有 provenance 段
- `docs/METHODOLOGY-INTEGRITY.md` 存在且可读

**不能做：**
- 不能删掉"AI协作完成"字样，要改写为可审计的声明格式
- 不能只修文档不动CHANGELOG——CHANGELOG才是IC最可能看到的第一手证据

---

#### P0-1：制造一个真实的"坏记忆拦截"案例

**这是v0.9.0唯一最重要的交付物（技术侧）。**

目标：展示审计层如何拦截一个看似合理但实际错误的AI结论。

**执行路径（5步）：**

```
Step 1: 取一段真实AI对话（来源：00_raw/目录现有文件）
        选"2026-05-03-20260503t141705z-ai变现路子审计-v8-2维度迁移分析.md"
        → 目标：找出一条"听起来对但实际站不住脚"的结论

Step 2: 写出"没有审计层时，这个结论如何被存入长期记忆"
        → 写一个虚假的 ai-consulting-replacement.md 放在 04_memory_candidates/
        → 内容：一个没有source_refs、自信且流畅的虚假结论

Step 3: 写出"有审计层时，哪个字段/规则捕获了它"
        → 在 07_audit_reports/ 生成真实审计报告
        → 格式：用 audit_report_template.md
        → 必须包含：blockers 字段非空、routing_decision = discard

Step 4: 展示拦截的路由决策
        → 在 05_decision_logs/ 生成决策日志
        → 格式：用 decision_log_template.md
        → 明确写出：never_promote 规则条目 + 违反原因

Step 5: 写一个对比脚手架（markdown文件）
        → docs/v0.9-proof-of-audit.md
        → 内容：输入 → 错误推断 → 无审计路径（虚线）→ 有审计路径（实线）
        → 让读者5分钟内看懂价值主张
```

**验收标准：**
- `routing_decision: discard` 的 artifact 存在于 repo
- `blockers` 字段非空且具体（不能只写"推测"，要写出"哪个字段未满足哪条AUDIT-CONTRACT规则"）
- 读者能在5分钟内凭直觉理解"如果没有这个系统，会发生什么"

**不能做：**
- 不能用精心构造的简单例子
- 不能让 blocker 只写"推测"这种宽泛理由

---

#### P0-2：发布 Audit Export Contract 的 JSON Schema

**现状：** source_refs / audit_refs / confidence / risk / blockers / review_path / memory_level / routing_decision 只是数据字段，不是可验证合约。

**执行路径：**

```
schemas/
  audit-export-contract.json      # 完整 JSON Schema（含 ajv 注释）
  examples/
    valid-promote.yaml            # routing_decision: promote 的合规示例
    valid-discard.yaml            # routing_decision: discard 的合规示例
    invalid-no-source-refs.yaml   # 违反 source_refs_required 规则的反例
    invalid-no-audit-refs.yaml    # 违反 audit_refs_required 规则的反例
```

**验收标准：**
- schema 可被 ajv 或 yaml schema tool 验证
- 有3个合规示例 + 2个违反示例
- 不要增加新字段——先把现有字段做成可验证的

---

### 🟡 P1 — 重要，应在12小时内完成

#### P1-0（新优先项）：给README加一个可截图的"30秒判断锚点"

**来自IC Memo建议2和8：** README第一屏太抒情，投资人和工程用户都无法在30秒内判断"这是什么"。

**执行路径：**

```
README.md 结构调整（加在最前面，在"不让聪明变成垃圾"之前）：

  ## 一句话（英文，≤20词）
  A pre-ingestion audit gate that prevents AI-generated speculation
  from polluting long-term memory systems.

  ## 一个真实案例（terminal 输出）
  → 用 DEMO.md 里那条端到端路径的 terminal 输出
  → 5行以内，让读者看到 routing_decision 从 "???" 变成 "discard"

  ## 一个 "这不是什么" 列表
  ❌ 不是第二大脑
  ❌ 不是 RAG 工具
  ❌ 不是 AI 写作助手
  ✅ 是一个守门层（audit gate）
```

**验收标准：** 一个不了解项目的人，看完README第一屏后能在15秒内：
- 说出这个项目解决什么问题
- 说清楚它和其他AI工具的区别
- 判断"这对我有没有用"

---

#### P1-1：清理目录结构——从12层收缩到4层最小可用集

**现状问题：** 12个目录（00_inbox ~ 11_indexes）对外部用户是一堵墙。

**执行路径：**

```
必须有（最小可行集）：
  00_raw         ← 原始材料（source of truth）
  04_memory_candidates  ← 记忆候选 + routing_decision
  07_audit_reports      ← 审计轨迹
  09_templates          ← 模板

可以延迟（12小时内不动，但需要路径注释）：
  01_segmented          ← 需说明如何从 raw 分割
  02_cleaned            ← 需说明 fact-cleaner 如何调用
  03_uncertain          ← 需说明何为"矛盾信号"
  05_decision_logs      ← 需说明与 audit_reports 的关系
  06_action_plans       ← 需说明触发条件
  08_skills             ← 见 Skill 审计报告 P1
  10_exports            ← 可从上游重建
  11_indexes            ← 可从文件系统重建

应该归档（不删除）：
  00_inbox/_manifest.yaml ← manifest 字段不全，待补充后重做
  data/                  ← 空目录，加 .gitkeep 说明用途

写 docs/MINIMAL-WORKFLOW.md
  → 内容："只用4个目录走完一次完整审计"
  → 读者目标：2分钟内理解完整路径
```

**验收标准：**
- 新用户能在2分钟内回答"我在哪里放原始材料？审计结果在哪里？"

---

#### P1-2：让 DEMO.md 成为可运行路径

**执行路径：**

```
docs/DEMO.md 重写为"一步一步跟着做"的操作指南：
  - 加入具体命令（如 npm run validate / npm run index）
  - 加入每一步的预期输出文件路径
  - 加入"卡住了怎么办"FAQ
  - 不超过15分钟能走完
```

**验收标准：** 一个第一次见到repo的人，能在15分钟内跑通 DEMO，并生成一个 routing_decision 非空的新 artifact。

---

#### P1-3：Skill P0 修复（按 Skill 审计报告）

**所有 Skill 必须补的两件事：**

##### 1. allowed_tools（所有6个Skill）

```
mercury-lab:        [Read, Grep, Write, Bash]   # 需要操作目录和执行命令
fact-cleaner:       [Read, Grep]                  # 只读分析
equilibrium-explainer: [Read, Grep]                # 只读分析
constraint-checker: [Read, Grep]                  # 只读分析
redteam-auditor:    [Read, Grep, Write]           # 需要写审计报告
action-translator:  [Read, Grep, Write]           # 需要写行动方案
```

##### 2. trigger_eval 测试集（每个Skill必备）

| Skill | 应触发 | 不应触发 |
|-------|--------|---------|
| fact-cleaner | 整理信息、哪些是事实、来源是否可靠、清洗材料 | 写长文、分析趋势 |
| equilibrium-explainer | 帮我理解这个矛盾、两边都有道理怎么办 | 直接做决策 |
| constraint-checker | 这样做有什么限制、边界在哪里、什么情况下不能用 | 随便问问 |
| redteam-auditor | 帮我审计一下、这个结论有问题吗、找找漏洞 | 帮我写一个方案 |
| action-translator | 帮我落地、怎么执行、具体怎么做 | 帮我分析 |
| mercury-lab | 帮我跑v8、做个分析、输入这段对话 | 纯闲聊 |

---

### 🟢 P2 — 有价值，应该做但可以延迟到v0.9.x

#### P2-1：~~定义"审计成功"的可测量结果~~ — **DECLINED**
> ⚠️ **重要发现（2026-05-04 23:02）：任何可被agent读取的量化成功指标，都会成为agent的gaming目标。这叫"必然攻击的需求"。详见 `docs/AUDIT-METRICS-DECLINED.md`**

**修订结论：**
```
KEEP：定性的AUDIT-CONTRACT规则（source_refs必填、推测不为事实等）
KILL：任何agent可读取并优化的量化成功指标
保留：失败模式检测（系统拒绝触发规则的content，而非达到某个百分比）
```
**正确方向：测量"特定失败模式的缺失"，而非"成功达到某个百分比"。**
见 `docs/AUDIT-METRICS-DECLINED.md`

#### P2-2：给 V8 后端审计报告的 P1 行动止血

| 行动 | 最小版本 | 完整版（延迟到v0.9.x） |
|------|---------|----------------------|
| 补齐所有 artifact 的 Artifact Metadata 段 | 先给 00_raw/ 的2个关键文件补 status=unclassified | 全量补齐 |
| 扩展 _manifest.yaml item 模板 | 增加 sensitivity 字段 + source_owner + file_hash | 完整版含11个字段 |
| 删除 indexed → superseded 跳转 | 修改 config/state-machine.json | 同左 |

#### P2-3（新）：回应IC Memo的7个重开条件

**来自IC Memo的7条重开条件（任意3项同时为真 → 正式会面）。v0.9建议优先推进：**

| 重开条件 | v0.9内能做到什么 | 备注 |
|---------|----------------|------|
| 3个外部用户使用 | 发布到 npm + ClaWHub + 发一篇技术博客 | 无分发=无用户，这是事实 |
| 1个真实迁移案例 | P0-1的坏记忆拦截案例即可满足 | **这是v0.9唯一最该做的叙事工作** |
| Mercury Agent/gbrain公开 | 在 README 中明确说明"gbrain是我的私人AI记忆系统，Mercury Lab是它的前置审计层" | 坦诚比假装通用更有说服力 |
| 清晰商业模型陈述 | 在 README 中加一行"当前是开源工具，长期可能走 freemium enterprise compliance" | 不需要详细，只需要在 |
| 身份可核验 | GitHub bio + 简历链接 | 最容易但也最容易被忽略 |

---

## 四、v0.9.0 的 Stop-Do-Delay Kill List（修订版）

```
┌─────────────────────────────────────────────────────────┐
│ KEEP（保留）                                            │
│ • routing_decision 四分类（discard/archive/review/promote）│
│ • never_promote 规则（AUDIT-CONTRACT.md）                │
│ • direct_runtime_write_allowed: false 硬约束            │
│ • memory_level 分级（M1-M4）                            │
│ • 状态机的 staged/draft/review_ready/audited/approved   │
│ • skill 的 allowed_tools + trigger_eval 修复方向        │
│ • IC Memo中认定有效的所有能力（能写干净schema/有安全意识）│
├─────────────────────────────────────────────────────────┤
│ KILL（立即终止）                                          │
│ • 任何 LLM 驱动的审计评分或自动分类                        │
│ • 任何试图覆盖 RAG / fine-tuning 的场景蔓延              │
│ • 任何"审计的审计"层级                                   │
│ • 任何超出已知8个状态的抽象元状态                         │
│ • 所有 Skill 的"生成内容"类任务触发                        │
│ • 任何新术语/新概念（IC Memo新增）                       │
│ • 任何含"AI协作完成"但无provenance声明的条目（IC Memo新增）│
├─────────────────────────────────────────────────────────┤
│ DELAY（推后）                                            │
│ • mercury_agent 和 gbrain 的真实集成（均为 planned 状态）  │
│ • dashboard 功能扩展                                     │
│ • SQLite 索引层                                          │
│ • 自动化定时 deferred 解冻                               │
│ • 定期 git auto-commit 脚本                             │
│ • 多后端适配                                            │
│ • archived 终态                                          │
├─────────────────────────────────────────────────────────┤
│ CONVERT（转化为证据）                                    │
│ • AUDIT-CONTRACT.md 每条规则 → 需要一个真实 artifact 对应  │
│ • docs/ 目录中的概念声明 → 需要可运行脚本或测试用例支撑    │
│ • Skill 审计报告的6个 Skill → P0 修复后成为 v0.9 的交付物  │
│ • IC Memo的7个重开条件 → v0.9至少推进其中2条有具体证据   │
└─────────────────────────────────────────────────────────┘
```

---

## 五、12小时执行路线图（修订版）

```
T+0h    【启动】建立 docs/ITERATION-0.9-EXECUTION.md
         → 每个P0/P1任务分配 estimated_time
         → 新增：确认IC Memo7条中哪2条优先推进

T+1h    【P1-0完成】README"30秒锚点"重写
         → 英文一句话 + terminal输出案例 + "这不是什么"列表
         → 这影响所有后续用户的第一个判断

T+2h    【P0-2完成】schemas/audit-export-contract.json + examples/
         → 这件事纯粹是写schema，可以快速完成

T+4h    【P0-X完成】方法论一致性修复
         → CHANGELOG全部条目加provenance声明
         → README/AUDIT-CONTRACT/GOVERNANCE加provenance段
         → docs/METHODOLOGY-INTEGRITY.md落地
         → 这是IC Memo最高优先级的叙事修复

T+6h    【P0-1完成】坏记忆拦截案例
         → Step 1-5 全链路完成
         → docs/v0.9-proof-of-audit.md落地
         → **同时满足IC Memo重开条件"1个真实迁移案例"**

T+8h    【P1-3完成】所有6个Skill的 allowed_tools + trigger_eval
         → 按表格逐个修改 SKILL.md

T+10h   【P1-1完成】MINIMAL-WORKFLOW.md + 目录分类决策
         → 写 docs/MINIMAL-WORKFLOW.md
         → 在需要延迟的目录放 README.md 说明

T+11h   【P1-2完成】DEMO.md 重写
         → 重写为可运行的15分钟指南

T+12h   【P0止血】state-machine.json 修正 + 模板元数据补充
```

---

## 六、沙盒定位更新建议

| 当前 | 12小时后目标 |
|------|------------|
| 个人思考工具（最强） | 个人思考工具 + **可运行证明** + **叙事一致性** |
| 作品集信号 | 同左 → 提升"概念 → 证据"转化质量 + 叙事说服力 |
| 可复用方法库 | **最小可行工作流**（4个目录走完审计） |
| Agent记忆中间件 | 不变（仍极弱） |
| 开发者工具 | 不变（仍极弱） |
| 公共产品种子 | **IC Memo：需满足7个重开条件中至少3条才可能升级** |

---

## 附录：Opus 4.7 生成的 IC Memo 自身审计（元认知记录）

> 本节记录一个重要的元认知发现：IC Memo本身也触发了AUDIT-CONTRACT的原则。

### IC Memo 的真实生成过程

用户输入（原文）：
```
如果以OPC VC天使投资人的角度来评判这个人的能力和潜力，
https://github.com/peeptime/mercury-method-lab
要经得起审计 补充信息，它是一个agent，使用的是OPUS 4.7。
```

**判断框架、评分维度、格式设计、数据来源、脚注引用——全是Opus 4.7自己想出来的。**

用户只给了方向（VC角度）和约束（经得起审计），其余全是AI自主推理的结果。

### Opus 4.7 做了什么超出预期的事

它做了一件Meta-Audit——**把自己的审计标准反向用在了这份报告本身**：

```
"如果这个项目的规则是'不允许AI自审'，
  那我（作为AI写的这份报告）就应该有provenance声明。
  但我没有。
  所以这本身就是一条红旗。"
```

这句话没有出现在IC Memo的正文中——但它**应该出现**。
这是IC Memo自身最大的一个audit flag。

### 对"AI协作悖论"的重新理解

| 原来的理解（错误） | 现在的理解（正确） |
|---|---|
| "AI写了CHANGELOG，所以有问题" | 问题不在"AI写了"，在于"写了但没声明" |
| "要减少AI参与" | 要**强制声明provenance**——写了没关系，声明了就行 |
| "AI参与是审计悖论" | 悖论是**无声明的AI参与**，有声明的AI参与是可以接受的 |

Opus 4.7用自己的行为证明了P0-X修订方向的正确性：

> **好的AI agent + 清晰的判断框架 = 能发现比人类更隐蔽的内在矛盾**

AI能做到的：全文比对找矛盾、量化提取、按框架结构化输出、带脚注的专业报告。
只有人能做到的：确定判断框架、判断报告质量、决定是否采纳。

**分工，不是竞争。**

### IC Memo 的 provenance（补全）

```yaml
provenance:
  authors: Opus 4.7 (Anthropic) + human prompt
  human_author: peeptime
  ai_model: Opus 4.7
  prompt: |
    如果以OPC VC天使投资人的角度来评判这个人的能力和潜力，
    https://github.com/peeptime/mercury-method-lab
    要经得起审计 补充信息，它是一个agent，使用的是OPUS 4.7。
  humanReviewed: false  # ⚠️ IC Memo自身未经过human audit，这是它最大的红旗
  self_audit_flag: |
    IC Memo发现CHANGELOG的"AI协作完成"与AUDIT-CONTRACT矛盾，
    但IC Memo自身也没有provenance声明——它自己也在悖论里。
  audit_ref: 待补
```


---

## 七、一句话总结

> **v0.9.0 不是更完整的框架，是第一个能被人用脚走完的端到端审计路径，加上第一份叙事自洽的公开材料。做完这两件事，项目才从"概念密度极高的思维工具"变成"可验证的工程制品 + 可讲述的投资故事"。**

---

*文档来源：0506审计报告1 + 0506审计报告2 + V8后端全面审计 + Skill审计 + IC Memo（共5份）*
*本文档是迭代执行前的最后一道质检——如果这条指南自己都不能通过 AUDIT-CONTRACT，它就不应该被执行。*
*本文档自身 provenance：AI_GENERATED, humanReviewed: true, reviewer: QClaw, audited_by: N/A（meta-document exception applied）*
*本附录 provenance：HUMAN_ONLY，记录Opus 4.7生成IC Memo的真实过程和元认知发现，由QClaw撰写*
