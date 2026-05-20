# Mercury V8 迭代指南 · v0.4

## 9. 能力底座定位（0.5 迭代方向）

### 核心调整

**Mercury Lab 不是 Mercury Agent 的插件，而是能力底座。**

```
Mercury Lab（能力底座）
  - JAR 生成能力
  - 审计约束能力
  - 执行模式切换
  - artifact 状态机
  ↓ 开放接口
Mercury Agent 用户（自选择接入）
```

**集成不是默认项，而是开放的可能性。**

用户自己决定要不要用。Mercury Lab 打磨好接口，让接入成本低。用户可以通过 agent 自己完成接入。

### 竞品定位（能力底座视角）

| 竞品做的是 | Mercury Lab 做的是 |
|-----------|------------------|
| LangChain / AutoGen / CrewAI | AI 的**执行层** | AI 的**治理层** |
| Dify / Coze | 帮 AI 做事 | 帮 AI 的输出变得可信 |
| Mem0 / 记忆系统 | 给 AI 存储 | 给 AI 的判断留痕 |

### 0.5 优先级任务

| 优先级 | 任务 | 目的 |
|--------|------|------|
| 🟡 P1 | 打磨 `run_v8_analysis.mjs` 接口 | 让 agent 一行命令调用 |
| 🟡 P1 | 完善 `execution_mode` 切换 | 让 agent 知道用什么模式 |
| 🟡 P1 | 开放 `submissions/agent-queue/` 协议 | 让 agent 知道怎么提交 |
| 🟡 P1 | 文档化 API 接口 | 让用户知道怎么接入 |

### 不是 0.5 的任务

- Dashboard 复杂 UI
- 多方法路由
- 外部投稿入口
- 大众化推广

### 目标用户

Mercury Lab 是给"想研究约束优先设计哲学"的人准备的能力底座，不是大众产品。

目标用户：
- 在用 AI 做复杂分析、决策支持、商业判断的人
- 关心 AI 输出是否可靠、可追溯
- 想要把判断过程留痕的人
