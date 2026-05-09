# Mercury Lab Proof Pack 001

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  review_note: "Cycle 02 patch refuses to mark AI-generated pack text as human-reviewed until the project owner explicitly reviews it."
  audited_by: Mercury Lab self-audit
  audit_ref: docs/CYCLE-02-COMMITMENT.md
```

This proof pack collects concrete cases where an AI or AI-adjacent narrative sounds useful but should not enter long-term memory without audit.

It is not a feature roadmap. During Cycle 02, proof cases matter more than new feature names.

## Pack Goal

Build a small case library for the narrow Mercury Lab claim:

> A memory-audit layer can intercept AI outputs that sound smart but should not enter long-term memory yet.

Each case must answer six questions:

| Field | Question |
|---|---|
| Raw Output | What did the AI or source narrative claim? |
| Why It Sounds Plausible | Why is it easy to believe? |
| Evidence Gap | What `source_refs`, `audit_refs`, or external checks are missing? |
| Memory Pollution Risk | How could a future agent misuse it if stored as fact? |
| Mercury Decision | Should it be `discard`, `quarantine`, `revise`, or `accept`? |
| Rule Learned | Which named failure mode does it reveal or reinforce? |

## Case 001: Meshy BlackBox AI Game Mechanic Narrative

```yaml
case_id: proof-pack-001-case-001
raw_ref: 00_raw/2026-05-05-Meshy-GameStudio-BlackBox-游戏机制生成大模型.md
analysis_ref: 01_segmented/2026-05-05-Meshy-BlackBox-PSP-V8.1-现实同频分析.md
audit_ref: 07_audit_reports/2026-05-05-Meshy-BlackBox-PSP-V8.1-审计报告.md
routing_decision: revise
failure_modes:
  - speculation_as_fact
  - authority_laundering
  - demo_to_retention_leap
```

### Raw Output

The source narrative presents Meshy Game Studio's BlackBox as an AI-native game experiment built around AI-generated game mechanics, with a claim that success depends on making gameplay itself more fun rather than merely generating assets.

### Why It Sounds Plausible

- Meshy AI has visible traction in 3D generation.
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

`revise`

The case has enough structure to preserve and revisit, but not enough external validation to promote as a confirmed market or technical conclusion.

### Rule Learned

Do not let a credible technical founder narrative launder an unverified market conclusion into long-term memory.

## Case 002: Unsupported Long-Term Format Preference

```yaml
case_id: proof-pack-001-case-002
raw_ref: examples/audit-packets/memory_pollution_case.yaml
audit_ref: docs/AGENT-CONTEXT-BUDGET.md
routing_decision: quarantine
failure_modes:
  - missing_source_refs
  - overgeneralized_user_preference
  - unsafe_memory_write
```

### Raw Output

The candidate memory says: "The user always prefers HTML over Markdown for all future project outputs."

### Why It Sounds Plausible

- The user did ask for HTML reports and richer delivery surfaces.
- HTML is useful when audit results must be sent to non-technical collaborators.
- A future agent wants a simple durable rule, so "always prefers HTML" feels convenient.

### Evidence Gap

- The packet has no `source_refs`.
- Existing project guidance says Markdown/YAML remains the source of truth while HTML is a generated delivery layer.
- The claim removes the boundary between project-specific reporting and universal user preference.

### Memory Pollution Risk

If this enters memory, future agents may rewrite durable project records into HTML-first artifacts, weakening version control, diffs, and auditability. A delivery preference would become an identity-level preference without evidence.

### Mercury Decision

`quarantine`

The claim may contain a useful signal, but it is too broad and lacks source evidence.

### Rule Learned

Do not turn one delivery request into a permanent user preference. Preserve the narrower rule: Markdown/YAML are trusted records; HTML is presentation.

## Case 003: Agent Summary With Circular Proof

```yaml
case_id: proof-pack-001-case-003
raw_ref: examples/audit-packets/agent_project_summary_case.yaml
audit_ref: docs/METHODOLOGY-INTEGRITY.md
routing_decision: discard
failure_modes:
  - circular_reasoning
  - missing_source_refs
  - missing_audit_refs
