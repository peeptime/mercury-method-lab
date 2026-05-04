---
name: constraint-checker
description: Check whether a judgment or plan is blocked by time, money, people, tech, legal, or coordination constraints.
version: 0.1.0
allowed_tools: [Read, Grep]
---

# Constraint Checker

## Goal
检查一个判断或计划是否受现实约束，找瓶颈，不给空泛“可行/不可行”。

## Rules
1. 不要只说“可行/不可行”，必须指出瓶颈。
2. 每个约束都要落到现实条件，不要写抽象空话。
3. 一定给出最小可行动作。
4. 够不着的部分和需要暂缓的部分必须分开。

## Output Format
- 时间约束：
- 资金约束：
- 人力约束：
- 技术约束：
- 法律/合规约束：
- 组织/协作约束：
- 最小可行动作：
- 够不着的部分：
- 需要暂缓的部分：

## Trigger Eval

| Should trigger | Should not trigger |
|---|---|
| 这样做有什么限制 | 随便问问 |
| 边界在哪里 | 写营销文案 |
| 什么情况下不能用 | 总结邮件 |
| 现实约束是什么 | 生成完整方案 |
