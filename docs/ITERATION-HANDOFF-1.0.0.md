# Mercury Method Lab · 1.0.0 版本迭代交付文档

> **目标读者：** 低频智能体（Codex 5.5 High，消耗次数不消耗token）
> **项目状态：** 当前版本 0.9.0，目标版本 1.0.0
> **项目性质：** 六个月冷静期，预计 2026-10 至 2026-12 再次激活
> **核心主题：** 压缩后续 agent 更新压力
> **协作声明：** `[AI_GENERATED]` drafted_by: QClaw; reviewed_by: project_owner
> **压力等级：** MAXIMUM — 本文档是唯一的执行依据，没有第二次补充机会

---

## 执行警告

```
本文档是低频智能体在1.0.0迭代周期内唯一的执行依据。
不允许跳过任何章节。
不允许以"感觉不必要"为由跳过某个子任务。
不允许以"复杂度太高"为由简化任务。
如果某个任务超出能力范围，必须在对应章节末尾的[BLOCKER]标记处
明确写出遇到了什么，而不是默默跳过。
```

---

## 一、项目本质速查（必须全文阅读，不得跳过）

### 1.1 项目定位

```
Mercury Lab = AI 判断输出的预审计闸门
              在内容进入长期记忆之前，先问"这是事实还是推测"
              不是 second brain，不是 RAG，不是 Skill 框架
              核心价值：不让 AI 生成的听起来对但站不住脚的结论污染记忆系统
```

### 1.2 核心架构

```
工作目录：        Z:\AI 202604\trae01\v8-mercury-backend
GitHub：          https://github.com/peeptime/mercury-method-lab
Dashboard：       http://127.0.0.1:4788
当前版本：        0.9.0（Release Hardening）
目标版本：        1.0.0（功能冻结，六个月冷静期）
Node 版本要求：   >= 20
包管理器：        npm（无 yarn/pnpm）
语言：           ESM（所有 .mjs 文件）
```

### 1.3 12 层目录结构（必须完全理解）

```
00_inbox/          ← 接收外部输入的队列（未处理）
00_raw/            ← 原始材料入口（未分类的事实/推测/假设）
01_segmented/      ← 按维度分割后的内容（每个文件一个维度）
02_cleaned/        ← 去除噪音后的干净事实（只有事实，无推测）
03_uncertain/      ← 无法确认真假的悬而未决内容
04_memory_candidates/  ← 候选记忆，含 routing_decision 标注
05_decision_logs/  ← 每个 decision 的理由记录
06_action_plans/   ← 具体的行动方案（有触发条件和验收标准）
07_audit_reports/  ← 完整审计轨迹（不可伪造，不可删除）
08_skills/         ← Skill 定义文件（mercury-lab 及 5 个子 skill）
09_templates/      ← 文档模板
10_exports/        ← 导出给外部系统的审计包（JSON bundle）
11_indexes/       ← 所有 artifact 的 JSON 索引
config/            ← 配置文件（state-machine.json, project-meta.json 等）
data/              ← 运行时数据（lifecycle-log, cache, state）
schemas/           ← JSON Schema 定义（audit-export-contract.json）
scripts/           ← 所有可执行脚本（Node.js ESM）
dashboard/         ← Web UI（纯 HTML/CSS/JS，无框架）
```

### 1.4 四类 routing_decision（必须记住）

```
discard    ← 推测/无来源/违反AUDIT-CONTRACT → 不进入长期记忆
archive    ← 有价值但不适合promote → 冷存储
review     ← 需要人工复核 → 进入人工审核队列
promote    ← 满足所有条件 → 进入长期记忆
```

### 1.5 核心规则优先级

```
P0：不让坏记忆进入长期记忆（compound damage）
P1：不让无来源的事实promote（source sovereignty）
P2：不让未评级的碎片promote（quality grading）
P3：不让归档内容变成提醒（cold storage is terminal）
P4：不直接写运行时数据库（migration must be reversible）
```

### 1.6 当前已知弱点（需要在1.0.0解决）

```
弱点A：validate_artifacts.mjs 全量扫描，越来越慢
弱点B：rebuild_index.mjs 全量索引，越来越慢
弱点C：没有跨平台安装程序，新用户上手成本高
弱点D：dashboard UI 无风格，视觉上不专业
弱点E：文档驱动的流程 → agent 每次都需要重读文档才能工作
弱点F：没有增量机制 → 6个月后agent激活时上下文成本爆炸
```

---

## 二、四项任务详解（逐条执行，不得省略）

---

### 任务1：执行链路优化——文档驱动 → 可复用代码

**目标：** 将 AUDIT-CONTRACT.md 里的规则翻译成可执行的 JS 函数，让 agent 不读文档也能工作

#### 1.1 创建 scripts/audit-core/ 目录结构

```
scripts/audit-core/
  index.mjs              ← 主入口，导出所有核心函数
  classifier.mjs          ← 内容分类（fact/speculation/hypothesis）
  evidence-evaluator.mjs ← 证据评估（source_refs / audit_refs 检查）
  router.mjs             ← routing_decision 决策引擎
  provenance.mjs         ← provenance 声明生成器
  bundle-exporter.mjs    ← audit bundle 导出
  constants.mjs          ← 规则常量（AUDIT-CONTRACT 的代码表达）
  utils.mjs              ← 通用工具函数
```

#### 1.2 scripts/audit-core/constants.mjs（必须实现）

这个文件是 AUDIT-CONTRACT.md 的代码版本。必须将所有规则精确翻译：

```javascript
// AUDIT-CONTRACT 规则 → 代码常量
// 必须与 docs/AUDIT-CONTRACT.md 完全对应，规则变化时同步更新

export const PRIORITY = {
  P0: 'P0', // 不让坏记忆进入长期记忆
  P1: 'P1', // 不让无来源的事实promote
  P2: 'P2', // 不让未评级的碎片promote
  P3: 'P3', // 归档内容不转提醒
  P4: 'P4'  // 不直接写运行时DB
};

export const ROUTING_DECISION = {
  DISCARD: 'discard',
  ARCHIVE: 'archive',
  REVIEW: 'review',
  PROMOTE: 'promote'
};

export const CONTENT_TYPE = {
  FACT: 'fact',           // 有来源、可验证
  SPECULATION: 'speculation', // 无来源、不可验证
  HYPOTHESIS: 'hypothesis'    // 有结构但未经证实
};

// NEVER_PROMOTE 规则（AUDIT-CONTRACT 核心）
export const NEVER_PROMOTE_RULES = [
  {
    id: 'NP-001',
    priority: PRIORITY.P0,
    condition: (content) => !hasSourceRefs(content),
    decision: ROUTING_DECISION.DISCARD,
    reason: 'Missing source_refs — cannot promote unsourced facts'
  },
  {
    id: 'NP-002',
    priority: PRIORITY.P0,
    condition: (content) => isAIGeneratedWithoutAudit(content),
    decision: ROUTING_DECISION.DISCARD,
    reason: 'AI-generated content without audit_ref — self-audit violation'
  },
  {
    id: 'NP-003',
    priority: PRIORITY.P1,
    condition: (content) => hasSourceRefsButNoVerification(content),
    decision: ROUTING_DECISION.REVIEW,
    reason: 'Has source_refs but no verification evidence'
  },
  {
    id: 'NP-004',
    priority: PRIORITY.P2,
    condition: (content) => !hasMemoryLevel(content),
    decision: ROUTING_DECISION.REVIEW,
    reason: 'Memory level not assigned — quality unknown'
  }
  // 更多规则根据 AUDIT-CONTRACT 添加
];

// routing_decision 优先级（数字越小优先级越高）
export const DECISION_PRIORITY = {
  [ROUTING_DECISION.DISCARD]: 1,  // discard 最优先
  [ROUTING_DECISION.REVIEW]:  2,
  [ROUTING_DECISION.ARCHIVE]: 3,
  [ROUTING_DECISION.PROMOTE]: 4   // promote 最严格
};
```

