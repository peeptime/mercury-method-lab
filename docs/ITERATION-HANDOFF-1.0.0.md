# Mercury Method Lab · 1.0.0 版本迭代交付文档

> **目标读者：** 低频智能体（Codex 5.5 High，消耗次数不消耗token）
> **项目状态：** 当前版本 0.9.0，目标版本 1.0.0
> **项目性质：** 六个月冷静期，预计 2026-10 至 2026-12 再次激活
> **核心主题：** 压缩后续 agent 更新压力
> **协作声明：** `[AI_GENERATED]` drafted_by: QClaw; reviewed_by: project_owner

---

## 一、项目本质速查（2分钟理解）

```
Mercury Lab = AI 判断输出的预审计闸门
              不是 second brain，不是 RAG，不是 Skill 框架
              位置：在内容进入长期记忆之前，先问"这是事实还是推测"
              核心价值：不让 AI 生成的听起来对但站不住脚的结论污染记忆系统

工作目录：Z:\AI 202604\trae01\v8-mercury-backend
GitHub：  https://github.com/peeptime/mercury-method-lab
Dashboard：http://127.0.0.1:4788

当前版本：0.9.0（Release Hardening）
目标版本：1.0.0（功能冻结，六个月冷静期）
```

---

## 二、为什么现在是 1.0.0 的时机

```
v0.9.0 完成了什么：
  ✅ 端到端坏记忆拦截案例（v0.9-proof-of-audit.md）
  ✅ 方法论自洽性修复（AI协作悖论 → provenance声明）
  ✅ 必然攻击需求识别（P2-1 DECLINED → 不定义可gaming的成功指标）
  ✅ 6个Skill全修（allowed_tools + trigger_eval）
  ✅ 4层最小工作流文档
  ✅ README 中英双语更新

v0.9.0 没有解决（留待 1.x）：
  ❌ 文档驱动流程 → 代码逻辑固化
  ❌ 全量重读的重复计算问题
  ❌ 跨平台安装程序
  ❌ Web UI/UX 的 Mac 风格化

为什么版本号跳到 1.0：
  项目已完成从"概念声明"到"可运行证明"的转变
  核心架构（12层目录 + 状态机 + 4类routing_decision）已稳定
  现在是冻结期，不是放弃——是让系统跑六个月再迭代
```

---

## 三、四项任务详解

> **按优先级排序。建议顺序：任务1 → 任务2 → 任务3 → 任务4**
> **任务1和2是内务优化（降低未来更新压力）；任务3和4是对外交付**

---

### 任务1：执行链路优化——文档驱动 → 可复用代码

**目标：** 将文档驱动的流程固化为可复用的脚本，减少每次 agent 更新时的理解成本

**当前状态（文档驱动）：**
```
事实分类 → 读 docs/AUDIT-CONTRACT.md（人工理解规则）
路由决策 → 读 docs/MINIMAL-WORKFLOW.md（人工理解路径）
Provenance 声明 → 读 docs/METHODOLOGY-INTEGRITY.md（人工理解格式）
```

**期望状态（代码驱动）：**
```
npm run audit:check <file>        # 自动检查 provenance 声明
npm run audit:classify <text>     # 自动对输入做事实/推测/假设分类
npm run audit:route <file>        # 自动给出 routing_decision + 理由
npm run audit:export              # 生成标准 audit bundle
```

**具体做法（建议）：**

1. 新建 `scripts/audit-core.mjs` 或 `scripts/audit-core/` 目录
2. 将以下逻辑从文档迁移到代码：
   - `classify_content()` — 判定输入为 fact/speculation/hypothesis
   - `evaluate_evidence()` — 检查 source_refs / audit_refs 是否存在
   - `route_decision()` — 根据 AUDIT-CONTRACT 规则输出 discard/archive/review/promote
   - `generate_provenance()` — 输出标准 provenance YAML 头
3. 原文档保留作为**解释层**（为什么这样做），代码作为**执行层**（怎么做）
4. 现有脚本（`validate_artifacts.mjs`、`rebuild_index.mjs`）调用这些核心函数

**验收标准：**
- `npm run audit:check docs/AUDIT-CONTRACT.md` 输出结构化的 provenance + routing 信息
- `npm run validate` 仍然通过（向后兼容）
- 新增测试文件 `tests/audit-core.test.mjs`（或 `tests/` 目录）

