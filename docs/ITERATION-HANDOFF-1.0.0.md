# Mercury Method Lab · 1.0.0 迭代目标文档

> **项目：** Mercury Method Lab
> **当前版本：** 0.9.0
> **目标版本：** 1.0.0
> **项目性质：** 六个月冷静期，预计 2026-10 ~ 2026-12 再次激活
> **声明：** `[AI_GENERATED]` drafted_by: QClaw; reviewed_by: project_owner

---

## 目标

```
将 Mercury Method Lab 从 0.9.0 推进到 1.0.0，
使项目在六个月冷静期内几乎不需要人工干预即可维持，
同时为 2026-10 ~ 2026-12 的 Codex 5.5 更新做好准备。
```

**1.0.0 的核心主题：压缩后续 agent 更新压力。**

---

## 项目速查

```
工作目录：  Z:\AI 202604\trae01\v8-mercury-backend
GitHub：    https://github.com/peeptime/mercury-method-lab
Dashboard： http://127.0.0.1:4788
Node：      >= 20
包管理：     npm
当前版本：   0.9.0（Release Hardening）
目标版本：   1.0.0（Feature Freeze）
```

### 核心定位

```
Mercury Lab = AI 判断输出的预审计闸门
              在内容进入长期记忆之前，先问"这是事实还是推测"
              不是 second brain / RAG / Skill 框架
              核心价值：不让 AI 生成的听起来对但站不住脚的结论污染记忆系统
```

### 核心架构

```
12层目录：  00_inbox → 00_raw → 01_segmented → 02_cleaned → 03_uncertain
          → 04_memory_candidates → 05_decision_logs → 06_action_plans
          → 07_audit_reports → 08_skills → 09_templates → 10_exports → 11_indexes

4类路由：   discard / archive / review / promote

状态机：    staged → indexed → draft → review_ready → audited → approved → superseded
          或 rejected（终态）
```

---

## 约束（必须遵守）

> 以下是硬约束。任何违背都需要在 [BLOCKER] 中明确说明并等待决策。

```
❌ 不能修改 dashboard_server.mjs
    → 已稳定，是项目的稳定锚点

❌ 不能引入前端框架（React/Vue/Angular/Svelte/任何UI框架）
    → 项目风格是"无依赖纯手工"，框架会破坏这个定位

❌ 不能定义任何量化成功指标
    → 任何可被 agent 读取的"promote率 < X%"指标都会被 gaming
    → 正确方向：检测"特定失败模式的缺失"，而非测量"成功百分比"
    → 详见 docs/AUDIT-METRICS-DECLINED.md

❌ 不能在 1.0.x 阶段引入 breaking change
    → 1.0.0 是功能冻结，breaking change 必须等到 2.0.0

❌ 不能把文档全部改写成代码
    → 文档是"为什么这样做"，代码是"怎么做"，两者都保留
    → 代码无法替代解释，文档无法替代执行

❌ 不能忽略 npm run validate 的 violations
    → 任何 violation 都是 P0，必须修复或记录在案
```

---

## 质量标准（必须通过）

> 每项任务完成后，这些标准必须全部满足。

```
验收命令（必须全部通过）：
  npm run doctor          → 无严重警告
  npm run validate       → 0 violations
  npm run index          → 索引正确生成
  npm run dashboard      → http://127.0.0.1:4788 可访问

交付标准：
  ✅ GitHub Release v1.0.0 已创建
  ✅ docs/ITERATION-GUIDE-LATEST.md 已更新
  ✅ docs/CHECKLIST-REACTIVATION.md 已创建
  ✅ 跨平台安装文档存在（至少 Mac / Windows / Linux）
  ✅ 新增代码有测试覆盖
```

---

## 四个工作方向

> 这四个方向是当前最需要解决的问题，但你有权决定每个方向的实现深度。
> 如果你觉得某个方向不值得投入，可以少做，但必须说明原因。
> 如果你有更好的方向没列在这里，尽管做。

---

### 方向A：降低 agent 重复工作的成本

**问题：** 每次 agent 更新都需要重读文档、重跑全量 validate 和 index，6个月后上下文成本爆炸。

**期望结果（选择一种或多种实现）：**

```
A1：增量更新机制
     npm run validate:incr   → 只验证变化的文件，< 3秒
     npm run index:incr     → 只索引变化的文件，< 2秒

A2：自动锚点文件
     docs/ITERATION-GUIDE-LATEST.md
     → 每次版本更新时自动生成或手动更新
     → agent 激活时读这个就够了，不需要读完整迭代指南
     → 内容：当前版本 / 上次做了什么 / 下次做什么 / 关键路径

A3：Agent 快速启动包
     docs/AGENT-CONTEXT-BUDGET.md
     → 告诉 agent"优先读什么，不要读什么"
     → 让 agent 在有限上下文中做出有效工作
```