**验收标准：**
- `constants.mjs` 中的每条 NEVER_PROMOTE_RULES 必须对应 AUDIT-CONTRACT.md 中的一条规则
- 如果 AUDIT-CONTRACT.md 增加了规则，`constants.mjs` 必须同步更新
- 每个规则必须有唯一 id（格式：`NP-XXX`）

#### 1.3 scripts/audit-core/classifier.mjs（必须实现）

```javascript
/**
 * 内容分类器
 * 将输入内容分类为 fact / speculation / hypothesis
 * 
 * 分类依据：
 * - fact: 有来源、可独立验证、描述的是已发生事件
 * - speculation: 无来源、基于概率推断、描述的是可能性
 * - hypothesis: 有结构但未证实、有可测试的结论
 */

import { CONTENT_TYPE } from './constants.mjs';

/**
 * @param {string} content - 原始内容文本
 * @param {object} metadata - 可选的元数据（source_refs, author, date等）
 * @returns {{ type: string, confidence: number, indicators: string[] }}
 */
export function classifyContent(content, metadata = {}) {
  const indicators = [];
  
  // 指示 fact 的信号
  if (hasDateReference(content)) indicators.push('has_date_reference');
  if (hasNamedEntity(content)) indicators.push('has_named_entity');
  if (metadata.source_refs?.length > 0) indicators.push('has_source_refs');
  
  // 指示 speculation 的信号
  if (hasModalVerbs(content)) indicators.push('has_modal_verbs');
  if (hasProbabilityTerms(content)) indicators.push('has_probability_terms');
  if (!metadata.source_refs) indicators.push('no_source_refs');
  
  // 指示 hypothesis 的信号
  if (hasTestableClaim(content)) indicators.push('has_testable_claim');
  if (hasConditionalStructure(content)) indicators.push('has_conditional_structure');
  
  // 计算置信度
  const factScore = countIndicators(indicators, ['has_date_reference', 'has_named_entity', 'has_source_refs']);
  const specScore = countIndicators(indicators, ['has_modal_verbs', 'has_probability_terms', 'no_source_refs']);
  const hypScore = countIndicators(indicators, ['has_testable_claim', 'has_conditional_structure']);
  
  const scores = { fact: factScore, speculation: specScore, hypothesis: hypScore };
  const type = Object.entries(scores).reduce((a, b) => scores[a] >= scores[b[0]] ? a : b[0]);
  const confidence = Math.max(...Object.values(scores)) / (Object.values(scores).reduce((a, b) => a + b, 0) || 1);
  
  return { type, confidence, indicators };
}

function hasDateReference(content) {
  return /\d{4}[-/]\d{2}[-/]\d{2}|昨天|今天|上周|下个月/.test(content);
}

function hasNamedEntity(content) {
  return /[A-Z][a-z]+ [A-Z][a-z]+|\d+年|\d+月/.test(content);
}

function hasModalVerbs(content) {
  return /\b(可能|也许|大概|将会|would|may|might|could|probably|likely)\b/.test(content);
}

function hasProbabilityTerms(content) {
  return /\b(\d+%|概率|可能性|机率|likely|probably|possibly)\b/.test(content);
}

function hasTestableClaim(content) {
  return /如果.那么|when.*then|hypothesis/.test(content.toLowerCase());
}

function hasConditionalStructure(content) {
  return /\b(如果|假如|要是|if|unless|provided that)\b/.test(content);
}

function countIndicators(indicators, targetSet) {
  return indicators.filter(i => targetSet.includes(i)).length;
}
```

**验收标准：**
- 至少包含 fact / speculation / hypothesis 三类分类
- 必须输出 confidence 分数（0-1）
- 必须输出 indicators 列表（用于调试和审计）
- 分类逻辑必须可解释（不能是黑箱）

#### 1.4 scripts/audit-core/evidence-evaluator.mjs（必须实现）

```javascript
/**
 * 证据评估器
 * 检查 source_refs 和 audit_refs 是否存在且有效
 */

import { NEVER_PROMOTE_RULES } from './constants.mjs';

/**
 * @param {object} content - 包含 metadata 的内容对象
 * @returns {{ passed: boolean, violations: object[], score: number }}
 */
export function evaluateEvidence(content) {
  const violations = [];
  let score = 1.0;
  
  for (const rule of NEVER_PROMOTE_RULES) {
    if (rule.condition(content)) {
      violations.push({
        rule_id: rule.id,
        priority: rule.priority,
        decision: rule.decision,
        reason: rule.reason
      });
      // 根据优先级扣分
      score -= rule.priority === PRIORITY.P0 ? 0.5 : 
              rule.priority === PRIORITY.P1 ? 0.3 : 0.1;
    }
  }
  
  return {
    passed: violations.length === 0,
    violations,
    score: Math.max(0, score)
  };
}

/**
 * 检查 source_refs 是否存在
 */
export function hasSourceRefs(content) {
  return content.source_refs && content.source_refs.length > 0;
}

/**
 * 检查 audit_refs 是否存在
 */
export function hasAuditRefs(content) {
  return content.audit_refs && content.audit_refs.length > 0;
}
```

#### 1.5 scripts/audit-core/router.mjs（必须实现）

