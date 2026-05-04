# Mercury V8 仓库结构参考

> Provenance: HUMAN_ONLY, author: project_owner, maintained by: mercury-v8-iter skill

## 目录结构（12层）

```
00_inbox/          预入库暂存区（延迟吸收）
00_raw/            已接纳的原始材料 ← 入口
01_segmented/      按段/按块拆分
02_cleaned/        事实与推断分离
03_uncertain/      矛盾/弱信号保留区
04_memory_candidates/  可复用知识提名 ← routing_decision 核心目录
05_decision_logs/  决策记录
06_action_plans/  行动计划
07_audit_reports/  反方审计 ← 审计轨迹
08_skills/         可复用推理算子（6个skill）
09_templates/       Artifact模板（7个）
10_exports/        稳定输出/交付件
11_indexes/        生成的JSON索引
```

## 最小可行集（4层）

```
00_raw/                    ← 原始材料入口
04_memory_candidates/      ← 记忆候选 + routing_decision
07_audit_reports/          ← 审计轨迹
09_templates/              ← 模板
```

## 核心 schema

```
schemas/
  artifact.json                    # artifact 基本结构
  memory-candidate.json           # 记忆候选
  memory-preaudit-bundle.json    # export bundle

schemas/examples/                  # 合规/违规示例
  valid-promote.yaml
  valid-discard.yaml
  invalid-no-source-refs.yaml
  invalid-no-audit-refs.yaml
```

## 配置文件

```
config/
  state-machine.json          # 状态机（9个状态）
  permissions.json           # 权限模型
  mercury-capabilities.json  # 能力开关
  model-providers.json       # 模型供应商
  methods.json               # 方法注册
```

## 文档层级

```
docs/
  AUDIT-CONTRACT.md          # 审计契约（5条不可妥协规则）
  GOVERNANCE.md              # 治理规范（碎片循环问题）
  METHODOLOGY-INTEGRITY.md   # AI协作悖论处理
  MINIMAL-WORKFLOW.md        # 4层最小工作流
  ITERATION-GUIDE-*.md       # 历次迭代指南
  STRATEGIC-RETHINK.md       # 战略重思记录
  SYSTEM-MATURITY-ASSESSMENT.md  # 成熟度自评
```

## 状态流转

```
staged → deferred/indexed/draft/rejected
deferred → indexed/draft/rejected
indexed → draft/superseded/rejected  ⚠️ indexed→superseded 已删除
draft → review_ready/rejected
review_ready → audited/rejected
audited → approved/rejected
approved → superseded
rejected → (终态)
superseded → (终态)
```

## routing_decision 四分类

```
discard   → 拦截，不进长期记忆
archive   → 存档，但不promote
review    → 需人工复核
promote   → 进入样本库，可被调用
```
