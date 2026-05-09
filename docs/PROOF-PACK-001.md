# Mercury Lab Proof Pack 001

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/NEXT-PHASE-MEMORY.md
```

This proof pack collects real cases where an AI or AI-adjacent narrative sounds useful but should not enter long-term memory without audit.

It is not a feature roadmap. It is evidence accumulation during the `1.0.x` freeze period.

## Pack Goal

Build a small case library for the narrow Mercury Lab claim:

> A memory-audit layer for intercepting AI outputs that sound smart but should not enter long-term memory yet.

Each case should answer:

| Field | Question |
|---|---|
| Raw output | What did the AI or source narrative claim? |
| Plausibility | Why is it easy to believe? |
| Evidence gap | What `source_refs`, `audit_refs`, or external checks are missing? |
| Memory pollution risk | How could a future agent misuse it if stored as fact? |
| Mercury decision | Should it be `discard`, `archive`, `review`, or `promote`? |
| Rule learned | Which failure mode does it reveal or reinforce? |

## Case 001: Meshy BlackBox AI Game Mechanic Narrative

```yaml
case_id: proof-pack-001-case-001
raw_ref: 00_raw/2026-05-05-Meshy-GameStudio-BlackBox-游戏机制生成大模型.md
analysis_ref: 01_segmented/2026-05-05-Meshy-BlackBox-PSP-V8.1-现实同频分析.md
audit_ref: 07_audit_reports/2026-05-05-Meshy-BlackBox-PSP-V8.1-审计报告.md
routing_decision: review
failure_modes:
  - speculation_as_fact
  - authority_laundering
  - capability_transfer
  - demo_to_retention_leap
```

### Raw Output

The source narrative presents Meshy Game Studio's BlackBox as an AI-native game experiment built around AI-generated game mechanics, with a claim that success depends on making gameplay itself more fun rather than merely generating assets.

### Why It Sounds Plausible

- Meshy AI has real commercial traction in 3D generation.
- The founder and team credentials are strong.
- The narrative targets a real weakness in many AI game attempts: asset generation does not automatically improve gameplay.
- The proposed mechanic loop is concrete enough to feel product-like rather than purely speculative.

### Evidence Gap

- Steam wishlist, retention, and early-player data were not available in the artifact.
- "3D AI success" does not prove "game mechanic generation success."
- Demo examples do not prove long-term balance, replayability, or player retention.
- The team information does not yet prove game-design execution quality.

### Memory Pollution Risk

If stored as fact, a future agent could incorrectly reuse this case as proof that AI-generated gameplay is validated, or as proof that Meshy's 3D generation advantage directly transfers into game design advantage.

The safer memory is narrower:

> Meshy BlackBox is a useful audit case for distinguishing technical capability, founder narrative, demo plausibility, and market validation.

### Mercury Decision

`review`

The case has enough structure to preserve and revisit, but not enough external validation to promote as a confirmed market or technical conclusion.

### Rule Learned

Do not let a credible technical founder narrative launder an unverified market conclusion into long-term memory.

The reinforced refusal point:

```text
If a claim depends on future player behavior, do not promote it without player evidence.
```

## Open Slots

- Case 002: pending
- Case 003: pending
- Case 004: pending
- Case 005: pending
- Case 006: pending
- Case 007: pending
- Case 008: pending
- Case 009: pending
- Case 010: pending

## Pack Maintenance Rules

- Prefer real artifacts over abstract examples.
- Do not invent missing `source_refs` or `audit_refs`.
- Do not define quantified success metrics for the pack.
- Preserve uncertainty even when a case is useful.
- Add cases only when they strengthen a named failure mode.
