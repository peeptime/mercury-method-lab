# PERFORMANCE-BASELINE.md

> 性能基线记录
> Provenance: `[AI_ASSISTED]`
> Date: 2026-05-20
> 范围：本地结构化基准测试，无外部 LLM / 网络 / 存储调用

---

## 测试方法

```bash
node scripts/benchmark_v2_paths.mjs [iterations]
# 默认 2000 次迭代
# 环境变量：MERCURY_V2_BENCHMARK_ITERATIONS=5000
```

**测量内容：** 纯 CPU 结构化操作，无任何 I/O
- 无 LLM 调用
- 无网络请求
- 无文件系统操作
- 无浏览器渲染

---

## v2.1.6 基线（2026-05-20，Node v22.16.0，2000 次迭代）

| Function | avg_ms | ops/sec | 说明 |
|---|---|---|---|
| `audit` | 0.07 | 14,523/s | 核心审计 + 路由决策 |
| `auditMemoryWrite` | 0.07 | 14,642/s | 记忆写入门控审计 |
| `buildEvidenceChain` | 0.08 | 12,209/s | 证据链构建 |
| `buildAdmissionContract` | 0.06 | 16,116/s | 准入契约生成 |
| `verifyAuditStability` | 0.09 | 11,019/s | 稳定性验证（含双次运行） |
| `full_pipeline` | 0.06 | 17,216/s | 端到端完整管道 |

**流水线 ops/sec：17,216/s**（最快单函数）

---

## 基线文件

当前基线保存在：`data/benchmark-baseline.json`

每次运行 `benchmark_v2_paths.mjs` 会：
1. 自动保存新结果到 `data/benchmark-baseline.json`
2. 对比历史基线，显示每个函数的同比变化（%）
3. 记录到本文档

---

## 性能警戒线

| 指标 | 警戒值 | 触发条件 |
|---|---|---|
| `full_pipeline` avg_ms | > 0.10ms | 相比基线下降 > 40% |
| `auditMemoryWrite` avg_ms | > 0.10ms | 相比基线下降 > 40% |
| 任意函数 ops/sec | < 5000/s | 吞吐量严重下降 |

触发警戒线后，应运行 `npm run test:fidelity` 确认功能未被破坏。

---

## 性能优化方向（已知的改进空间）

### 高优先级

| 方向 | 当前状态 | 改进目标 |
|---|---|---|
| `verifyAuditStability` | 11,019/s（最慢） | 优化一致性检测算法 |
| `buildEvidenceChain` | 12,209/s | 批量处理多个 claim 时有优化空间 |

### 中优先级

| 方向 | 当前状态 | 改进目标 |
|---|---|---|
| `auditWithStabilityCheck` | 内部使用双次 fullAudit | 考虑单次运行 + 缓存结果 |
| benchmark 覆盖 | 6 个函数 | 未来覆盖 `extractCoreClaim`、`trace` |

---

## 版本历史

| 版本 | 日期 | full_pipeline ops/sec | 变更说明 |
|---|---|---|---|
| v2.1.6 | 2026-05-20 | 17,216/s | 首次建立基线 |