**前瞻性设计（为 Codex 5.5 准备）：**
- Codex 5.5 预期有更强的工具调用能力
- 将 `audit-core.mjs` 设计为 MCP-compatible：导出为 `MCP server tool`，可直接被 agent 调用
- 不需要 agent 读文档就知道"这个文件的 routing_decision 是什么"

---

### 任务2：Context 切换效率——增量更新 + 差异加载 + 状态缓存

**目标：** 减少 agent 每次更新时的重复计算

**当前问题：**
```
每次更新：
  → npm run validate 扫描全部文件（全量遍历）
  → npm run index 重建全部索引（全量扫描）
  → agent 每次都需要重新读完整 docs/（全量上下文）

结果：
  - validate 越来越慢（文件越来越多）
  - index 越来越慢（artifacts 越来越多）
  - agent 每次会话浪费大量 token 在重复读取已知文件
```

**具体做法（建议）：**

1. **增量验证（`validate_artifacts.mjs` 改造）：**
   ```
   新增：npm run validate:incr
   - 读取上次 validate 的时间戳（data/validate-last-run.json）
   - 只扫描距上次修改后 changed 的文件
   - 输出变化摘要：added / modified / deleted / unchanged
   - 完整 validate 仍保留为 npm run validate（全量回归测试用）
   ```

2. **增量索引（`rebuild_index.mjs` 改造）：**
   ```
   新增：npm run index:incr
   - 读取上次索引状态（11_indexes/_index-state.json）
   - 只索引 changed / new 文件
   - 已 indexed 且未变化的文件跳过
   - 支持 npm run index（强制全量重建）
   ```

3. **Agent 快速锚点文件（最重要的前瞻性设计）：**
   ```
   docs/ITERATION-GUIDE-LATEST.md
     → 每次版本更新时由脚本自动生成
     → 包含：当前版本状态 + 上次做了什么 + 下次做什么 + 关键文件路径
     → 2KB 以内，agent 读这个就够了，不需要读完整迭代指南

   docs/AGENT-CONTEXT-BUDGET.md
     → 当前 agent 上下文限制说明
     → 告诉 agent "不要全量读，优先读哪些文件"
     → 已有，需确认存在并更新
   ```

4. **状态缓存文件（新建 `data/` 目录结构）：**
   ```
   data/
     validate-last-run.json     # 上次 validate 时间戳 + 扫描摘要
     index-state.json           # 上次索引状态（file hash + indexed time）
     release-last.json          # 上次 release 的版本号 + 日期
   ```

**前瞻性设计（为 Codex 5.5 准备）：**
- Codex 5.5 预期有更长的上下文窗口，但更贵
- 增量设计确保即使上下文窗口不变，每次更新的 token 成本也不增长
- `ITERATION-GUIDE-LATEST.md` 的自动生成机制，是 Codex 5.5 激活时的第一个接触点

---

### 任务3：跨平台安装程序

**目标：** 一键安装，覆盖 Mac / Windows / Linux / Android（通过 Termux）

**当前状态：**
```
只有 npm install，需要手动配置 node 环境
没有安装程序，没有平台检测，没有自动依赖处理
```

**期望状态：**
```
Mac：      install-mac.sh 或 .dmg 包
Windows：  install-windows.ps1 或 .exe 向导
Linux：    install-linux.sh（apt/yum/binary）
Android：  install-termux.sh（在 Termux 里跑）
```

**具体做法（建议）：**

1. **统一入口脚本（`install/install.sh`）：**
   ```bash
   # 检测操作系统
   case "$(uname -s)" in
     Darwin*)    PLATFORM=mac ;;
     Linux*Android*) PLATFORM=linux ;;
     MINGW*CYGWIN*)  PLATFORM=windows ;;
     *)          echo "不支持的平台" && exit 1 ;;
   esac
   
   # 检查 node 版本
   # 交互式引导（选择组件）
   # 安装依赖（npm install）
   # 安装 git hooks（npm run hooks:install）
   # 启动 dashboard
   ```

2. **`install/` 目录结构：**
   ```
   install/
     install.sh              # 统一入口（Linux/macOS）
     install-windows.ps1     # Windows 专用（PowerShell）
     install-termux.sh      # Android Termux 专用
     README.md               # 各平台安装说明
     requirements.txt        # Node.js 版本要求（可选）
   ```