```javascript
/**
 * 路由决策引擎
 * 结合分类结果 + 证据评估 → 最终 routing_decision
 */

import { ROUTING_DECISION, DECISION_PRIORITY } from './constants.mjs';
import { classifyContent } from './classifier.mjs';
import { evaluateEvidence } from './evidence-evaluator.mjs';

/**
 * @param {string} content - 原始内容
 * @param {object} metadata - 元数据
 * @returns {{ decision: string, reason: string, evidence: object, classification: object }}
 */
export function routeDecision(content, metadata = {}) {
  // Step 1: 内容分类
  const classification = classifyContent(content, metadata);
  
  // Step 2: 证据评估
  const evidence = evaluateEvidence(metadata);
  
  // Step 3: 决策规则
  let decision = ROUTING_DECISION.PROMOTE;
  let reason = 'All checks passed';
  
  // NEVER_PROMOTE 规则优先
  if (!evidence.passed) {
    const topViolation = evidence.violations.sort(
      (a, b) => DECISION_PRIORITY[a.decision] - DECISION_PRIORITY[b.decision]
    )[0];
    decision = topViolation.decision;
    reason = topViolation.reason;
  }
  // 分类结果影响
  else if (classification.type === 'speculation') {
    decision = ROUTING_DECISION.DISCARD;
    reason = `Content classified as speculation (confidence: ${classification.confidence.toFixed(2)})`;
  }
  else if (classification.type === 'hypothesis' && classification.confidence < 0.7) {
    decision = ROUTING_DECISION.REVIEW;
    reason = 'Hypothesis with low confidence requires human review';
  }
  
  return {
    decision,
    reason,
    evidence,
    classification,
    routing_rules_applied: evidence.violations.map(v => v.rule_id)
  };
}
```

#### 1.6 scripts/audit-core/provenance.mjs（必须实现）

```javascript
/**
 * Provenance 声明生成器
 * 为 AI 协作产出生成标准 provenance YAML 头
 */

export const PROVENANCE_TYPES = {
  AI_GENERATED: '[AI_GENERATED]',
  HUMAN_ONLY: '[HUMAN_ONLY]',
  AI_ASSISTED: '[AI_ASSISTED]'
};

/**
 * @param {string} type - PROVENANCE_TYPES 之一
 * @param {object} meta - { authors, reviewer, audit_ref }
 * @returns {string} - YAML 格式 provenance 块
 */
export function generateProvenance(type, meta = {}) {
  const lines = ['```yaml'];
  lines.push(`provenance:`);
  lines.push(`  type: ${type}`);
  if (meta.authors) lines.push(`  authors: ${meta.authors}`);
  if (meta.reviewer) lines.push(`  human_reviewed: true`);
  if (meta.reviewer) lines.push(`  reviewer: ${meta.reviewer}`);
  if (meta.audit_ref) lines.push(`  audit_ref: ${meta.audit_ref}`);
  lines.push(`  generated_at: ${new Date().toISOString()}`);
  lines.push('```');
  return lines.join('\n');
}

/**
 * 从现有文件中解析 provenance 信息
 * @param {string} filePath - 文件路径
 * @returns {object|null}
 */
export function parseProvenance(filePath) {
  // 实现：从文件内容中提取 provenance YAML 块
  // 如果没有 provenance 声明，返回 null（表示不合规）
}
```

#### 1.7 scripts/audit-core/index.mjs（主入口）

```javascript
/**
 * audit-core 主入口
 * 导出所有核心函数，供外部脚本和 MCP 调用
 */

export { classifyContent } from './classifier.mjs';
export { evaluateEvidence, hasSourceRefs, hasAuditRefs } from './evidence-evaluator.mjs';
export { routeDecision } from './router.mjs';
export { generateProvenance, parseProvenance, PROVENANCE_TYPES } from './provenance.mjs';
export { ROUTING_DECISION, CONTENT_TYPE, PRIORITY } from './constants.mjs';

// 便捷的单行调用
export async function auditFile(filePath) {
  const { readFile } = await import('node:fs/promises');
  const content = await readFile(filePath, 'utf-8');
  const metadata = parseMetadataFromFile(content); // 从文件提取 metadata
  return routeDecision(content, metadata);
}
```

#### 1.8 MCP Server 包装（任务1的最高优先级输出）

在 `scripts/audit-core/` 完成后，创建 MCP Server 包装：

```
scripts/
  audit-mcp-server.mjs    ← MCP 兼容的服务包装
```

```javascript
/**
 * audit-mcp-server.mjs
 * 将 audit-core 导出为 MCP Server tool
 * Codex 5.5 可以直接调用这些工具
 */

import { auditFile, routeDecision, classifyContent, generateProvenance } from './audit-core/index.mjs';

const tools = [
  {
    name: 'mercury_audit_file',
    description: '审计单个文件，返回 routing_decision',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: '文件路径（绝对路径）' }
      },
      required: ['filePath']
    },
    handler: async ({ filePath }) => {
      const result = await auditFile(filePath);
      return JSON.stringify(result, null, 2);
    }
  },
  {
    name: 'mercury_classify',
    description: '对文本内容进行分类（fact/speculation/hypothesis）',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        source_refs: { type: 'array', items: { type: 'string' } }
      },
      required: ['content']
    },
    handler: async ({ content, source_refs = [] }) => {
      const result = classifyContent(content, { source_refs });
      return JSON.stringify(result, null, 2);
    }
  },
  {
    name: 'mercury_route',
    description: '对内容进行完整路由决策',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        source_refs: { type: 'array', items: { type: 'string' } },
        audit_refs: { type: 'array', items: { type: 'string' } },
        memory_level: { type: 'string', enum: ['M1', 'M2', 'M3', 'M4', 'M5'] }
      },
      required: ['content']
    },
    handler: async ({ content, ...metadata }) => {
      const result = routeDecision(content, metadata);
      return JSON.stringify(result, null, 2);
    }
  },
  {
    name: 'mercury_provenance',
    description: '生成 provenance 声明',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['[AI_GENERATED]', '[HUMAN_ONLY]', '[AI_ASSISTED]'] },
        authors: { type: 'string' },
        reviewer: { type: 'string' },
        audit_ref: { type: 'string' }
      },
      required: ['type']
    },
    handler: async (params) => {
      return generateProvenance(params.type, params);
    }
  }
];

// 启动 MCP Server（如果直接运行）
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.MERCURY_MCP_PORT || 4789);
  // 启动逻辑...
}

export { tools };
```

#### 1.9 npm scripts 集成

在 `package.json` 中新增：

```json
{
  "scripts": {
    "audit:check": "node scripts/audit-core/index.mjs check",
    "audit:classify": "node scripts/audit-core/index.mjs classify",
    "audit:route": "node scripts/audit-core/index.mjs route",
    "audit:export": "node scripts/audit-core/index.mjs export",
    "audit:mcp": "node scripts/audit-mcp-server.mjs",
    "audit:test": "node --test scripts/audit-core/tests/"
  }
}
```

#### 1.10 测试要求（任务1必须包含）

```
scripts/audit-core/tests/
  classifier.test.mjs      ← 测试 classifyContent 函数
  evidence-evaluator.test.mjs  ← 测试 evaluateEvidence 函数
  router.test.mjs          ← 测试 routeDecision 函数
  provenance.test.mjs      ← 测试 provenance 生成和解析
  integration.test.mjs      ← 测试完整链路（classifier → evaluator → router）
