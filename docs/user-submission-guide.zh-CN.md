# 用户提交指南

## 最简单方式

如果你不会 Git，把观点发到 GitHub Issue。

标题建议：

```text
[Viewpoint] 你的观点标题
```

正文粘贴 markdown 内容即可。

## 会 Git 的方式

新增一个文件到：

```text
submissions/viewpoints/
```

文件名建议：

```text
YYYY-MM-DD-short-slug.md
```

文件开头建议带 metadata：

```yaml
---
schema_version: "0.1"
submission_type: viewpoint
title: "观点标题"
submitter: "你的名字或 handle，可选"
license_intent: "review-only"
visibility: "public"
source_kind: "original"
routing_hint: "factual-cleaning"
created_at: "YYYY-MM-DD"
---
```

## 这个入口不是做什么

提交观点不等于观点被系统采纳。

它只表示：

- 观点进入公开提交区
- 可以被人或智能体读取
- 可以被转入内部证据链
- 后续仍需清洗、审计和复查

## 智能体支持

OpenClaw 或爱马仕类智能体可以读取：

```text
submissions/agent-queue/*.json
```

然后按 `docs/agent-first-submission-layer.md` 的协议处理。
