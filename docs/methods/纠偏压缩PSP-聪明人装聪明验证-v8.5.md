# PSP-Gate v8.5 | 收敛与错误闸门层
筛的是：有没有能力把复杂问题压缩成一个“可被验证的最小模型”它只验证：
你有没有模型
模型是否清晰
但不会保证：
模型是不是对的
是否遗漏关键变量
👉 你可能会：
用一个很干净的“错误模型”稳定输出
## 版本定位

- 类型：覆盖层（Overlay Layer），叠加于 `PSP-V8.0` 之后
- 角色：收敛、错误闸门、能力评估
- 定位说明：不是 `PSP-V8.0` 的替代版本，而是其后置验证层

---

## 系统流程

```text
原始输入
→ PSP-V8.0（结构化与降噪）
→ PSP-Gate v8.5（收敛与校验）
→ PASS / ERROR
```

---

## 核心目标

- 强制收敛到单一主导变量或单一主导关系
- 强制输出最小因果表达
- 对无效输出给出明确错误原因
- 提供可切换的约束强度等级

---

## 输入协议

必须使用如下结构化输入接口：

```text
[V8.5 Interface]
Candidate Variables: ___ / ___ / ___
Candidate Relations: ___ / ___
Weakest Assumption: ___
Disputable Point: ___
```

若缺失必填项，立即返回：

```text
STATUS: ERROR
TYPE: Missing Input
REASON: Required interface fields not found
ACTION: Provide candidate variables and relations
```

---

## 约束等级

### Gate-L1（轻约束）

- 每个模块最多 `2` 句
- 允许 `1` 个主变量 + `1` 个辅助变量
- 允许弱反事实
- `Conclusion` 不超过 `12` 字

### Gate-L2（标准）

- 每个模块最多 `1` 句
- 只允许 `1` 个变量或 `1` 个关系
- 必须包含有效反事实
- `Stability` 只能是二元判断
- `Conclusion` 不超过 `10` 字

### Gate-L3（硬约束）

- 总输出不超过 `5` 行
- 禁止背景解释
- 严格单变量
- 任一违规直接返回 `ERROR`
- `Conclusion` 不超过 `8` 字

---

## 核心机制

### 1. 收敛机制（Convergence）

只能保留一个主轴：

```text
Dominant Variable: ___
Dominant Relation: ___
```

规则：

- 不允许多变量并行解释
- 不允许使用“很复杂”“多因素共同作用”等退避措辞

失败时返回：

```text
STATUS: ERROR
TYPE: No Convergence
REASON: Multiple or undefined dominant variables
ACTION: Remove all non-dominant variables
```

### 2. 最小因果式（Minimal Causal Form）

```text
Causal Expression: ___
```

规则：

- 只能是一句话
- 必须显式包含因果或约束关系
- 禁止叙述、铺陈、举例

失败时返回：

```text
STATUS: ERROR
TYPE: No Causal Link
REASON: No explicit causal relationship
ACTION: Rewrite as variable → outcome
```

### 3. 反事实测试（Counterfactual Test）

```text
Counterfactual: ___
Stability: YES / NO
```

规则：

- 反事实必须直接挑战主导变量
- 必须是现实中可成立的情况
- `Stability` 必须是二元值

失败时返回：

```text
STATUS: ERROR
TYPE: Invalid Counterfactual
REASON: Does not challenge core variable
ACTION: Construct direct contradiction case
```

### 4. 最小结论（Minimal Conclusion）

```text
Conclusion: ___
```

规则：

- 只保留结论，不附解释
- 禁止出现“因为、所以、因此、说明”等逻辑连接词
- 必须落在当前等级的字数限制内

失败时返回：

```text
STATUS: ERROR
TYPE: Narrative Overflow
REASON: Exceeds length or contains explanation
ACTION: Remove all descriptive language
```

---

## 输出格式

```text
STATUS: PASS / ERROR

Dominant Variable: ___
Dominant Relation: ___
Causal Expression: ___

Counterfactual: ___
Stability: YES / NO

Conclusion: ___

Error Type: ___
Reason: ___
Action: ___
```

输出规则：

- `PASS` 时，错误字段可省略
- `ERROR` 时，错误字段必须填写
- 不允许 `PASS` 与 `ERROR` 混合出现

---

## 错误类型

- `Missing Input`
- `No Convergence`
- `Multi-Variable Drift`
- `Narrative Overflow`
- `No Causal Link`
- `Invalid Counterfactual`
- `Ambiguous Judgment`
- `Unstable Conclusion`

---

## 硬规则

1. `Single Axis Only`
   所有输出都必须依赖单一解释轴。

2. `Error Priority`
   一旦发现无效输出，必须立即返回 `ERROR`。

3. `Counterfactual Required`
   没有反事实，不能判为 `PASS`。

4. `Action Must Be Executable`
   修正动作必须可执行，不能给出空泛建议。

5. `No Dependency on V8.0 Completeness`
   即使 `PSP-V8.0` 前段分析成立，只要 `v8.5` 未通过，最终仍为 `ERROR`。

---

## 评分（可选）

- `Convergence`：0 / 1
- `Causality`：0 / 2
- `Counterfactual`：0 / 2
- `Stability`：0 / 2
- `Compression`：0 / 2
- `Error Clarity`：0 / 1

总分：`10`

### 分级

- `9–10`：高稳定性
- `7–8`：可用
- `5–6`：临界可用
- `0–4`：ERROR

---

## 实施阶段

### Phase 1

- 长度检查
- 多变量检测
- 叙述性检测
- 错误格式校验

### Phase 2

- 变量提取
- 收敛校验
- 因果结构校验

### Phase 3

- 反事实校验
- 稳定性测试

---

## 定义

`PSP-Gate v8.5` 不负责扩展分析，不负责补充背景，也不负责放大解释。

它的职责只有三项：

- 强制收敛
- 拒绝无效推理
- 暴露模型能力边界