```

每个测试文件必须包含：
- 正常路径测试（happy path）
- 边界条件测试（empty content, missing metadata）
- 已知反例测试（验证 NEVER_PROMOTE 规则被正确触发）

**覆盖率要求：**
- 所有核心函数必须 >= 90% 行覆盖率
- 所有 NEVER_PROMOTE 规则必须被测试覆盖

---

### 任务2：Context 切换效率——增量更新 + 差异加载 + 状态缓存

#### 2.1 理解当前问题

```
问题：每次 npm run validate 和 npm run index 都是全量操作
      随着 artifacts 数量增长，每次操作越来越慢
      agent 每次更新都需要等待这些全量操作完成

Context 问题：agent 每次会话都需要重读完整文档
             6个月后激活时，上下文可能已经膨胀到不可接受

复利效应：Context 成本随时间增长，不处理的话6个月后一次激活可能消耗上万token
```

#### 2.2 增量 validate

改造 `scripts/validate_artifacts.mjs`：

```javascript
// 新增命令：npm run validate:incr
// 新增标志：--incr 或 --incremental

// data/validate-last-run.json 结构：
// {
//   "lastRun": "2026-05-05T10:00:00Z",
//   "fileCount": 228,
//   "totalSize": 4194304,
//   "files": {
//     "00_raw/xxx.md": { "hash": "abc123", "indexed": "2026-05-05T09:00:00Z" },
//     ...
//   },
//   "violations": [],
//   "elapsedMs": 2341
// }
```

**实现逻辑：**
```
1. 读取 data/validate-last-run.json（如果不存在，执行全量validate）
2. 遍历所有 artifacts 目录，对比文件 hash
3. 只对 changed / new / deleted 文件执行验证
4. 输出：{ added: N, modified: N, deleted: N, unchanged: N, elapsedMs: X }
5. 更新 data/validate-last-run.json
```

**边界处理：**
- 如果 `data/validate-last-run.json` 损坏或不存在，自动回退到全量 validate
- 如果 `data/` 目录不存在，自动创建
- `--force` 标志强制全量 validate（用于回归测试）

#### 2.3 增量 index

改造 `scripts/rebuild_index.mjs`：

```javascript
// 新增命令：npm run index:incr
// 新增标志：--incr 或 --incremental

// data/index-state.json 结构：
// {
//   "lastIndex": "2026-05-05T10:00:00Z",
//   "totalFiles": 228,
//   "entries": {
//     "00_raw/xxx.md": { "hash": "abc123", "indexed": "2026-05-05T09:00:00Z" },
//     ...
//   },
//   "elapsedMs": 5672
// }
```

**实现逻辑：**
```
1. 读取 data/index-state.json（如果不存在，执行全量 index）
2. 对比文件 hash，找出 changed / new / deleted 文件
3. 只索引 changed / new 文件（删除的文件从索引中移除）
4. 输出：{ indexed: N, removed: N, skipped: N, elapsedMs: X }
5. 更新 11_indexes/sample-index.json（增量合并，不是全量重写）
6. 更新 data/index-state.json
```

**性能目标：**
- 增量 index（95% 文件未变化）：< 2 秒
- 全量 index（所有文件）：作为基准，允许 10-30 秒

#### 2.4 Agent 快速锚点文件（最重要的前瞻性设计）

创建 `docs/ITERATION-GUIDE-LATEST.md`（自动生成，手动维护）：

```markdown
# Mercury Lab · 当前状态（自动锚点）

> 这是低频智能体激活时的第一个接触点。
> 不要读其他文档，先读这个文件。

## 当前版本：1.0.0

## 上次做了什么（2026-05-05）
- 任务1：audit-core 模块上线
- 任务2：增量 validate/index 机制上线
- 任务3：跨平台安装脚本上线
- 任务4：Dashboard Mac 风格化完成

## 下次做什么（下次迭代）
1. Codex 5.5 MCP 适配（audit-mcp-server 已经是 MCP 格式）
2. 自动生成 ITERATION-GUIDE-LATEST.md（release 时触发）
3. 暗黑模式 UI（可选）

## 关键路径速查
- 运行验收：npm run validate && npm run index && npm run doctor
- 新增 artifact：放入 00_raw/，然后 npm run index:incr
- 审计文件：npm run audit:check <file>
- 路由决策：npm run audit:route <file>
- Dashboard：http://127.0.0.1:4788

## 不要做的事
- 不要修改 dashboard_server.mjs（已稳定）
- 不要引入前端框架
- 不要定义量化成功指标（AUDIT-METRICS-DECLINED.md）
- 不要做 breaking change（1.0.x 是冻结期）

## 已知技术债
- 06_action_plans/ 有过时文件需要清理
- 00_inbox/_manifest.yaml manifest 字段不全
```

创建 `docs/AGENT-CONTEXT-BUDGET.md`：

```markdown
# Agent Context Budget Guide

> 如何在有限的上下文内高效工作

## 读取优先级

### 第一次读（必须）
1. `docs/ITERATION-GUIDE-LATEST.md` — 当前状态（2KB，<1分钟）
2. `docs/MINIMAL-WORKFLOW.md` — 工作流（5KB，<5分钟）

### 第二次读（按需）
3. `docs/AUDIT-CONTRACT.md` — 核心规则（10KB，只读 Priority 表）
4. `package.json` scripts — 可用命令（<1分钟）

### 第三次读（需要实现时）
5. `scripts/audit-core/` — 代码逻辑（代替读文档）
6. `docs/METHODOLOGY-INTEGRITY.md` — AI协作悖论（只有遇到相关问题时读）

### 不要读（除非特别需要）
- `CHANGELOG.md` 完整历史 — 太长，按版本号查即可
- `examples/` 全部文件 — 按需单个读
- `ITERATION-GUIDE-0.9.md` — 这是历史文件，最新在 ITERATION-GUIDE-LATEST.md
```

#### 2.5 data/ 目录结构（运行时状态）

```
data/
  validate-last-run.json     # 上次 validate 结果
  index-state.json           # 上次 index 状态
  release-last.json          # 上次 release 信息
  lifecycle-log.jsonl        # 运行时事件日志
  cache/
    file-hashes.json         # 文件 hash 缓存
```

#### 2.6 6个月冷静期激活检查清单

创建 `docs/CHECKLIST-REACTIVATION.md`：

```markdown
# 冷静期后激活检查清单

> 预计激活时间：2026-10 至 2026-12（Codex 5.5 发布后）
> 执行顺序：按编号顺序执行，每步完成后打勾

## 激活前（清理上下文）

- [ ] 1. 生成新的 ITERATION-GUIDE-LATEST.md（从 ITERATION-HANDOFF-1.0.0.md 提取）
- [ ] 2. 运行 npm run validate:incr（确认无新增 violations）
- [ ] 3. 检查 data/ 目录的缓存是否过期（>90天）
- [ ] 4. 确认 Codex 5.5 是否已发布