3. **文档（`docs/INSTALL.md`）：**
   ```
   ## Mac 安装
   1. 安装 Node.js 20+（推荐用 nvm）
   2. git clone ...
   3. ./install/install.sh
   4. npm run dashboard
   
   ## Windows 安装
   1. 安装 Node.js 20+（官网或 winget）
   2. git clone ...（或直接解压 zip）
   3. .\install\install-windows.ps1
   4. npm run dashboard
   
   ## Linux 安装
   1. 安装 Node.js 20+
   2. git clone ...
   3. ./install/install.sh
   4. npm run dashboard
   
   ## Android (Termux) 安装
   1. 安装 Termux（F-Droid）
   2. pkg install nodejs git
   3. git clone ...
   4. ./install/install-termux.sh
   5. npm run dashboard
   ```

4. **自动检测逻辑（放入 `scripts/` 或 `install/`）：**
   - Node.js 版本检测（>=20）
   - Git 是否安装
   - npm 镜像源检测（可选，自动切换国内镜像）
   - 防火墙提示（dashboard 4788 端口）

**复杂度控制：**
- 不要做复杂的 GUI 安装向导（与项目风格不匹配）
- 纯脚本 + Markdown 文档即可
- 优先保证脚本成功率，再考虑图形化

**前瞻性设计（为 Codex 5.5 准备）：**
- Codex 5.5 可能在更多平台运行
- 安装脚本的一致性设计确保跨平台兼容性
- Termux 支持意味着可以在手机/平板上跑完整 Mercury Lab

---

### 任务4：Web UI/UX 更新——Mac 风格

**目标：** 让 dashboard 的视觉体验更有 Mac 原生风味

**当前技术栈：**
```
dashboard/
  index.html    ← 纯 HTML，无框架
  styles.css    ← 纯 CSS，无预处理器
  app.js        ← 原生 JS，无构建工具
dashboard_server.mjs  ← Node.js 原生 http server（无框架）
端口：4788
版本：2026.05.02-c
```

**参考方向：**

1. **整体风格（参考 hyperagent.com/learning）：**
   - 大量留白，降低信息密度
   - 清晰的视觉层次（标题/正文/辅助信息的区分）
   - 柔和的阴影和圆角（Mac 系统风格）
   - 浅色主题为主（符合 Mac 默认审美）

2. **动效（参考 jakubantalik/transitions-dev）：**
   - 页面切换使用流畅过渡动画（而非突然切换）
   - 数据加载使用骨架屏（skeleton loading）
   - 状态变化使用微交互（按钮 hover、输入 focus）
   - 避免过度动画（保持专业感）

3. **字体和配色：**
   ```
   字体：SF Pro Display / -apple-system / BlinkMacSystemFont（系统原生字体）
   主色：#007AFF（macOS Blue）
   背景：#F5F5F7（macOS 浅灰背景）
   文字：#1D1D1F（深黑）
   边框：#D2D2D7（浅灰分隔线）
   ```

4. **Dashboard 功能优化（配合风格更新）：**
   - 当前 dashboard 主要显示 artifacts 列表和状态
   - 可考虑增加：routing_decision 分布图（饼图/柱状图）
   - 可考虑增加：最近活动时间线
   - **注意：** 功能优先于装饰，不要为了好看加不必要的东西

**具体做法（建议）：**

1. **`dashboard/styles.css` 改造（主要）：**
   ```
   - 重置基础样式（box-sizing、margin、font）
   - 定义 CSS 变量（颜色、间距、字体）
   - 重构卡片、按钮、输入框的样式（Mac 风格）
   - 添加 transitions 动效
   - 响应式支持（Mac 浏览器 + iPad）
   ```

2. **`dashboard/index.html` 优化（次要）：**
   ```
   - 语义化 HTML 结构
   - 减少不必要的 div 嵌套
   - 添加 ARIA 无障碍标签
   - 保持结构不变，只改 class 名称
   ```

3. **`dashboard/app.js`（最小改动）：**
   ```
   - 只改 DOM 操作相关的 class 名称
   - 不改变业务逻辑
   - 可选：增加简单的 loading 状态动画
   ```

4. **参考安装：**
   ```bash
   npx skills add jakubantalik/transitions-dev  # 安装动效参考 skill
   # 然后阅读其 SKILL.md 和示例代码
   ```

**复杂度控制：**
- **不要重写** `dashboard_server.mjs`（这个已经稳定）
- **不要引入** React/Vue 等框架（增加复杂度）
- CSS 变量 + 少量 transitions 即可实现 Mac 风格
- 动效要有节制：页面进入/切换 + 加载状态 + hover 反馈，三处足够

