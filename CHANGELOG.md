# Changelog

## Unreleased

## 0.6.0 — `/goal` 照妖镜 + Agent 内嵌验证

将目标质量门内化为 Agent 内嵌逻辑，实现零进程开销验证。与 v0.5.2 的 agent_context_policy 一脉相承：Agent 模式不能只是"不调 API"，还必须把任务边界收窄成可直接执行的闭合上下文包。

### Added

- `scripts/goal-validator.mjs`：可内嵌的纯函数，5 维度目标质量验证（可交付物、可验证性、时间边界、范围边界、责任归属）+ PIES-min 四关检验（案例关、模板关、决策关、反馈关）。
- `/api/goal/validate` 和 `/api/goal/create` 接入 dashboard_server（用于人工调试，不建议 Agent 循环中调用）。
- `npm run goal:validate` 入口（仅 CLI 调试用）。
- Action plan artifact 生成时自动注入四关检验结果、验收条件提取、 Judgment Closure 骨架。

### Changed

- `goal-validator.mjs` 重写为纯函数（`validate(text)`），设计为直接内嵌 Agent 上下文，不新建进程，不扫描文件系统。CLI 模式仅用于人工调试。
- `docs/JUDGMENT-CLOSURE-RULE.md` 升级到 0.6.0：新增 5 维度验证 + 四关检验 + Agent 模式内嵌执行约束（禁止新建进程、禁止全项目扫描）。
- `docs/AGENT_ENTRY.md` 新增 `/goal` 照妖镜入口质量门章节，说明 5 维度 + 四关 + Agent 执行约束。

### Design Notes

- 5 维度验证解决"用户说不清楚自己要什么"问题（照妖镜）；四关检验解决"概念无法落地"问题（PIES-min）。两者层次不同，先过 5 维度，再跑四关。
- 四关有任意一关失败 → 目标仍可继续分析，但 artifact 元数据需标注"四关未全过，素材待验证"，不进 approved 状态。

## 0.5.2 — Agent Context Budget

Reduce OpenClaw / Agent mode intelligence spend by making V8 agent tasks self-contained and explicitly bounded.

### Added

- `agent_context_policy` in `config/methods.json` to define closed task packs, allowed reads, forbidden project areas, and read budget.
- Agent queue envelopes now embed `source_text`, persona stance, required sections, audit headings, and output targets.
- Agent queue envelopes now include `context_policy.allowed_reads`, `write_targets`, `forbidden_globs`, and a stop rule for missing context.
- Documentation for OpenClaw context budgeting in `docs/AGENT_ENTRY.md`, `docs/openclaw-integration.md`, and `submissions/agent-queue/README.md`.

## 0.5.1 — Execution Mode Guard

Fix V8 analysis startup and mode switching so persona configuration remains parseable and agent mode does not spend API tokens.

### Fixed

- Restored `config/methods.json` to valid JSON with one stable persona schema and no duplicated top-level persona fields.
- Escaped the V8.2.1 persona wording so JSON parsing no longer fails before analysis starts.
- Made `scripts/run_v8_analysis.mjs` read `execution_mode` and skip API calls in `agent` mode.
- Added `--mode` / `--execution-mode` overrides for one-off API or Agent runs.
- Hardened CLI parsing for `--persona v8.2-dimension-radar`, `--persona=v8.2-dimension-radar`, and `-p v8.2-dimension-radar`.

## 0.3.6 — Judgment Closure

Tighten PSP outputs so analysis closes with stop conditions, falsification signals, review timing, and memory-level advice. Expand model provider support for hosted OpenAI-compatible APIs and local open-source runtimes.

### Added

- Required PSP closing sections: `停止条件`, `推翻条件`, `复盘时间`, and `记忆建议`.
- Red-team audit checks for external evidence, stop-condition quality, and memory-level risk.
- Memory candidate `memory_level` support with `M0`-`M4` values.
- `docs/JUDGMENT-CLOSURE-RULE.md` describing closure, external audit, and memory grading rules.
- OpenAI-compatible provider expansion: `openai`, `ollama-local`, `vllm-local`, and `lm-studio-local`.
- API key aliases for hosted providers, including `MERCURY_API_KEY`, `OPENAI_API_KEY`, and `MERCURY_OPENAI_API_KEY`.