**参考资源：** `docs/ITERATION-HANDOFF-1.0.0.md` 任务2节有详细建议（选择性使用）

---

### 方向B：减少人类新用户的上手成本

**问题：** 当前只有 `npm install`，没有跨平台安装程序，新用户在配置环境时容易卡住。

**期望结果（至少实现两种）：**

```
B1：跨平台安装脚本
     Mac 用户：     ./install/install.sh
     Windows：     .\install\install-windows.ps1
     Linux：       ./install/install.sh（通用）
     Android/Termux：./install/install-termux.sh

B2：安装指南文档
     docs/INSTALL.md 或 install/README.md
     → 覆盖全部 4 个平台
     → 包含常见问题解答

B3：自动化环境检测
     安装脚本能检测 Node.js 版本、Git 是否安装
     并给出清晰的错误信息和解决指引
```

**参考资源：** `docs/ITERATION-HANDOFF-1.0.0.md` 任务3节有详细建议（选择性使用）

---

### 方向C：提升项目的外部感知质量

**问题：** Dashboard UI 无风格，视觉上不专业，影响项目的第一印象。

**期望结果（选择一种方式）：**

```
C1：纯 CSS 风格化
     重写 dashboard/styles.css
     风格参考：macOS 原生应用（大量留白、柔和阴影、SF字体）
     动效参考：jakubantalik/transitions-dev
     实现方式：CSS 变量 + 少量 transitions
     不引入任何框架

C2：功能增强
     在 Dashboard 中增加实用功能：
     - routing_decision 分布图（饼图或柱状图）
     - 最近活动时间线
     - artifact 搜索/过滤
     视觉风格配合方向C1
```

**参考资源：**
- hyperagent.com/learning（整体风格参考）
- jakubantalik/transitions-dev（动效参考）：`npx skills add jakubantalik/transitions-dev`

**参考资源：** `docs/ITERATION-HANDOFF-1.0.0.md` 任务4节有详细建议（选择性使用）

---

### 方向D：让 agent 能用代码而不是文档来工作

**问题：** agent 现在需要读文档才能理解规则，文档驱动的流程意味着每次都需要重读。

**期望结果（选择一种实现）：**

```
D1：规则代码化
     将 docs/AUDIT-CONTRACT.md 的规则翻译成可执行代码
     scripts/audit-core/
       classifier.mjs       → 内容分类（fact/speculation/hypothesis）
       evidence-evaluator.mjs → 证据评估（source_refs / audit_refs）
       router.mjs           → routing_decision 决策
       provenance.mjs       → provenance 声明生成/解析
     
     这样 agent 可以：npm run audit:check <file> 而不需要读 AUDIT-CONTRACT.md

D2：MCP 兼容接口
     如果实现了 D1，进一步包装为 MCP Server tool
     scripts/audit-mcp-server.mjs
     → Codex 5.5 可以直接调用这些工具

D3：测试驱动
     新增的代码必须有测试覆盖
     scripts/audit-core/tests/
     覆盖率目标：>= 90%
```

**参考资源：** `docs/ITERATION-HANDOFF-1.0.0.md` 任务1节有详细建议（选择性使用）

---

## 版本更迭前瞻（供你决策参考）

> 以下是你在完成 1.0.0 后可能想做的事情，不是必须做的。

```
1.0.x    ← 冻结期（现在 ~ 2026-10），只修 bug，不加功能
1.1.0    ← Codex 5.5 适配（预计 2026-10 ~ 2026-12）
          - MCP Server 上线（D2 的输出）
          - ITERATION-GUIDE-LATEST.md 自动生成
          - 暗黑模式 UI（CSS 变量已预留）
1.2.0    ← 插件系统 + 国际化
2.0.0    ← 重大架构变更（需要明确社区需求驱动）
```

---

## 版本更迭推荐

> 基于你的能力判断，决定是否加入以下候选功能。
> 每个功能后面有"理由"，但最终决定权在你。

### P1 推荐（价值高，值得投入）

```
R1：docs/ITERATION-GUIDE-LATEST.md 的自动生成
    理由：在 release 时自动更新，不需要人工维护
    实现：在 npm script 的 release 钩子里触发
    收益：6个月冷静期后 agent 激活的第一个接触点

R2：增量 validate 和 index
    理由：这是 Context 成本复利效应的唯一解
    实现：状态缓存 + hash 对比 + 增量处理
    收益：每次 agent 更新的成本从 O(n) 降到 O(1)
```

### P2 可选（有价值，看时间）

```
R3：跨平台安装脚本
    理由：降低新用户上手门槛
    收益：社区贡献者更容易上手

R4：audit-core 模块（D1）
    理由：让 agent 能用代码工作，减少文档依赖
    收益：后续 agent 更新的 token 成本降低
```