## 激活时（首次会话）

- [ ] 5. 运行 npm run doctor（全面诊断）
- [ ] 6. 读 docs/ITERATION-GUIDE-LATEST.md
- [ ] 7. 读 docs/AGENT-CONTEXT-BUDGET.md
- [ ] 8. 根据版本更迭规划（ITERATION-HANDOFF-1.0.0.md 第四节）确定本次迭代范围

## 激活后（首次更新）

- [ ] 9. 更新 ITERATION-GUIDE-LATEST.md（记录本次做了什么）
- [ ] 10. 运行 npm run validate:incr（不要全量，只做增量）
- [ ] 11. commit + push
- [ ] 12. 确认 GitHub Actions（如果有）是否正常
```

#### 2.7 测试要求（任务2必须包含）

```
scripts/
  test-incr-validate.mjs     ← 测试增量 validate 逻辑
  test-incr-index.mjs        ← 测试增量 index 逻辑
  test-file-hash.mjs         ← 测试 hash 计算一致性
```

**测试覆盖：**
- 文件未变化时：跳过处理（skipped += 1）
- 文件新增时：正确索引（indexed += 1）
- 文件修改时：正确更新（modified += 1）
- 文件删除时：正确从索引移除（removed += 1）
- 缓存损坏时：自动回退到全量操作

---

### 任务3：跨平台安装程序

#### 3.1 目标

```
Mac 用户：        ./install/install-mac.sh
Windows 用户：    .\install\install-windows.ps1
Linux 用户：     ./install/install-linux.sh
Android 用户：   ./install/install-termux.sh（Termux环境）
```

#### 3.2 install/install.sh（统一入口，Linux/macOS）

```bash
#!/usr/bin/env bash
set -e

# ==============================================
# Mercury Lab 安装脚本（Linux / macOS）
# ==============================================

echo "=== Mercury Lab 安装程序 ==="
echo ""

# 检测操作系统
detect_os() {
  case "$(uname -s)" in
    Darwin*)    echo "macOS detected" ;;
    Linux*)     
      if [ -f "/system/bin/sh" ] && grep -q "android" /proc/version 2>/dev/null; then
        echo "Android (Termux) detected — use install-termux.sh instead"
        exit 1
      fi
      echo "Linux detected" ;;
    *)          echo "Unsupported OS: $(uname -s)" && exit 1 ;;
  esac
}

# 检查 Node.js
check_node() {
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo ""
    echo "安装 Node.js 20+："
    echo "  macOS: brew install node"
    echo "  Linux: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -"
    exit 1
  fi
  
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 版本过低（需要 >= 20，当前: $(node -v)）"
    exit 1
  fi
  
  echo "✅ Node.js $(node -v)"
}

# 检查 Git
check_git() {
  if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装"
    echo "  macOS: brew install git"
    echo "  Linux: apt install git"
    exit 1
  fi
  echo "✅ Git $(git -v | head -1)"
}

# 主流程
main() {
  detect_os
  check_node
  check_git
  
  echo ""
  read -p "是否安装 Mercury Lab 到当前目录？ [Y/n] " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]] && [ ! -z "$REPLY" ]; then
    echo "取消安装"
    exit 0
  fi
  
  # npm install
  echo "安装依赖..."
  npm install
  
  # 安装 git hooks
  echo "安装 git hooks..."
  npm run hooks:install
  
  echo ""
  echo "=== 安装完成 ==="
  echo ""
  echo "运行验收测试："
  echo "  npm run doctor"
  echo "  npm run validate"
  echo ""
  echo "启动 Dashboard："
  echo "  npm run dashboard"
  echo ""
  echo "Dashboard 地址：http://127.0.0.1:4788"
}

main "$@"
```

#### 3.3 install/install-windows.ps1（Windows 专用）

```powershell
# ==============================================
# Mercury Lab 安装程序（Windows PowerShell）
# ==============================================

Write-Host "=== Mercury Lab 安装程序 (Windows) ===" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "安装 Node.js 20+："
    Write-Host "  winget install OpenJS.NodeJS.LTS"
    Write-Host "  或从 https://nodejs.org 下载安装包"
    exit 1
}

