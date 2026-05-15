# Scenario Packs

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/ITERATION-GUIDE-1.8.0.md
```

Scenario packs let teams use the same Mercury kernel without pretending every domain has the same evidence threshold.

## Built-In Packs

| Scenario | Use For | Default Profile | Default Standard |
|---|---|---|---|
| `ai-coding` | code changes, test claims, architecture notes, agent summaries | `v8.1-reality-sync` | `mercury-core` |
| `personal-knowledge` | user preferences, personal rules, long-term profile memory | `v8.5-correction` | `mercury-core` |
| `investment-research` | market claims, company theses, category memos | `external-auditor` | `high-risk-memory` |
| `enterprise-delivery` | FDE notes, customer delivery, stakeholder summaries | `external-auditor` | `high-risk-memory` |
| `legal-medical-risk` | regulated or professional-risk claims | `external-auditor` | `high-risk-memory` |

## SDK Use

```js
import { audit } from "@GlimpseGate/admission-lab";

const result = audit("The agent fixed the production bug.", {
  scenario: "ai-coding",
  type: "agent_summary",
  source_refs: ["commit:abc123"],
  audit_refs: ["test:unit-output"]
});

console.log(result.scenario.id);
console.log(result.review_guidance.next_best_action);
```

## Why This Matters

The same claim shape can have different consequences:

- a personal preference memory needs attribution and expiry
- a coding claim needs diff and test evidence
- an investment claim needs dated source and counter-evidence
- a delivery claim needs speaker attribution and dissent preservation
- a legal/medical claim needs qualified human review

Scenario packs keep Mercury from applying one author's local standard to every team.
