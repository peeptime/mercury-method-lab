# Changelog

## Unreleased

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