```

### Raw Output

The agent summary claims: "The migration is complete because the AI summary says every blocker was resolved."

### Why It Sounds Plausible

- The wording resembles a normal project closeout.
- Agents often compress completed work into confident summaries.
- The phrase "every blocker was resolved" sounds like an audit result even when it is only a narrative conclusion.

### Evidence Gap

- No source artifacts prove each blocker was closed.
- No audit references show an independent review path.
- The claim uses the agent's own summary as evidence for the agent's own conclusion.

### Memory Pollution Risk

If promoted, a future agent could skip unresolved migration work because the durable memory says the project is complete. The system would convert a confidence tone into operational truth.

### Mercury Decision

`discard`

This packet has neither evidence nor audit support, and its proof loop is circular.

### Rule Learned

An agent summary cannot be the source of truth for its own completion claim.

## Case 004: Premature FDE Customer Consensus

```yaml
case_id: proof-pack-001-case-004
raw_ref: examples/audit-packets/fde_customer_delivery_case.yaml
source_ref: examples/audit-packets/field-interview-notes-2026-05-09.md
audit_ref: docs/EVIDENCE-FIRST-AUDIT-LAYER.md
routing_decision: quarantine
failure_modes:
  - missing_audit_refs
  - fde_consensus_laundering
  - customer_delivery_overconfidence
```

### Raw Output

The delivery summary says: "The client is ready to let an internal AI agent rewrite the knowledge base."

### Why It Sounds Plausible

- The field notes describe real interest in agent-assisted knowledge-base cleanup.
- Customer delivery work often needs a crisp next-step statement.
- A busy FDE may compress stakeholder ambiguity into a single implementation-ready sentence.

### Evidence Gap

- The packet has no `audit_refs`.
- The field notes say department owners disagreed about what should become canonical.
- There is no human approval path for turning interview interest into a deployment decision.

### Memory Pollution Risk

If this enters project memory, later delivery agents may treat "client consensus" as established and start writing canonical knowledge-base rules against unresolved stakeholder disagreement.

### Mercury Decision

`quarantine`

The material is useful, but not safe as a delivery conclusion.

### Rule Learned

FDE handoff summaries must preserve stakeholder uncertainty. Interest is not consensus.

## Case 005: One Template Becomes a Universal Rule

```yaml
case_id: proof-pack-001-case-005
raw_ref: examples/audit-packets/agent_overgeneralization_case.yaml
audit_ref: docs/AUDIT-METRICS-DECLINED.md
routing_decision: revise
failure_modes:
  - one_case_to_policy
  - overgeneralization
  - template_lock_in
```

### Raw Output

The packet claims: "All future FDE handoffs must use the same customer-memory template."

### Why It Sounds Plausible

- Templates reduce handoff cost.
- A single successful sample creates momentum.
- Agents like stable forms because they reduce planning uncertainty.

### Evidence Gap

- The packet cites one project pattern, not multiple delivery contexts.
- It lacks evidence that all future FDE work shares the same risk profile.
- It confuses a reusable candidate with a mandatory rule.

### Memory Pollution Risk

Future agents could force unrelated customer work into the same template, flattening important differences and creating false uniformity across delivery contexts.

### Mercury Decision

`revise`

Keep the template as a reusable option, not a global requirement.

### Rule Learned

Do not promote a template from one case into a universal operating law.

## Case 006: Source-of-Truth Split That Can Be Accepted

```yaml
case_id: proof-pack-001-case-006
raw_ref: examples/audit-packets/valid_project_decision_case.yaml
audit_ref: docs/CHECKLIST-REACTIVATION.md
routing_decision: accept
failure_modes:
  - none_triggered
  - boundary_preserved
```

### Raw Output

The packet claims: "Mercury Method Lab should keep Markdown/YAML as source of truth and use HTML as a delivery/reporting layer."

### Why It Sounds Plausible

- It matches existing project docs.
- It has local `source_refs` and `audit_refs`.
- It includes a boundary: the rule applies to Mercury Method Lab repository outputs, not every user project.

### Evidence Gap

- No material evidence gap blocks this packet.
- The decision should still be revisited if the repository changes its storage format or introduces a non-file source of truth.

### Memory Pollution Risk

Low. The main risk is future overextension beyond the repository boundary.

### Mercury Decision

`accept`

The packet is sufficiently supported for current project memory.

### Rule Learned

Mercury should be able to accept narrow, sourced claims. Refusal-only systems become another form of distortion.

## Case 007: Quantified Audit Success Metric

```yaml
case_id: proof-pack-001-case-007
raw_ref: docs/AUDIT-METRICS-DECLINED.md
audit_ref: docs/AUDIT-METRICS-DECLINED.md
routing_decision: discard
failure_modes:
  - agent_goodhart_metric
  - metric_gaming_surface
  - refusal_point_substitution