$nodeVersion = (node -v) -replace 'v', ''
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 20) {
    Write-Host "❌ Node.js 版本过低（需要 >= 20，当前: $nodeVersion）" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green

# 检查 Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Git 未检测到（可选，但推荐安装）" -ForegroundColor Yellow
} else {
    $gitVersion = git --version
    Write-Host "✅ $gitVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "安装依赖..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "安装 git hooks..." -ForegroundColor Cyan
npm run hooks:install

Write-Host ""
Write-Host "=== 安装完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "运行验收测试："
Write-Host "  npm run doctor"
Write-Host "  npm run validate"
Write-Host ""
Write-Host "启动 Dashboard："
Write-Host "  npm run dashboard"
Write-Host ""
Write-Host "Dashboard 地址：http://127.0.0.1:4788" -ForegroundColor Cyan
```

#### 3.4 install/install-termux.sh（Android Termux 专用）

```bash
#!/usr/bin/env bash
# ==============================================
# Mercury Lab 安装程序（Android Termux）
# ==============================================

pkg update && pkg upgrade -y

pkg install nodejs git

npm install

npm run hooks:install

echo ""
echo "=== Termux 安装完成 ==="
echo "注意：Dashboard 在 Termux 中启动后，访问地址："
echo "  http://localhost:4788"
echo "  （在手机浏览器中打开，或端口转发到电脑）"
echo ""
echo "端口转发命令："
echo "  termux-usb -l  # 查看USB设备"
echo "  # 或使用 WiFi 方式：确保手机和电脑在同一网络"
```

#### 3.5 install/README.md（安装指南主文档）

必须包含：
```
## macOS 安装
前置条件：Node.js 20+（推荐用 nvm）
步骤：
  1. git clone https://github.com/peeptime/mercury-method-lab.git
  2. cd mercury-method-lab
  3. chmod +x install/install.sh && ./install/install.sh

## Windows 安装
前置条件：Node.js 20+（winget 或官网下载）
步骤：
  1. git clone https://github.com/peeptime/mercury-method-lab.git
     （或下载 zip 包并解压）
  2. cd mercury-method-lab
  3. powershell -ExecutionPolicy Bypass -File install\install-windows.ps1

## Linux 安装
前置条件：Node.js 20+（apt/yum/nvm）
步骤：
  1. git clone https://github.com/peeptime/mercury-method-lab.git
  2. cd mercury-method-lab
  3. chmod +x install/install.sh && ./install/install.sh

## Android Termux 安装
前置条件：Termux（F-Droid，不要用 Google Play 版本）
步骤：
  1. 安装 F-Droid，搜索 Termux 安装
  2. pkg update && pkg upgrade -y
  3. pkg install nodejs git
  4. git clone https://github.com/peeptime/mercury-method-lab.git
  5. cd mercury-method-lab
  6. chmod +x install/install-termux.sh && ./install/install-termux.sh

## 常见问题
Q: npm install 失败
A: 尝试 npm install --registry https://registry.npmmirror.com

Q: dashboard 打不开
A: 检查防火墙，端口 4788 是否开放

Q: 端口被占用
A: 设置环境变量 MERCURY_DASHBOARD_PORT=4789
```

#### 3.6 GitHub Actions CI（跨平台测试）

创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [20, 22]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: npm install
        run: npm install
      
      - name: Run doctor
        run: npm run doctor
      
      - name: Run validate
        run: npm run validate
      
      - name: Run index
        run: npm run index
      
      - name: Test audit-core
        run: npm run audit:test
```

#### 3.7 验收标准

```
- [ ] install/install.sh 在 macOS 上可执行（chmod +x）
- [ ] install/install-windows.ps1 在 Windows PowerShell 上可执行
- [ ] install/install-termux.sh 在 Termux 上可执行
- [ ] install/README.md 包含全部 4 个平台的安装说明
- [ ] .github/workflows/ci.yml 在 push 时触发并在 3 个平台上通过
- [ ] npm run validate 在全新 clone 后通过（无预先存在的缓存）
```

---

### 任务4：Web UI/UX 更新——Mac 风格

#### 4.1 理解当前状态

```
当前 dashboard 技术栈：
  - dashboard_server.mjs：Node.js 原生 http server（无框架），已稳定，不修改
  - dashboard/index.html：纯 HTML，无框架
  - dashboard/styles.css：纯 CSS，无预处理器
  - dashboard/app.js：原生 JS，无构建工具
  - 端口：4788

修改原则：
  - 不改 dashboard_server.mjs（已稳定）
  - 不引入 React/Vue/Angular（复杂度太高）
  - 不改 app.js 的业务逻辑（只改 DOM class 名称）
  - 只改 styles.css + 适度改 index.html
```

#### 4.2 CSS 变量定义（styles.css 开头）

```css
/* ==============================================
   Mercury Lab Dashboard · CSS Variables
   Mac 风格设计系统
   ============================================== */

:root {
  /* 颜色系统 - macOS 风格 */
  --color-primary: #007AFF;       /* macOS Blue */
  --color-primary-hover: #0056CC;
  --color-success: #34C759;       /* macOS Green */
  --color-warning: #FF9500;        /* macOS Orange */
  --color-danger: #FF3B30;        /* macOS Red */
  --color-info: #5AC8FA;          /* macOS Light Blue */
  
  /* 背景色 - macOS 浅灰 */
  --bg-base: #FFFFFF;
  --bg-surface: #F5F5F7;
  --bg-elevated: #FFFFFF;
  --bg-input: #FFFFFF;
  
  /* 文字色 */
  --text-primary: #1D1D1F;
  --text-secondary: #86868B;
  --text-tertiary: #AEAEB2;
  --text-inverse: #FFFFFF;
  
  /* 边框 */
  --border-default: #D2D2D7;
  --border-hover: #B8B8BF;
  --border-focus: #007AFF;
  
  /* 阴影 - macOS 风格 */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.15);
  
  /* 圆角 - macOS 风格 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* 字体 - 优先使用系统字体 */
  --font-system: -apple-system, BlinkMacSystemFont, 
                 'SF Pro Display', 'Segoe UI', Roboto, 
                 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  
  /* 字号 */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-lg: 17px;
  --text-xl: 20px;
  --text-2xl: 28px;
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* 过渡动画 */
  --transition-fast: 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
  --transition-base: 250ms cubic-bezier(0.25, 0.1, 0.25, 1);
  --transition-slow: 400ms cubic-bezier(0.25, 0.1, 0.25, 1);
  
  /* 动效曲线 - 参考 jakubantalik/transitions-dev */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
}

/* 暗色模式（预留） */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base: #1D1D1F;
    --bg-surface: #2C2C2E;
    --bg-elevated: #3A3A3C;
    --text-primary: #F5F5F7;
    --text-secondary: #98989D;
    --border-default: #48484A;
  }
}
```

#### 4.3 基础重置（styles.css）

```css
/* 基础重置 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-system);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background: var(--bg-surface);
  min-height: 100vh;
}

/* 滚动条 - macOS 风格 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
```

#### 4.4 组件样式（任务4的核心）

需要重写样式的组件（从现有 HTML 结构提取）：

```
dashboard/index.html 中的主要元素（推测）：
  - .header / header
  - .sidebar / nav
  - .content / main
  - .card / .artifact-card
  - .status-badge
  - .btn / button
  - .input / input[type=text]
  - .table / table
```

#### 4.5 动效实现

```css
/* 页面进入动效 */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
  animation: pageEnter var(--transition-slow) var(--ease-out-expo) forwards;
}

@keyframes pageEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片悬停 */
.artifact-card {
  transition: transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

.artifact-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 按钮状态 */
.btn {
  transition: background-color var(--transition-fast),
              transform var(--transition-fast);
}

.btn:active {
  transform: scale(0.97);
}

/* 输入框焦点 */
.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
  outline: none;
}

/* 加载骨架屏 */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--border-default) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 路由决策状态颜色 */
.status-discard { color: var(--color-danger); }
.status-archive { color: var(--color-warning); }
.status-review  { color: var(--color-info); }
.status-promote { color: var(--color-success); }
```

#### 4.6 参考资源安装

```bash
# 安装 transitions-dev skill 获取动效参考
npx skills add jakubantalik/transitions-dev

# 阅读其 SKILL.md 和示例代码
cat ~/.openclaw/skills/transitions-dev/SKILL.md
```

#### 4.7 视觉参考点（hyperagent.com/learning 风格）

```
Mac 风格特征（需要体现在 dashboard）：
  1. 大量留白（padding: 24px+），不是信息堆砌
  2. 清晰的卡片边界（shadow-md + border-radius-md）
  3. 状态用颜色区分（badge 形式）
  4. 浅灰背景 + 白色卡片（macOS 窗口风格）
  5. 导航简洁，左侧 sidebar 或顶部 tab
  6. 字体优先 SF Pro（macOS系统字体）
```

#### 4.8 验收标准

```
- [ ] styles.css 开头定义了完整的 CSS 变量系统（颜色/间距/字体/动效）
- [ ] 所有颜色使用 CSS 变量（无硬编码 hex）
- [ ] 主要组件（card/button/input）有 hover/active/focus 状态
- [ ] 包含页面进入动画（opacity + transform）
- [ ] 包含骨架屏加载动画
- [ ] 滚动条样式 macOS 化
- [ ] 在 Safari/Chrome/Firefox 上视觉一致
- [ ] 移动端（iPad）可正常访问（响应式）
```

---

## 三、版本 1.0.0 冻结检查清单

> 完成四项任务后，必须逐项确认

### 版本号更新
- [ ] `package.json`：`version: "1.0.0"`，`codename: "1.0.0 Feature Freeze"`
- [ ] `config/project-meta.json`：`version: "1.0.0"`
- [ ] `README.md`、`README.en.md`：版本号同步更新（搜索 0.9.0 全部替换为 1.0.0）
- [ ] `CHANGELOG.md`：新增 1.0.0 条目，内容：
  - 四项任务的完成状态
  - 本次迭代的时间
  - 下一个版本的候选功能列表
  - provenance 声明（`[AI_GENERATED]`）

### GitHub 仓库同步
- [ ] GitHub 仓库 Description 更新为 README One Sentence
- [ ] GitHub Topics：添加 `mercury-method-lab`、`ai-audit`、`agent-memory`
- [ ] LICENSE 确认（MIT）
- [ ] 创建 GitHub Release：v1.0.0

### 功能验收（必须全部通过）
```bash
npm install          # 无报错
npm run doctor       # 无严重警告（warnings 允许）
npm run validate     # 0 violations
npm run index        # 索引文件正确生成
npm run audit:test   # 所有测试通过（>=90%覆盖率）
npm run dashboard    # http://127.0.0.1:4788 可访问
```

### 文档验收
- [ ] `docs/MINIMAL-WORKFLOW.md`：路径与实际目录一致
- [ ] `docs/ITERATION-GUIDE-LATEST.md`：存在且准确
- [ ] `docs/AGENT-CONTEXT-BUDGET.md`：存在
- [ ] `docs/CHECKLIST-REACTIVATION.md`：存在（冷静期后激活用）
- [ ] `docs/INSTALL.md` 或 `install/README.md`：存在且覆盖 4 个平台
- [ ] `CHANGELOG.md`：包含完整版本历史（从 0.7.0 到 1.0.0）

### 交付物验收
- [ ] `scripts/audit-core/`：目录存在，包含 7 个 .mjs 文件
- [ ] `scripts/audit-mcp-server.mjs`：存在且为 MCP 格式
- [ ] `scripts/test-incr-validate.mjs`：增量 validate 测试存在
- [ ] `scripts/test-incr-index.mjs`：增量 index 测试存在
- [ ] `install/`：目录存在，包含 install.sh + install-windows.ps1 + install-termux.sh + README.md
- [ ] `.github/workflows/ci.yml`：存在且在 3 个平台上测试
- [ ] `dashboard/styles.css`：CSS 变量系统存在，动效实现存在

### 清理检查
- [ ] `data/` 目录有 .gitignore（不提交缓存文件）
- [ ] 无遗留的 TODO/FIXME 注释（除非标注了对应的 issue）
- [ ] 所有测试文件在 `scripts/audit-core/tests/` 目录下

---

## 四、版本更迭前瞻（供下次激活参考）

> 以下是 6-12 个月后激活时的执行依据

### 预计时间线

```
2026-05-05          → 1.0.0 冻结（本次任务完成）
2026-05 ~ 2026-10   → 冷静期（不主动迭代）
2026-10 ~ 2026-12   → Codex 5.5 发布窗口期
2026-10 ~ 2026-12   → 1.1.0 迭代（Codex 5.5 适配）
2027-01 ~ 2027-03   → 1.2.0 迭代（插件系统）
```

### 1.1.0 候选功能（按优先级）

| 优先级 | 功能 | 描述 | 触发条件 |
|--------|------|------|----------|
| P0 | MCP Server 激活 | audit-mcp-server.mjs 上线，Codex 5.5 直接调用 | Codex 5.5 发布 |
| P0 | ITERATION-GUIDE-LATEST.md 自动生成 | release 时触发，不需要手动更新 | Codex 5.5 发布 |
| P1 | 暗黑模式 | CSS 变量已在 4.1 定义，只需启用 | 用户请求 |
| P2 | JSON Lines 导出格式 | 目标后端需要 | 外部请求 |
| P3 | 多语言 UI | 中文/英文界面切换 | 国际化需求 |

### 1.2.0 候选功能

| 优先级 | 功能 | 描述 |
|--------|------|------|
| P1 | 插件系统 | 自定义 routing 规则（从 constants.mjs 扩展） |
| P2 | Webhook 集成 | 审计完成时触发外部 webhook |
| P2 | 历史版本对比 | 对比任意两个版本的 index |

### 版本策略

```
1.0.0   ← 功能冻结，稳定性优先
1.0.1   ← 只修关键 bug（≤3个PR）
1.0.2   ← 只修关键 bug（≤3个PR）
1.1.0   ← Codex 5.5 适配 + MCP Server 上线
1.2.0   ← 插件系统 + 国际化
2.0.0   ← 重大架构变更（需要明确的社区需求驱动）
```

---

## 五、已知隐藏逻辑（必须显化到项目）

### 5.1 迭代的自举悖论

```
问题：
  Mercury Lab 用于审计其他 AI 系统，但自身的迭代也依赖 AI。
  项目的每一次迭代都在使用"自己审计标准不允许的东西"。

现状：
  - docs/METHODOLOGY-INTEGRITY.md 已记录 AI协作悖论
  - 所有产出的 provenance 声明是解决方案
  - 不需要额外处理，只需要保持 provenance 声明的执行

前瞻性含义（Codex 5.5）：
  - 更强的AI = 更难察觉的自审
  - 1.0.0 的 provenance 机制是防御性设计
  - 每次 release 前检查 provenance 声明覆盖率（npm run audit:test 应该检测）
```

### 5.2 必然攻击的需求

```
问题：
  任何可被 agent 读取的量化成功指标，都会成为 gaming 目标。

正确方向（已在 AUDIT-METRICS-DECLINED.md 记录）：
  - 不测量"成功达到某个百分比"
  - 测量"特定失败模式的缺失"
  - 失败模式1：没有 provenance 声明的 AI 产出进入了长期记忆
  - 失败模式2：同一个人既写了内容又审核了同一内容
  - 失败模式3：没有 source_refs 的内容被 promote

不要做的事：
  - 不要引入 promote率 < X% 这样的指标
  - 不要引入 discard率 > Y% 这样的指标
  - 不要引入"审计覆盖率"这样的指标
```

### 5.3 Context 成本的复利效应

```
问题：
  每次 agent 更新都会累积上下文成本。
  长期不更新 = 上下文越来越长 = 每次更新的 token 成本指数增长。

6个月冷静期的代价：
  - 激活时上下文可能膨胀到数千 token
  - 每次"读文档"操作的成本 > 正常运行成本

解决方案（已在任务2实现）：
  - 增量更新机制（validate:incr + index:incr）
  - ITERATION-GUIDE-LATEST.md 自动锚点
  - AGENT-CONTEXT-BUDGET.md 读取优先级

冷静期后激活时：
  - 第一件事：运行 npm run validate:incr（不是全量 validate）
  - 第二件事：读 ITERATION-GUIDE-LATEST.md（不是完整 CHANGELOG）
  - 不要全量读文档，先用 audit-core 工具（见 CHECKLIST-REACTIVATION.md）
```

### 5.4 版本号语义约定

```
major.minor.patch：
  - major（破坏性变更）：artifact结构 / 内存架构 / 上游兼容性
  - minor（新增兼容功能）：新 adapter / migration path / workflow
  - patch（修复）：docs / validation / scripts

1.0.x 阶段：
  - 只允许 patch 和 minor
  - major 变更需要 6 个月冷静期后的明确决策
  - 不要为了"方便"升级 minor（如：只是想加个小功能）
```

---

## 六、立即开始的步骤（按顺序执行）

> 低频智能体按编号顺序执行。遇到 [BLOCKER] 立即停止并报告。

```
步骤 1（5分钟）：确认环境
  cd Z:\AI 202604\trae01\v8-mercury-backend
  node --version        # 需要 >= 20
  npm --version
  git status
  npm install           # 确认依赖安装成功

步骤 2（30分钟）：阅读关键文件
  2.1 README.md（第1遍，通读）
  2.2 docs/MINIMAL-WORKFLOW.md（第1遍，理解工作流）
  2.3 docs/AUDIT-CONTRACT.md（第1遍，理解核心规则）
  2.4 package.json scripts（第1遍，理解可用命令）

步骤 3（20分钟）：运行验收测试
  npm run doctor        # 诊断系统状态
  npm run validate      # 确认无 violations
  npm run index         # 确认索引正确
  如果任何一步失败 → [BLOCKER] 报告具体错误信息

步骤 4（时间不限）：执行任务1（执行链路优化）
  4.1 创建 scripts/audit-core/ 目录
  4.2 按 1.2~1.6 顺序实现 6 个 .mjs 文件
  4.3 实现 scripts/audit-mcp-server.mjs（1.8）
  4.4 集成 npm scripts（1.9）
  4.5 编写测试文件（1.10）
  4.6 运行 npm run audit:test，确认 >=90% 覆盖率
  完成后 → [BLOCKER] 或进入步骤 5

步骤 5（时间不限）：执行任务2（Context效率）
  5.1 改造 scripts/validate_artifacts.mjs（增量支持）
  5.2 改造 scripts/rebuild_index.mjs（增量支持）
  5.3 创建/更新 docs/ITERATION-GUIDE-LATEST.md
  5.4 创建/更新 docs/AGENT-CONTEXT-BUDGET.md
  5.5 创建 docs/CHECKLIST-REACTIVATION.md
  完成后 → [BLOCKER] 或进入步骤 6

步骤 6（时间不限）：执行任务3（跨平台安装）
  6.1 创建 install/ 目录
  6.2 创建 install/install.sh（macOS/Linux）
  6.3 创建 install/install-windows.ps1
  6.4 创建 install/install-termux.sh
  6.5 创建 install/README.md
  6.6 创建 .github/workflows/ci.yml
  6.7 在本地测试各平台脚本（至少测试当前系统）
  完成后 → [BLOCKER] 或进入步骤 7

步骤 7（时间不限）：执行任务4（UI更新）
  7.1 阅读 jakubantalik/transitions-dev skill
  7.2 创建 dashboard/styles.css（CSS变量 + 组件样式 + 动效）
  7.3 适度更新 dashboard/index.html（class 名称）
  7.4 在浏览器测试 dashboard 效果
  完成后 → [BLOCKER] 或进入步骤 8

步骤 8（20分钟）：版本 1.0.0 freeze
  8.1 更新版本号：package.json + project-meta.json + README.md + README.en.md
  8.2 写 CHANGELOG.md 的 1.0.0 条目
  8.3 按照第三节检查清单逐项确认
  8.4 git commit -m "1.0.0: feature freeze"
  8.5 git tag v1.0.0
  8.6 git push origin main --tags
  8.7 创建 GitHub Release

步骤 9（10分钟）：收尾
  9.1 确认 ITERATION-GUIDE-LATEST.md 是最新状态
  9.2 确认 docs/CHECKLIST-REACTIVATION.md 存在
  9.3 最终 git push
```

---

## 七、[BLOCKER] 报告模板

如果某步骤遇到无法解决的问题，使用以下模板报告：

```markdown
## [BLOCKER] 在步骤 X.X 遇到问题

### 步骤编号
任务X（任务名称），第 X.X 小节

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
（具体说明需要什么：信息/决策/工具访问等）
```

---

## 八、避免的陷阱

```
❌ 不要修改 dashboard_server.mjs
  → 这个文件已经稳定，改动风险高，收益低

❌ 不要引入任何前端框架（React/Vue/Angular/Svelte）
  → 增加复杂度，与项目风格不符，与任务目标不符

❌ 不要定义任何新的量化成功指标
  → AUDIT-METRICS-DECLINED.md 说明了原因

❌ 不要把文档全部改写成代码
  → 文档是"为什么"，代码是"怎么做"，两者都保留

❌ 不要在 1.0.0 引入 breaking change
  → 1.0.0 是冻结版本，breaking change 必须等到 2.0.0

❌ 不要做过于复杂的安装程序
  → 脚本 + Markdown 文档即可，GUI 是加分项

❌ 不要在 CI 中跳过任何平台
  → Windows/macOS/Linux 三个都必须测

❌ 不要修改 00_raw/ 00_inbox/ 等数据目录的文件名格式
  → 这些是标准化格式，修改会破坏索引

❌ 不要忽略 npm run validate 的 violations
  → 任何 violation 都是 P0 问题，必须修复或记录

❌ 不要忘记写测试
  → 没有测试的代码变更是不完整的变更
```

---

## 九、性能基准

> 优化后的性能必须达到以下标准

| 操作 | 全量基准 | 增量目标 | 测试方式 |
|------|---------|---------|---------|
| `npm run validate` | 10-30 秒 | < 3 秒（95%文件未变化） | `npm run validate:incr` |
| `npm run index` | 10-30 秒 | < 2 秒（95%文件未变化） | `npm run index:incr` |
| `npm run doctor` | 5-10 秒 | < 3 秒 | 直接运行 |
| `npm run audit:check <file>` | — | < 500ms | `time npm run audit:check <file>` |
| Dashboard 首屏加载 | — | < 2 秒 | 浏览器 DevTools |

---

## 十、当你遇到问题时

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

问题：测试覆盖率不够 90%
→ 不要降低覆盖率要求，要增加测试用例

问题：某个脚本在 Windows 上失败
→ 检查路径分隔符（用 path.join 或 path.sep）
→ 检查换行符（CRLF vs LF）
→ 在 .github/workflows/ci.yml 的 windows-latest 上复现
```
