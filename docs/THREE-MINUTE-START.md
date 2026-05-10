# Three-Minute Start

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/REVIEW-LEDGER.md
```

Use this when you have a ChatGPT, Claude, Gemini, or local-agent answer that sounds plausible and you want Mercury to decide whether it deserves durable memory.

## Path 1: Paste Once

```powershell
npm run dashboard
```

Open:

```text
http://127.0.0.1:4788/lite.html
```

Paste the AI output, click `Audit`, then read the routing decision.

Nothing is stored unless you click `Save Capture`.

## Path 2: Save a File

Put a `.md` or `.txt` file in:

```text
00_inbox/ai-conversations/
```

Then run:

```powershell
npm run capture:dropzone
```

Mercury writes a temporary Audit Packet and result under:

```text
dist/captures/
```

This capture is not approved memory. It starts with:

```yaml
human_reviewed: declined
audit_refs: []
risk_level: high
```

That means a captured AI output can be preserved as source evidence without being promoted into long-term memory.

## Path 3: One File Command

```powershell
npm run capture -- --file examples/ai-conversation-capture.md
```

Expected shape:

```text
capture_...: quarantine (...)
source=examples/ai-conversation-capture.md
packet=dist/captures/audit-packets/...
result=dist/captures/results/...
```

## Rule

Capture lowers entry friction. It does not lower audit friction.

Captured material must still pass the normal Mercury gates before it becomes durable project memory.
