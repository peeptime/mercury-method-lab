# OWASP AISVS C8 Mapping

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audit_ref: docs/SDK-API.md
```

This document maps Mercury Method Lab to OWASP AISVS C8, "Memory, Embeddings & Vector Database Security."

Mercury is not a compliance product and does not certify AISVS conformance. This mapping is a blueprint for implementers who want a pre-storage audit gate before agent memory, embeddings, or vector-store ingestion.

## Reference Sources

- [OWASP AISVS public docs](https://owasp.org/www-project-artificial-intelligence-security-verification-standard-aisvs-docs/)
- [OWASP AISVS C8 source chapter](https://github.com/OWASP/AISVS/blob/main/1.0/en/0x10-C08-Memory-Embeddings-and-Vector-Database.md)
- [A-MAC: Adaptive Memory Admission Control for LLM Agents](https://arxiv.org/abs/2603.04549)
- [Selective Memory for Artificial Intelligence](https://arxiv.org/abs/2603.15994)
- [MemSAD: memory poisoning in retrieval-augmented agents](https://arxiv.org/abs/2605.03482)

## Control Fit

| AISVS C8 area | Mercury support | Current gap |
|---|---|---|
| C8.1 memory metadata and access controls | Mercury requires `source_refs`, `audit_refs`, provenance, and immutable review fields in artifacts. | Mercury does not enforce tenant/user access controls. Host systems must do that. |
| C8.2 pre-vectorization validation | Mercury treats memory candidates as untrusted and routes them before durable storage. | Sensitive-data detection, malware scanning, and embedding-cluster outlier detection are host controls. |
| C8.2 agent output write-back validation | Mercury's SDK hook blocks automatic promotion of agent outputs without source/audit evidence. | Host systems must attach the hook to their actual write path. |
| C8.2 contradiction checks | Mercury has `conflicting_evidence` and `conflicting_evidence` blockers when evidence conflict is visible. | Full graph-level contradiction detection is not implemented. |
| C8.3 quarantine and reset path | Mercury routes unsafe content to `quarantine` or `discard` and keeps captures as evidence. | Actual vector exclusion and purge propagation belong to the host memory store. |
| C8.5 scope enforcement | Mercury can record scope and boundary clarity. | Runtime retrieval scope checks must be enforced by the host vector engine. |

## Minimum Integration Pattern

```text
candidate memory
  -> Mercury audit SDK
  -> routing_decision
  -> host policy
  -> accepted store OR revision queue OR quarantine OR discard log
```

The important constraint is placement: Mercury belongs before a host writes to long-term memory, not after a polluted vector store already exists.

## Mercury Fields That Help C8

| Mercury field | C8 relevance |
|---|---|
| `source_refs` | Write-time source tagging and origin checks. |
| `audit_refs` | Evidence that content was checked before durable use. |
| `routing_decision` | Admission decision, not only a trust score. |
| `blockers` / `failure_modes` | Human-readable reason for rejection or quarantine. |
| `human_review_required` | Escalation for high-risk memory and customer delivery material. |
| `provenance` | Review state and production lineage. |
| `routing_target` | Host can map route to accepted store, revision queue, quarantine, or discard log. |

## Non-Claims

- Mercury does not replace OWASP AISVS.
- Mercury does not implement authorization, encryption, tenant isolation, or vector database hardening.
- Mercury does not prove that a stored fact is true.
- Mercury does not certify a system as compliant.

Its narrower contribution is a structured admission decision for AI-generated material before durable memory write.
