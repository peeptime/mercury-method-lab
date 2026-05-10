# Related Work

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/ROUTING-THEORY.md
```

Mercury Method Lab should not behave as if it invented verification, provenance, or data governance. Its contribution is narrower:

> Decide whether an AI-generated claim deserves durable memory, project policy, or delivery status after it has already been produced.

This document maps Mercury against adjacent work so future agents do not rebuild the world from scratch.

## Positioning Map

| Field | What It Usually Solves | What Mercury Borrows | What Mercury Adds |
|---|---|---|---|
| Hallucination detection | Detect whether model output is factually inconsistent or likely fabricated. | Treat model confidence as insufficient evidence. | Routes outputs before they become memory; includes provenance, review, and long-term pollution risk. |
| Fact verification | Extract claims and verify them against evidence. | Requires inspectable evidence and source claims. | Decides retention route, not only factual verdict. |
| AI safety / risk management | Reduce harms from AI systems and manage organizational risk. | Uses risk framing and governance discipline. | Focuses on memory ingestion and future-agent contamination. |
| Data quality / data governance | Manage data completeness, accuracy, lineage, and fitness. | Uses quality dimensions and lineage thinking. | Applies them to AI-generated claims and project memory. |
| Provenance / lineage | Record how information was produced and transformed. | Requires source, author, and review metadata. | Adds routing decisions and refusal points before durable use. |

## Hallucination Detection

Hallucination detection work usually asks whether a generated statement is factual or internally consistent. For example, SelfCheckGPT uses sampled model responses to look for consistency in a black-box setting, while TruthfulQA measures whether models reproduce common falsehoods.

Mercury overlaps with this work when it flags unsupported claims, circular reasoning, and speculation-as-fact. The difference is that Mercury can quarantine a true-but-unsafe claim if it lacks audit closure or would pollute future memory. Hallucination detection answers "is this likely false?" Mercury asks "should this be retained, revised, isolated, or discarded?"

References:

- [SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models](https://huggingface.co/papers/2303.08896)
- [TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://aclanthology.org/2022.acl-long.229/)

## Fact Verification And Claim Detection

Fact verification systems such as FEVER formalize claim extraction and verification against textual evidence. ClaimBuster focuses on detecting check-worthy factual claims.

Mercury should reuse the discipline of claim extraction: every Audit Packet needs a candidate claim, source refs, and audit refs. But Mercury's output is not only a true/false/support/refute verdict. It is a routing decision with memory consequences. A claim can be true but still require `revise` because it lacks a boundary, or `quarantine` because it affects customer delivery.

References:

- [FEVER resources](https://fever.ai/resources.html)
- [Toward Automated Fact-Checking: Detecting Check-worthy Factual Claims by ClaimBuster](https://www.kdd.org/kdd2017/papers/view/toward-automated-fact-checking-detecting-check-worthy-factual-claims-by-cla)

## AI Risk Management

AI risk management frameworks organize risks, controls, and governance practices for AI systems. NIST AI RMF 1.0 is the closest broad reference point in this set.

Mercury is much narrower. It is not a full AI risk management framework and should not present itself that way. Its useful role is a small control: before AI-generated material enters long-term memory or delivery artifacts, check evidence lineage, review closure, pollution risk, and boundary clarity.

Reference:

- [NIST AI Risk Management Framework 1.0](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10)

## Data Quality And Governance

Data quality work gives Mercury vocabulary for quality dimensions, categories, and metrics. W3C's Data Quality Vocabulary explicitly models quality dimensions, categories, and metrics without requiring one fixed list for all domains.

Mercury should follow that posture. Its failure-mode taxonomy is a domain-specific quality vocabulary for AI memory ingestion. It should not claim universal completeness; it should document categories, dimensions, and known gaps.

Reference:

- [W3C Data Quality Vocabulary](https://www.w3.org/TR/vocab-dqv/)

## Provenance And Lineage

W3C PROV provides a mature model for representing entities, activities, agents, and derivation. Mercury's provenance block is intentionally simpler, but it should remain compatible in spirit: record who/what produced an artifact, how it was reviewed, and what evidence it derives from.

Mercury adds a decision layer that PROV does not try to provide: after lineage is recorded, decide whether the claim may enter durable memory.

Reference:

- [PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/)

## Non-Goals

- Mercury is not a replacement for fact verification datasets.
- Mercury is not a hallucination detector benchmark.
- Mercury is not a full AI safety framework.
- Mercury is not a general data governance standard.
- Mercury is not a provenance ontology.

It is a small audit method for one narrow control point: AI-generated material trying to become durable memory, project decision, or delivery artifact.

## Research Gaps

The project still lacks:

- inter-rater reliability tests
- external auditor disagreement records
- cases outside text-heavy project artifacts
- a larger proof pack with code, chart, data, customer, and multi-agent examples
- explicit mapping from failure modes to existing data-quality dimensions

These gaps should guide Cycle 04 and later work more than new UI features.