## 0.3.5 — Deployment Gate

Release candidate cleanup: clarify upstream boundary, reduce onboarding friction, and make deployment readiness visible in Dashboard.

### Added

- `docs/ARCHITECTURE-SHIFT-REPORT.md` explaining what shifted from upstream Mercury Agent, what was added, what was intentionally not copied, and when future docs/skills require architecture review.
- `docs/DEPLOYMENT-ONBOARDING.md` for token setup, OpenClaw-like endpoint, silent batch submission paths, OS support, and optional document conversion.
- Dashboard deployment readiness card showing Node/OS/provider/API key/persona/execution mode/batch path/OpenClaw/MarkItDown status.

## 0.3.4 — Persona Axis

Architecture pollution fix: split PSP analysis persona from execution mode.

### Added

- `analysis_persona` 配置字段：把 V8.0 / V8.1 / V8.5 从执行模式中拆出，默认 `v8.1-reality-sync`
- `docs/methods/` 收纳 PSP-V8.0、PSP-V8.1、v8.5 纠偏提示词，减少工作区外依赖
- `docs/ANALYSIS-PERSONA-DESIGN.md` 记录人格轴与执行通道轴的架构边界
- Dashboard Analysis persona 预览与切换控件，并写回 `config/methods.json`
- `PATCH /api/analysis-persona` Dashboard API
- Dashboard Execution mode 切换控件，并写回 `config/methods.json`
- `PATCH /api/execution-mode` Dashboard API
- `AGENT_ENTRY.md` 和 `mercury-lab` skill 的 API / Agent 模式分流说明
- Dashboard 版本嗅探提示：显示后端版本、前端资源版本、package 版本和 Node 版本，前后端错位时提示刷新或重启
- `execution_mode` 配置字段：支持 API 模式和 Agent 模式切换
- `scripts/run_v8_analysis.mjs` V8.0 自动化执行脚本
- AGENT_ENTRY.md AI 和人类的入口文档
- UX 优化报告：8 项 UI 改进
- 系统成熟度评估文档
- 创新工程实践指导 V8 分析 artifact
- EXECUTION-MODE-DESIGN.md 执行模式设计文档

## 0.3.3 — Execution Mode

Execution mode feature release.

### Added

- `execution_mode` 配置字段：支持 API 模式和 Agent 模式切换
  - `api`：使用 V8 执行脚本 + API token（确定性高，成本高）
  - `agent`：使用 AI Agent 智能做 V8 分析（成本低，质量依赖 Agent）
- 存储始终激活约束：无论哪种模式，Mercury Lab 的存储管理必须始终激活
- `docs/EXECUTION-MODE-DESIGN.md` 执行模式设计文档

## 0.2.0 — Open Orbit

Architecture hardening release.

### Added

- Project identity: **Mercury Method Lab**.
- Upstream Mercury Agent compatibility policy for `cosmicstack-labs/mercury-agent`.
- Runtime compatibility check: `npm run check:upstream`.
- Memory architecture migration policy with reversible migration envelopes.
- Rule routing policy for factual cleaning, structural judgment, content diagnosis, action translation, audit, migration, and publication.
- Agile roadmap, publication plan, and source/license policy.
- Public `.gitignore` guardrails for secrets, logs, generated indexes, and local state.
- English reader entrypoint in `README.en.md`.
- Agent-first submission layer for markdown viewpoints and OpenClaw/Hermes-like agent queue envelopes.
- GitHub Issue and PR templates for public intake.
- `npm run import:viewpoint` to promote user viewpoint markdown into raw artifacts without approving it as truth.
- V8.0 自动化执行脚本 `run_v8_analysis.mjs`
- Dashboard UX 8 项优化
- 系统成熟度评估（当前 70%，缺少 fact-cleaner 和 Dashboard 集成）

### Changed

- Package name changed from `v8-mercury-backend` to `mercury-method-lab`.
- Package version changed from `0.1.0` to `0.2.0`.
- README now describes this repository as a companion method lab, not the Mercury runtime.

### Compatibility

- Observed upstream package: `@cosmicstack/mercury-agent@1.1.4`.
- Target range: `>=1.1.0 <2.0.0`.
- Integration mode: companion workspace, not fork and not vendor copy.

## 0.1.0

Initial local V8 Mercury backend workspace.