**前瞻性设计（为 Codex 5.5 准备）：**
- Codex 5.5 可能有更好的视觉理解能力
- 清晰的 UI 结构让 Codex 5.5 更容易理解 dashboard 状态
- CSS 变量设计使未来主题切换更简单（暗色模式预留）

---

## 四、版本更迭前瞻（供下次激活参考）

> 以下内容是供 6-12 个月后激活时使用的，不是本次任务

### 2026-10 ~ 2026-12 预计：Codex 5.5 发布

```
Codex 5.5 预期变化（基于 OpenAI 演进方向）：
  - 更强的长上下文能力
  - 更可靠的工具调用
  - 多模态能力提升
  - 更低的 hallucination 率

Mercury Lab 应如何准备：
  1. 确保 MCP-compatible 接口就绪（任务1的输出）
     → 这样 Codex 5.5 可以直接调用 audit-core 作为工具
  2. 确保迭代锚点文件自动生成（任务2的输出）
     → Codex 5.5 激活时读 3 个文件就能上手
  3. 确保跨平台安装脚本就绪（任务3的输出）
     → Codex 5.5 可以在任何环境快速部署
```

### 1.1.0 ~ 1.2.0 候选功能（按优先级）

| 优先级 | 功能 | 触发条件 |
|--------|------|----------|
| P1 | MCP Server 导出（audit-core.mjs） | Codex 5.5 发布 |
| P1 | 自动生成 ITERATION-GUIDE-LATEST.md | release 时自动触发 |
| P2 | 暗黑模式支持 | 用户请求 |
| P2 | 导出格式增加 JSON Lines 支持 | 目标后端需要 |
| P3 | 多语言 UI（EN/CN） | 国际化需求 |
| P3 | 插件系统（自定义 routing 规则） | 社区请求 |

### 版本策略

```
1.0.0 — 功能冻结，稳定性优先，六个月冷静期
1.0.x — 仅修复关键 bug，不新增功能
1.1.0 — Codex 5.5 适配 + MCP Server
1.2.0 — 插件系统 + 国际化
```

---

## 五、版本 1.0.0 冻结检查清单

> 在完成 1.0.0 release 之前，确认以下所有项

### 版本号更新
- [ ] `package.json`：`version: "1.0.0"`
- [ ] `config/project-meta.json`：`version: "1.0.0"`
- [ ] `README.md`、`README.en.md`：版本号同步更新
- [ ] `CHANGELOG.md`：新增 1.0.0 条目

### GitHub 同步
- [ ] GitHub 仓库 Description 更新（与 README One Sentence 一致）
- [ ] GitHub Topics 更新（mercury-method-lab 相关标签）
- [ ] LICENSE 文件确认（MIT）
- [ ] GitHub Pages 确认（如果有的话）

### 功能验收
- [ ] `npm run validate` 通过
- [ ] `npm run index` 生成正确索引
- [ ] `npm run doctor` 无严重警告
- [ ] `npm run dashboard` 正常启动（http://127.0.0.1:4788）

### 文档验收
- [ ] `docs/MINIMAL-WORKFLOW.md` 路径与实际目录一致
- [ ] `docs/ITERATION-GUIDE-LATEST.md` 存在且准确
- [ ] `CHANGELOG.md` 包含完整版本历史
- [ ] `install/README.md` 或 `docs/INSTALL.md` 存在

### 交付物检查
- [ ] `install/` 目录存在（含跨平台安装脚本）
- [ ] `scripts/audit-core.mjs` 或 `scripts/audit-core/` 存在（任务1输出）
- [ ] 增量脚本存在（任务2：`validate:incr`、`index:incr`）
- [ ] Dashboard UI 更新完成（任务4）

---

## 六、立即开始的步骤（给低频智能体）

> 按顺序执行，不要并行。每步完成后再进入下一步。

```
步骤 1：确认环境
  cd Z:\AI 202604\trae01\v8-mercury-backend
  node --version   # 需要 >= 20
  npm --version
  git status

步骤 2：阅读关键文件（按顺序，每个 5 分钟）
  2.1 README.md（整体理解）
  2.2 docs/MINIMAL-WORKFLOW.md（工作流理解）
  2.3 docs/AUDIT-CONTRACT.md（核心规则理解）
  2.4 package.json scripts（可用命令清单）

步骤 3：运行验收测试
  npm install
  npm run doctor
  npm run validate
  npm run index

步骤 4：从任务1开始，按本文档第三节的顺序执行
  任务1（执行链路优化）→ 任务2（Context效率）→ 任务3（跨平台安装）→ 任务4（UI更新）

步骤 5：版本 1.0.0 freeze
  按照第五节的检查清单逐项完成
  更新版本号
  GitHub release + push

步骤 6：写 ITERATION-GUIDE-LATEST.md
  内容：当前是 1.0.0，下次迭代做什么，在哪里
  位置：docs/ITERATION-GUIDE-LATEST.md
```

