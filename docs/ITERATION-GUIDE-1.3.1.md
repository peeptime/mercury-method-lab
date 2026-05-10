# Iteration Guide 1.3.1

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/REVIEW-LEDGER.md
```

Version `1.3.1` is the Lite Intake and Trust Ledger Patch.

## Objective

Lower the cost of getting an AI conversation into Mercury without lowering the audit gate:

- preserve pasted/file/dropzone AI output as source evidence
- generate a temporary Audit Packet and structural audit result under `dist/captures/`
- keep capture provenance at `human_reviewed: declined`
- keep `audit_refs: []` until a real review path exists
- record the v1.3.0/Cycle 02 version-line debt instead of hiding it

## Commands

```powershell
npm run capture -- --file examples/ai-conversation-capture.md
npm run capture:dropzone
npm run capture:check
npm run dashboard
```

Lite Mode:

```text
http://127.0.0.1:4788/lite.html
http://127.0.0.1:4788/lite.html?source=chatgpt&text=...
```

## What Did Not Change

- Capture is not memory promotion.
- Lite Mode does not grant human review.
- `v1.3.x` remains a product/Lite intake patch line.
- Cycle 02 proof, failure-mode, review-ledger, and charter-user checks still apply.
- No new major methodology framework name was added.

## Validation

```powershell
npm run capture:check
npm run dashboard:check
npm run cycle:check
npm run audit
npm run report
npm run test
npm run release:gate
```
