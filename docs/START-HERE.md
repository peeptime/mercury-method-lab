# Start Here

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  audit_ref: docs/SCOPE.md
```

Mercury Method Lab helps you decide whether an AI-generated claim deserves durable memory.

It is not a general note app, second brain, RAG system, or agent framework. Start from the path that matches you.

## 我是普通用户

I have a ChatGPT / Claude / Gemini / local-agent answer and want to check whether it should be trusted or remembered.

```powershell
npm run dashboard
```

Open:

```text
http://127.0.0.1:4788/lite.html
```

Paste the AI output, click `开始检查`, then review:

- 处理方式: accept / revise / quarantine / discard
- 内容摘要: core claim, attribution, confidence
- Human Review Checklist: A/B/C choices for the human reviewer

## 我是 Agent

Read these first:

- `MEMORY.md`
- `docs/ITERATION-GUIDE-LATEST.md`
- `docs/AGENT-AUDIT-BLUEPRINT.md`

Run the cheap status check before reading long files:

```powershell
npm run cycle:status
npm run cycle:check
```

## 我要跑一次审计

```powershell
npm run audit
npm run report
```

Outputs:

- `dist/audit-results.json`
- `dist/reports/index.html`

## 我要保存一段 AI 对话作为来源

```powershell
npm run capture -- --file path\to\conversation.md
```

Capture only preserves source evidence. It does not approve the content or write durable memory.

## 我要理解方法论

Read in this order:

1. `README.md`
2. `docs/FAILURE-MODES.md`
3. `docs/ROUTING-THEORY.md`
4. `docs/PROOF-PACK-COVERAGE-MATRIX.md`
5. `docs/RELATED-WORK.md`
6. `docs/SCOPE.md`

## 最短解释

Mercury does not ask: "Is the AI answer smart?"

Mercury asks: "What evidence would make this safe to remember?"
