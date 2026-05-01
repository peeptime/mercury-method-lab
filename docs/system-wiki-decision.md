# System Wiki Decision

## 中文结论

建议建立系统 Wiki，但现阶段不要先开独立 GitHub Wiki。

当前更合适的做法是把 `docs/` 当成“版本化系统 Wiki”：它跟代码、配置、路由规则、记忆迁移方案一起进入 Git 版本控制，方便审查、回滚、发布和被智能体读取。

等项目接口稳定、外部读者开始反复询问同类问题、教程不再每次迭代都大改时，再把成熟内容抽到 GitHub Wiki 或文档站。

## Recommendation

Build a system wiki, but start it inside the repository as versioned docs, not as a separate GitHub Wiki yet.

## Why Not GitHub Wiki First

GitHub Wiki is useful for public reading, but it is weaker for the current stage:

- harder to review through normal pull requests
- easier to drift away from code and configs
- weaker as an agent-readable source of truth
- less connected to versioned releases

Mercury Method Lab is still changing quickly. The wiki should stay close to the code until the interfaces stabilize.

## Current Wiki Shape

Use `docs/` as the system wiki for now:

- `project-positioning.md`
- `agent-first-submission-layer.md`
- `gui-intake-workflow.md`
- `rule-routing.md`
- `memory-architecture-migration.md`
- `upstream-mercury-agent-compatibility.md`
- `license-and-source-policy.md`
- `publication-plan.md`

## When To Open A Separate GitHub Wiki

Create a GitHub Wiki when at least three of these are true:

- external users are asking repeated usage questions
- there are stable tutorials that should not change every commit
- the project has tagged releases with stable behavior
- non-developer readers need a cleaner reading surface
- the docs folder becomes too dense for onboarding

## Proposed Wiki Sections

When the separate wiki is created, use these sections:

- Start Here
- Submit Material
- Agent Intake Protocol
- Artifact Lifecycle
- Rule Routing
- Memory Migration
- Public Release Guide
- FAQ

## Decision

For now:

```text
Use repo docs as the system wiki.
Do not split into GitHub Wiki yet.
Re-evaluate after the next public iteration.
```