---

## 七、已知的隐藏逻辑（项目中未显化）

> 以下内容目前散落在各处对话和审计记录中，需要显化到项目中

### 7.1 迭代的自举悖论

```
Mercury Lab 用于审计其他 AI 系统，但自身的迭代也依赖 AI。
这意味着：项目的每一次迭代都在使用"自己审计标准不允许的东西"。

显化方式：
  - docs/METHODOLOGY-INTEGRITY.md 已记录 AI协作悖论
  - 所有产出的 provenance 声明就是解决方案
  - 不需要额外处理，只需要保持 provenance 声明的执行

前瞻性含义：
  - Codex 5.5 更新后，这个悖论可能加剧（更强的AI = 更难察觉的自审）
  - 1.0.0 的 provenance 机制是防御性设计，不是消除悖论
```

### 7.2 必然攻击的需求

```
任何可被 agent 读取的量化成功指标，都会成为 gaming 目标。
这意味着：Mercury Lab 不能定义"promote率 < X%"这样的指标。

正确方向：检测特定失败模式的缺失，而非测量成功达到某个百分比
  - 失败模式1：没有 provenance 声明的 AI 产出进入了长期记忆
  - 失败模式2：同一个人既写了内容又审核了同一内容
  - 失败模式3：没有 source_refs 的内容被 promote

显化方式：
  - docs/AUDIT-METRICS-DECLINED.md 已记录
  - 下次迭代时，不要引入任何新的量化指标
```

### 7.3 Context 成本的复利效应

```
每次 agent 更新都会累积上下文成本。
长期不更新的代价：上下文越来越长，每次更新的 token 成本指数增长。

显化方式：
  - 任务2的增量更新机制是解决方案
  - ITERATION-GUIDE-LATEST.md 自动生成是另一层防御

前瞻性含义：
  - 6个月冷静期后，agent 重新激活时的第一件事应该是"清空/压缩上下文"
  - 建议在 1.0.0 freeze 时生成一份"激活检查清单"（CHECKLIST-REACTIVATION.md）
```

### 7.4 版本号的语义约定

```
major.minor.patch：
  - major：破坏性变更（artifact结构 / 内存架构 / 上游兼容性）
  - minor：新增兼容功能（新的 adapter / migration path / workflow）
  - patch：文档 / 验证 / 脚本修复

当前阶段（1.0.x）：
  - 只允许 patch 和 minor
  - major 变更需要 6 个月冷静期后的明确决策
```

---

## 八、避免的陷阱

```
❌ 不要重写 dashboard_server.mjs
  → 这个文件已经稳定，改动风险高，收益低

❌ 不要引入任何前端框架（React/Vue/Angular）
  → 增加复杂度，与项目风格不符

❌ 不要定义任何新的量化成功指标
  → 这会被 gaming，违背 AUDIT-CONTRACT 的 P0 原则

❌ 不要把文档全部改写成代码
  → 文档是"为什么"，代码是"怎么做"，两者都保留

❌ 不要在 1.0.0 引入 breaking change
  → 1.0.0 是冻结版本，不是实验版本

❌ 不要做过于复杂的安装程序
  → 脚本 + Markdown 文档即可，GUI 是加分项不是必须项
```

---

## 九、当你遇到问题时

```
问题：不知道某个文件的作用
→ 读 AGENTS.md，里面有目录结构的解释

问题：不知道某个命令的含义
→ 读 package.json scripts 字段，或运行 npm run <script> --help

问题：不确定某个决策是否正确
→ 读 docs/AUDIT-CONTRACT.md 的 Priority 表
  P0 = 不能违背，P4 = 可以商量

问题：遇到了项目中没有记录的情况
→ 先看 docs/METHODOLOGY-INTEGRITY.md 的处理原则
  原则：宁可保守（discard），不要激进（promote）

问题：需要新增功能但不确定要不要做
→ 问自己：这个功能会降低还是提高"入脑内容"的质量？
  如果提高 → 做
  如果不确定 → 延迟到 1.1.0
```