```

### Raw Output

The proposed metric said a good audit release could target something like "promote rate below a fixed threshold."

### Why It Sounds Plausible

- Metrics feel mature and management-friendly.
- A low promote rate can look like strict auditing.
- External observers often ask for quantified success indicators.

### Evidence Gap

- The metric does not prove better judgment.
- An agent can optimize the metric by discarding too much or promoting only trivial material.
- The project explicitly documents that readable success metrics can become attack surfaces.

### Memory Pollution Risk

If promoted, future agents could treat audit quality as a number to optimize rather than a set of refusal points to respect. The audit layer would be trained to look strict instead of being correct.

### Mercury Decision

`discard`

Do not store agent-readable quantified success targets as Mercury's definition of audit quality.

### Rule Learned

In agentic audit systems, measure failure modes and refusal points, not success percentages that the audited agent can game.

## Case 008: AI Collaboration Without Review Closure

```yaml
case_id: proof-pack-001-case-008
raw_ref: docs/METHODOLOGY-INTEGRITY.md
audit_ref: docs/REVIEW-LEDGER.md
routing_decision: revise
failure_modes:
  - undeclared_ai_provenance
  - human_review_theater
  - self_audit_loop
```

### Raw Output

Project artifacts can say they were produced by "AI collaboration" while leaving human review vague or pending.

### Why It Sounds Plausible

- AI-assisted drafting is normal in this repository.
- Provenance blocks can make the work look audited.
- A release can feel complete because the document has a YAML declaration.

### Evidence Gap

- A provenance block is not the same as human review.
- `human_reviewed: pending` must not be silently interpreted as accepted.
- AI-generated docs cannot approve themselves.

### Memory Pollution Risk

If stored as trusted project memory, future agents may cite pending AI-generated material as if it were human-reviewed policy.

### Mercury Decision

`revise`

Keep the material visible, but mark review state honestly and record it in the review ledger.

### Rule Learned

Human review is an event, not a field name. Pending review must remain operationally different from approval.

## Case 009: Category Strategy From a Strong Narrative

```yaml
case_id: proof-pack-001-case-009
raw_ref: 06_action_plans/2026-05-05-V8.1-品类审计层-迭代备忘录.md
audit_ref: 07_audit_reports/2026-05-05-Meshy-BlackBox-PSP-V8.1-审计报告.md
routing_decision: revise
failure_modes:
  - category_choice_blind_spot
  - supply_side_bias
  - premature_positioning_memory
```

### Raw Output

The strategy memo treats a category framing as the next iteration direction after reviewing Meshy and AI game mechanics.

### Why It Sounds Plausible

- Category framing is useful when a project needs positioning.
- The prior analysis contained a rich market narrative.
- A memo can feel like a decision because it is written in action-plan form.

### Evidence Gap

- A category thesis needs external comparison and user response, not only internal narrative clarity.
- The memo may be strong as a hypothesis while still weak as durable positioning memory.
- The project needs proof cases, not only better framing.

### Memory Pollution Risk

Future agents could cite the category as settled and optimize documents around it before the project has enough external evidence.

### Mercury Decision

`revise`

Preserve the category as a hypothesis and bind it to future proof cases.

### Rule Learned

Positioning language should not become durable memory before it survives evidence from real cases.

## Case 010: Release Velocity Masquerading as Maturity

```yaml
case_id: proof-pack-001-case-010
raw_ref: CHANGELOG.md
audit_ref: docs/CYCLE-02-COMMITMENT.md
routing_decision: revise
failure_modes:
  - version_maturity_laundering
  - builder_loop
  - release_theater
```

### Raw Output

The changelog shows many releases in a short window, including v1.0.0 through v1.2.0 on 2026-05-09.

### Why It Sounds Plausible

- Frequent releases look like momentum.
- Version numbers create a sense of maturity.
- Each individual patch may be real and useful.

### Evidence Gap

- Version count does not prove external use.
- Feature labels can outrun proof cases.
- The repository still needs human review closure and real user records before it can claim stronger validation.

### Memory Pollution Risk

Future agents could treat `v1.x` as proof that the method is mature and start expanding new concepts instead of finishing proof cases and review loops.

### Mercury Decision

`revise`

Keep the releases, but constrain Cycle 02 to v1.2.x patch work and material evidence.

### Rule Learned

Release velocity is not method validation. A version number must not launder prototype evidence into maturity.

## Pack Maintenance Rules

- Prefer real artifacts over abstract examples.
- Do not invent missing `source_refs` or `audit_refs`.
- Do not define quantified success metrics for the pack.
- Preserve uncertainty even when a case is useful.
- Add or edit cases only when they strengthen a named failure mode.
- If a case has not been human-reviewed, mark it as pending or declined instead of implying approval.
