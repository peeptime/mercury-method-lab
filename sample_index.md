# Sample Index

This file explains the visible sample-library layer.

Generated file:

```text
11_indexes/sample-index.json
```

Run:

```powershell
npm run index
```

## Why It Exists

`source-index.json` answers:

```text
What files exist?
```

`sample-index.json` answers:

```text
What judgment samples exist, what state are they in, and what is still missing?
```

That distinction matters because Mercury Lab is not only cleaning fragments. It is trying to create a reusable sample library.

## Fields

| Field | Meaning |
|---|---|
| `sample_type` | Waste, material, observation, hypothesis, case, template, decision, action plan, skill, or audit. |
| `project_id` | Which project or problem this sample belongs to. |
| `reuse_count` | How many later tasks reused this sample. |
| `reuse_refs` | Which later tasks reused it. |
| `feedback_status` | Whether decision/action outcomes came back. |
| `feedback_refs` | Where the outcome feedback is stored. |
| `memory_level` | Whether it should be remembered from `M0` to `M4`. |
| `confidence` | Current confidence level. |
| `risk` | Risk if reused incorrectly. |

## Example Record

```json
{
  "path": "examples/ai-consulting-replacement/classified-sample.yaml",
  "type": "memory_candidate",
  "status": "review_ready",
  "sample_type": "假设",
  "project_id": "examples.ai-consulting-replacement",
  "reuse_count": 1,
  "feedback_status": "pending",
  "memory_level": "M1",
  "confidence": "medium",
  "risk": "medium"
}
```

## Known Gaps It Should Expose

The sample index should make these gaps machine-visible:

- samples without `sample_type`
- samples without `project_id`
- samples with no reuse tracking
- decision logs or action plans with no feedback

The next step is not more documentation. The next step is making agents consult this index before creating new artifacts.
