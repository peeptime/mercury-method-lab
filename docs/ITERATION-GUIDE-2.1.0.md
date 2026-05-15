# ITERATION-GUIDE-2.1.0.md

> v2.1.0 迭代交接文档
> 日期：2026-05-12
> Provenance: `[AI_ASSISTED]`
> human_reviewed: declined

---

## 本版本背景

v2.1.0 是 v2.0.x 系列的功能性深化版本，不是 API 破坏性变更。

主要交付：
1. F5 稳定性引擎（新增，不是 v2.0.2 的规划内容）
2. 类型感知路由论证（方法论文档深化）
3. F1-F5 × routing 集成测试

---

## 本版本完成的内容

### F5 稳定性引擎

**文件：** `src/mercury-audit/fidelity-stability.mjs`

**核心导出：**
```js
import { verifyAuditStability, applyStabilityGate } from "@GlimpseGate/admission-lab";
```

**验证方式：**
```bash
node src/mercury-audit/test_fidelity_routing_integration.mjs
# 21/21 passing
```

**已集成到 `fullAudit()`：** 使用 `check_stability: true` opt-in，不破坏现有流程。

**已知边界：**
- F5 是稳定性检测，不是准确性检测
- 在 LLM 环境下，完全一致的二次输出不是目标，检测极端不一致（accept vs discard）才是
- 当前稳定性阈值：0.8（stability_score < 0.8 → 触发降级）

### 类型感知路由深化

**文件：** `docs/TYPE-MECE-ANALYSIS.md`

已确立：
- 9 种对象类型的 2×2 MECE 论证（可证伪性 × 来源可追溯性）
- `procedural knowledge`（程序性知识）用 `reference` + `provenance_type: procedural_knowledge` 处理
- 类型转换关系已定义，推迟到 human_review 落地后实施

### F1-F5 × routing 联动

F1（低忠实度）和 F5（不稳定）有共同下游效应：
- `fidelity_score < 0.8` 或 `stability_score < 0.8` → `routing_decision` 降级
- 同时 `human_review_required = true`

降级链：
```
accept  → revise
revise  → quarantine
quarantine → quarantine
discard → discard（终端，不降级）
```

---

## 本版本未完成的内容（已知债务）

| 事项 | 状态 | 阻塞原因 |
|---|---|---|
| human_review 落地 | 未完成 | 需要真实用户反馈才能定义边界 |
| 类型转换逻辑（hypothesis → fact） | 推迟 | 依赖 human_review |
| 外部用户采纳（charter users） | 未开始 | 需要运营投入 |
| License 完善 | 部分完成 | README 有徽章，但 LICENSE 文件需确认年份和项目名 |
| Ground-Truth Track（precision/recall 统计） | 未开始 | 需要 30-100 条标注样本 |

---

## 接续开发检查清单

下次迭代开始前，确认以下状态：

```powershell
# 必须全绿
npm run test:fidelity      # 31/31 passing
npm run validate:incr     # 无 provenance 错误
npm run release:gate       # 发布门禁通过

# 确认以下文件已同步
# README.md          版本号 → 2.1.0
# README.en.md       版本号 → 2.1.0
# docs/ITERATION-GUIDE-LATEST.md   指向本文件
```

---

## 下一步主线（2.2.0 候选）

按优先级：

1. **Human Trust Anchor**：至少一个关键文档获得真实 human review
2. **Charter User 收集**：第一个非项目方的真实用户案例
3. **Ground-Truth Track**：构建 30 条标注样本，开始 precision/recall 统计
4. **程序性知识 SDK 集成**：在 `buildAdmissionContract()` 中正式支持 `provenance_type: procedural_knowledge`

---

## Provenance

本文档由 AI 辅助生成。交接内容均经过代码和 GitHub 历史验证。

```yaml
provenance:
  authors: project_owner + QClaw
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: src/mercury-audit/fidelity-stability.mjs
```
