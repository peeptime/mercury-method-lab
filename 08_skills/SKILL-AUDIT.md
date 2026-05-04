# Skill 审计报告

> 审计日期：2026-05-04
> 框架：SKILL-DESIGN-GUIDE.md v0.1.0
> 补充发现：碎片循环问题（见 docs/GOVERNANCE.md）

---

## 新增审计发现：碎片循环问题

Mercury Lab 的真实问题不是"更多 artifact"，而是：

> **废品回收站在垃圾桶找到塑料瓶，洗一洗，放进干净的柜子里。就没有了。**

碎片进来 → 洗干净 → 放进各种目录 → 存档。

**从来不是：洗干净 → 再做成新瓶子。**

详见 `docs/GOVERNANCE.md` 的完整目标定义和架构优先级。

> 审计日期：2026-05-04
> 框架：SKILL-DESIGN-GUIDE.md v0.1.0

---

## 审计摘要

| Skill | 行数 | 字数 | 主要问题 |
|-------|------|------|---------|
| mercury-lab | 138 | 5396 | 无 allowed_tools，无触发测试集，SKILL.md 过长（应拆 references/） |
| fact-cleaner | 14 | 451 | 无 allowed_tools，无触发测试集，Output Format 应移入 assets/ |
| equilibrium-explainer | 16 | 534 | 同上 |
| redteam-auditor | 14 | 478 | 同上 |
| action-translator | 16 | 447 | 同上 |
| constraint-checker | 15 | 500 | 同上 |

---

## 通用问题

### 1. 无 allowed_tools 配置

**所有 Skill 均未声明 allowed_tools。**

影响：
- OpenClaw 可能默认开放所有工具，权限过大
- 无法区分"只读建议"和"可写可执行"的 Skill

修复方向：
```
fact-cleaner:        [Read, Grep]              # 只读分析
equilibrium-explainer:[Read, Grep]              # 只读分析
constraint-checker:  [Read, Grep]              # 只读分析
redteam-auditor:    [Read, Grep, Write]       # 需要写审计报告
action-translator:  [Read, Grep, Write]       # 需要写行动方案
mercury-lab:        [Read, Grep, Write, Bash] # 全栈管理
```

### 2. 无触发评估测试集

**没有任何 Skill 包含"应该触发/不应该触发"的测试用例。**

影响：Skill 存在但可能不会被正确触发，或被误触发。

修复方向（以 fact-cleaner 为例）：
```yaml
trigger_eval:
  should_trigger:
    - "帮我把这个信息整理一下"
    - "哪些是事实哪些是推测"
    - "帮我分析一下这条信息的来源是否可靠"
    - "这些数据怎么清洗"
  should_not_trigger:
    - "帮我写一篇长文"
    - "分析一下市场趋势"
    - "给我一个logo设计"
```

### 3. 无模型选择声明

所有 Skill 未指定执行模型，导致默认统一使用，可能成本与质量不匹配。

---

## 各 Skill 详细审计

### mercury-lab

**SKILL.md 过长（138 行，5396 字）**

按照渐进式披露原则，应拆分为：

```
mercury-lab/
  SKILL.md              ← 入口，< 500 行（现状：138 行，OK）
  references/
    agent-entry-full.md  ← AGENT_ENTRY.md 完整内容
    execution-mode.md    ← API/Agent 模式详细说明
    forbidden-rules.md    ← 五条禁止事项详解
  scripts/
    v8-analyze-wrapper.sh # npm run v8:analyze 的标准化包装
```

**其他问题：**
- 无 `allowed_tools`
- 无 `trigger_eval`
- 无 `model` 声明
- 有 `references/` 但目录实际不存在（路径指向项目目录而非 Skill 目录）

---

### fact-cleaner

**Output Format 应移入 assets/**

现状：
```
## Output Format
- 原始材料摘要：
- 明面事实：
...
```

改进方向：
```
fact-cleaner/
  SKILL.md
  assets/
    output-schema.yaml   # 完整的输出 schema
    example-cleaned.md  # 清洗后的样例
```

**触发词缺口：**
用户会说"整理一下"、"清洗材料"、"哪些是事实"，但 description 未包含这些真实表达。

---

### equilibrium-explainer / constraint-checker / redteam-auditor / action-translator

**结构一致，共性问题：**
- 无 allowed_tools
- 无触发测试集
- 无模型选择
- 无 references/ 结构

---

## 优先级修复建议

| 优先级 | 任务 | 理由 |
|--------|------|------|
| P0 | 为所有 Skill 补 allowed_tools | 安全边界明确化 |
| P0 | 为所有 Skill 补 trigger_eval | 入口准确性保障 |
| P1 | mercury-lab 拆 references/ | 渐进式披露 |
| P1 | fact-cleaner 拆 assets/ | 输出标准化 |
| P2 | 所有 Skill 补 model 声明 | 成本优化 |
| P2 | fact-cleaner 补 test data | 质量验证 |

---

## 下一步

按 SKILL-DESIGN-GUIDE.md 的验证闭环，逐个 Skill 做：
1. 补 trigger_eval 测试集
2. 补 allowed_tools
3. 拆 references/ 和 assets/
4. 准备 test data 并打分
5. baseline 对比（用 Skill vs 不用 Skill）