### P3 锦上添花（有时间再做）

```
R5：Dashboard 功能增强（C2）
    理由：提升项目第一印象
    收益：美观，但不解决核心问题

R6：GitHub Actions CI
    理由：跨平台自动化测试
    收益：早做早受益，但不是 1.0.0 必须
```

---

## 版本 1.0.0 交付清单

> 完成所有工作后，逐项确认。

```
版本号更新：
  □ package.json → version: "1.0.0"
  □ config/project-meta.json → version: "1.0.0"
  □ README.md / README.en.md → 版本号同步
  □ CHANGELOG.md → 新增 1.0.0 条目（含 provenance 声明）

GitHub 同步：
  □ GitHub Release v1.0.0 已创建
  □ GitHub 仓库描述已更新（与 README One Sentence 一致）

文档交付：
  □ docs/ITERATION-GUIDE-LATEST.md 已更新
  □ docs/CHECKLIST-REACTIVATION.md 已创建
  □ docs/INSTALL.md 或 install/README.md 已创建

验收通过：
  □ npm run doctor → 无严重警告
  □ npm run validate → 0 violations
  □ npm run index → 正确生成
  □ npm run dashboard → http://127.0.0.1:4788 可访问

Git 操作：
  □ git commit -m "1.0.0: feature freeze"
  □ git tag v1.0.0
  □ git push origin main --tags
```

---

## 冷静期后激活流程（供参考）

> 完成 1.0.0 后，把这个文件当作你的交接记录。

```
预计激活时间：2026-10 ~ 2026-12（Codex 5.5 发布后）

激活前：
  1. 运行 npm run validate:incr（不是全量 validate）
  2. 检查 data/ 目录的缓存是否过期（>90天）
  3. 读 docs/ITERATION-GUIDE-LATEST.md
  4. 读 docs/AGENT-CONTEXT-BUDGET.md

激活时：
  5. 确认 Codex 5.5 是否已发布
  6. 如果发布了，根据版本更迭前瞻决定本次迭代范围
  7. 如果没发布，等待或做 R1/R2 优化

激活后：
  8. 更新 ITERATION-GUIDE-LATEST.md
  9. 运行 npm run validate:incr（不是全量）
  10. commit + push
```

---

## 已知的隐藏逻辑（项目中未显化）

> 你有权决定是否将这些显化到项目中。

### 1. 迭代的自举悖论

```
Mercury Lab 用于审计其他 AI 系统，但自身的迭代也依赖 AI。
这意味着：项目的每一次迭代都在使用"自己审计标准不允许的东西"。

现状：docs/METHODOLOGY-INTEGRITY.md 已记录 AI协作悖论
     所有产出的 provenance 声明就是解决方案

你不需要额外处理，只需要保持 provenance 声明的执行。
```

### 2. 必然攻击的需求

```
任何可被 agent 读取的量化成功指标，都会成为 gaming 目标。
正确方向：检测"特定失败模式的缺失"，而非测量"成功百分比"
详见：docs/AUDIT-METRICS-DECLINED.md
```

### 3. Context 成本的复利效应

```
每次 agent 更新都会累积上下文成本。
长期不更新 = 上下文越来越长 = 每次更新的 token 成本指数增长。
解决方案：增量更新机制 + ITERATION-GUIDE-LATEST.md 自动锚点
```

---

## 当你遇到问题时

```
问题：不知道某个文件的作用
→ 读 AGENTS.md

问题：不确定某个决策是否正确
→ 读 docs/AUDIT-CONTRACT.md 的 Priority 表
  P0 = 不能违背，P4 = 可以商量

问题：需要新增功能但不确定要不要做
→ 问：这个功能会降低还是提高"入脑内容"的质量？
  如果提高 → 做
  如果不确定 → 延迟到 1.1.0

问题：测试覆盖率不够 90%
→ 不要降低覆盖率要求，增加测试用例
```

---

## 性能基准（如果实现了相关功能）

```
npm run validate:incr  < 3 秒（95%文件未变化时）
npm run index:incr     < 2 秒（95%文件未变化时）
npm run doctor         < 3 秒
npm run audit:check    < 500ms（如果实现了 audit-core）
```

---

## [BLOCKER] 报告模板

如果遇到无法自行解决的问题，使用以下模板报告：

```markdown
## [BLOCKER] 在 ___ 遇到问题

### 遇到的问题
（具体描述：期望行为 vs 实际行为）

### 错误信息
```
（完整的错误输出）
```

### 已尝试的解决方法
1. （尝试1）
2. （尝试2）

### 需要什么帮助
（具体说明）
```

---

**你现在有了目标、约束、质量标准和资源。**
**怎么到达，由你决定。**
**祝顺利。**
