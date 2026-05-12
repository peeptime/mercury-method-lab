# TYPE-MECE-ANALYSIS.md

> 对象类型分类体系的 MECE 论证与缺口分析
> Provenance: [HUMAN_ONLY]
> Date: 2026-05-12
> Audience: method lab contributors / auditors

---

## 一、为什么要论证 MECE

Mercury Admission Lab 对 AI 输出的每一次准入决策，都必须明确"这个内容是什么类型的知识"。

如果类型体系本身存在：
- **重叠**（一个对象同时属于两种类型）→ 路由逻辑不确定，结果不稳定
- **缺口**（有知识类型但无对应类型）→ 某些内容被错误分类，或无法被准入

MECE（Mutually Exclusive, Collectively Exhaustive）是本分析的评估框架：
- **互斥**：每种类型有且仅有一种归属
- **穷尽**：所有知识类型都有对应入口

---

## 二、2×2 分析矩阵

评估一个记忆对象的两个根本维度：

| | **可追溯到外部来源** | **原创/推断内容** |
|---|---|---|
| **可被证伪**（有客观真假） | A: `fact` | B: `hypothesis` |
| **不可被证伪**（主观/程序性） | C: `attribution` / `reference` | D: `interpretation` / `preference` / `decision_record` / `procedure` |

> 注："可被证伪"引用 Popper 的科学划界标准——是否存在一个原则上可被发现为假的观察陈述。

---

## 三、9种现有类型在矩阵中的位置

| 类型 | 所在象限 | 核心特征 |
|---|---|---|
| `fact` | A | 可追溯来源 + 可证伪 |
| `hypothesis` | B | 原创/推断 + 可证伪 |
| `attribution` | C | 追溯他人观点 + 不可直接证伪 |
| `reference` | C | 追溯外部文档 + 不可直接证伪 |
| `interpretation` | D | 主观解读 + 不可证伪 |
| `preference` | D | 个人偏好 + 不可证伪 |
| `decision_record` | D | 决策记录 + 不可证伪 |
| `open_question` | D | 未决问题 + 不可证伪 |
| `temporary_note` | D | 临时备注 + 不可证伪 |

---

## 四、互斥性验证

### 检验：每种类型有且仅有唯一归属

| 类型对 | 区分依据 | 结论 |
|---|---|---|
| `fact` vs `hypothesis` | 有无充分证据支撑 | 互斥 ✅ |
| `fact` vs `attribution` | 是否为他人表述 | 互斥 ✅ |
| `attribution` vs `reference` | 是否指向具体来源文档 | 互斥 ✅ |
| `reference` vs `interpretation` | 是否包含主观判断 | 互斥 ✅ |
| `preference` vs `decision_record` | 是个人倾向 vs 正式决策 | 互斥 ✅ |
| `open_question` vs `hypothesis` | 是否有验证路径 | 互斥 ✅ |
| `temporary_note` vs `decision_record` | 是否为正式记录 | 互斥 ✅ |

**互斥性结论：基本互斥，无显著重叠。**

---

## 五、穷尽性验证与缺口

### 现有 9 种类型的覆盖情况

| 知识类型 | 覆盖状态 |
|---|---|
| 客观可证伪事实（有来源） | ✅ `fact` |
| 可证伪推断（暂无充分证据） | ✅ `hypothesis` |
| 可证伪推断（证据充分） | ✅ `fact`（upgrade 路径） |
| 他人表述/引用 | ✅ `attribution` / `reference` |
| 主观解读/分析 | ✅ `interpretation` |
| 个人偏好 | ✅ `preference` |
| 正式决策记录 | ✅ `decision_record` |
| 未决问题 | ✅ `open_question` |
| 临时备注 | ✅ `temporary_note` |
| 程序性知识（"怎么做"） | ⚠️ **缺口** |

### 缺口分析：`procedural knowledge`（程序性知识）

**缺口描述：**
"怎么做某件事"的记忆——步骤、流程、配方、操作规程——不完全属于现有 9 种类型中的任何一种。

**为什么是缺口：**

| 尝试 | 问题 |
|---|---|
| 归入 `fact` | 程序性知识不是客观事实（可执行但不是"真"） |
| 归入 `reference` | reference 暗示"照抄来源"，程序需要理解步骤 |
| 归入 `interpretation` | interpretation 是解读，程序是操作 |
| 归入 `decision_record` | 决策≠操作步骤 |

**最小修复方案（不新增类型）：**

> 将程序性知识归入 `reference`，但在 `usage_scope` 中做明确约束：
>
> ```
> object_type: reference
> usage_scope:
>   - 可以作为操作参考
>   - 禁止作为唯一决策依据
>   - 需配合实际场景判断
>   - 标注执行条件
> provenance_type: procedural_knowledge
> ```

---

## 六、类型转换关系

类型不是静态的。内容在获得或失去证据时，应当允许类型迁移：

| 原类型 | 触发条件 | 目标类型 | 说明 |
|---|---|---|---|
| `hypothesis` | ≥2 个独立 source_ref 证明 | `fact` | 证据积累触发升级 |
| `fact` | 出现反驳证据 | `open_question` | 降级为未决 |
| `fact` | 确认是他人表述 | `attribution` | 来源修正 |
| `hypothesis` | 明确无法证伪 | `interpretation` | 转为主观解读 |
| `temporary_note` | 被正式采纳为决策 | `decision_record` | 升级为正式记录 |
| `open_question` | 获得足够证据 | `hypothesis` / `fact` | 沿证据链升级 |
| 任意类型 | source_ref 全部消失 | `interpretation` | 失去来源降级 |

**实施前提：** 类型转换需要 human_review 机制落地，否则 AI 自动升级会回到"自己判断自己"的悖论。

---

## 七、类型 × routing 约束矩阵

每种类型有不同的 routing 准入条件：

| 类型 | 允许 routing | 禁止 routing 升级条件 |
|---|---|---|
| `fact` | accept | 无 source_ref → revise/quarantine |
| `hypothesis` | revise | 用于 action trigger → quarantine |
| `attribution` | revise / quarantine | 作为事实引用 → quarantine |
| `reference` | revise / quarantine | 直接 action trigger → discard |
| `interpretation` | revise / quarantine | 作为客观事实使用 → discard |
| `preference` | accept / revise | 用于逻辑推理（需要证据）→ quarantine |
| `decision_record` | accept / revise | 无决策依据记录 → revise |
| `open_question` | quarantine | 直接用于推理 → discard |
| `temporary_note` | quarantine / discard | 直接 promotion → discard |

---

## 八、结论

| 维度 | 评估 |
|---|---|
| 互斥性 | ✅ 基本互斥，9种类型之间有清晰区分边界 |
| 穷尽性 | ⚠️ 有一个已知缺口：程序性知识（procedural knowledge） |
| 转换逻辑 | ⚠️ 转换关系已定义，但需要 human_review 落地才能安全实施 |
| usage_scope 约束 | ✅ 现有 9 种已有 usage_policy，但 procedural knowledge 需补充 |
| 实施优先级 | 高：先补 procedural knowledge 的 usage_scope；中：类型转换逻辑；低：新增独立类型 |

**下一步（v2.1.x）：**
- 在 `admission-contract.mjs` 中补充 `procedural_knowledge` 的 provenance_type 映射
- 在 `docs/TYPE-MECE-ANALYSIS.md` 中记录此映射
- 类型转换逻辑（hypothesis → fact 升级）推迟到 human_review 落地后（v2.3+）
