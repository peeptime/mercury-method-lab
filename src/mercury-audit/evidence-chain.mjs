import { classifySourceRef } from "./source-credibility.mjs";
import { annotateChoicesWithAdmissionPolicy } from "./admission-contract.mjs";

const sourceCredibilityCache = new Map();

const gapChoiceCatalog = {
  missing_source_refs: {
    gap: "The claim has no inspectable source reference.",
    choices: [
      { id: "A", label: "Add direct source", action: "Attach a direct user statement, transcript, field note, commit, or official source." },
      { id: "B", label: "Downgrade to inference", action: "Mark the claim as AI-assisted inference and keep it out of durable memory." },
      { id: "C", label: "Quarantine", action: "Keep the material as source evidence only until a source is added." }
    ]
  },
  missing_audit_refs: {
    gap: "The claim has no audit or review reference.",
    choices: [
      { id: "A", label: "Add review note", action: "Attach a named review note, checklist result, or audit report." },
      { id: "B", label: "Request reviewer", action: "Assign a reviewer before promotion." },
      { id: "C", label: "Keep declined", action: "Leave human_reviewed as declined and do not promote." }
    ]
  },
  overgeneralization: {
    gap: "The claim uses broad language beyond the observed evidence.",
    choices: [
      { id: "A", label: "Narrow scope", action: "Rewrite the claim to the exact observed context." },
      { id: "B", label: "Add stronger evidence", action: "Provide repeated direct evidence before retaining the broader claim." },
      { id: "C", label: "Reject broad memory", action: "Discard the durable-memory candidate and keep only the raw source." }
    ]
  },
  unsafe_memory_write: {
    gap: "The claim affects durable memory and needs a stricter admission path.",
    choices: [
      { id: "A", label: "Require human gate", action: "Keep human_review_required true and record a named review." },
      { id: "B", label: "Store as temporary note", action: "Use short-lived context instead of long-term memory." },
      { id: "C", label: "Discard memory write", action: "Do not write this claim to a memory store." }
    ]
  },
  circular_reasoning: {
    gap: "The evidence appears to rely on the AI output itself.",
    choices: [
      { id: "A", label: "Find independent evidence", action: "Use an external source that is not derived from the same AI output." },
      { id: "B", label: "Split hypothesis", action: "Keep the statement as a hypothesis, not as a fact." },
      { id: "C", label: "Discard", action: "Reject the claim when no independent support exists." }
    ]
  }
};

export function buildEvidenceChain(input, context = {}) {
  const result = isAuditResult(input) ? input : createDraftResult(input, context);
  const packet = result.packet || {};
  const sourceRefs = normalizeList(packet.source_refs || context.source_refs || context.sourceRefs);
  const auditRefs = normalizeList(packet.audit_refs || context.audit_refs || context.auditRefs);
  const failureModes = normalizeList(result.failure_modes || result.blockers?.map((blocker) => blocker.id));
  const warnings = normalizeList(result.warnings);
  const requiredEvidence = normalizeList(result.required_evidence);
  const requiredFixes = normalizeList(result.required_fixes);

  const missingEvidence = buildMissingEvidence({
    failureModes,
    warnings,
    requiredEvidence,
    requiredFixes
  });

  return {
    chain_version: "2026.05.10.alpha3",
    packet_id: packet.id || context.id || "evidence_chain_candidate",
    routing_decision: result.routing_decision || result.decision || "revise",
    core_claim: result.content_summary?.core_claim || packet.claim || String(input || "").trim(),
    attribution: result.content_summary?.attribution || attributionFor(sourceRefs),
    confidence: result.content_summary?.confidence || confidenceFor(result),
    confidence_basis: result.content_summary?.confidence_basis || "Derived from Mercury structural audit.",
    evidence_nodes: sourceRefs.map((ref) => ({
      ref,
      role: "source",
      credibility: cachedSourceCredibility(ref)
    })),
    audit_nodes: auditRefs.map((ref) => ({
      ref,
      role: "audit_ref"
    })),
    missing_evidence: missingEvidence,
    suggested_choices: annotateChoicesWithAdmissionPolicy(buildChoices(missingEvidence)),
    review_record_template: reviewRecordTemplate(result, missingEvidence),
    provenance: {
      ai_assisted: true,
      human_reviewed: "declined",
      reviewer: context.reviewer || result.provenance?.reviewer || "project_owner_pending",
      generated_by: "mercury-evidence-chain",
      audit_ref: "src/mercury-audit/evidence-chain.mjs"
    }
  };
}

export function buildMissingEvidence({ failureModes = [], warnings = [], requiredEvidence = [], requiredFixes = [] } = {}) {
  const gaps = [];
  for (const mode of failureModes) {
    if (gapChoiceCatalog[mode]) {
      gaps.push({
        id: mode,
        severity: mode === "circular_reasoning" ? "high" : "medium",
        description: gapChoiceCatalog[mode].gap
      });
    }
  }

  for (const item of requiredEvidence) {
    gaps.push({
      id: `required_evidence:${slug(item)}`,
      severity: "medium",
      description: item
    });
  }

  for (const warning of warnings.filter((item) => String(item).includes("source"))) {
    gaps.push({
      id: `warning:${slug(warning)}`,
      severity: "low",
      description: warning
    });
  }

  if (!gaps.length && requiredFixes.length) {
    gaps.push({
      id: "required_fixes",
      severity: "low",
      description: requiredFixes.join("; ")
    });
  }

  if (!gaps.length) {
    gaps.push({
      id: "human_review",
      severity: "low",
      description: "No structural gap detected; named human review may still be needed before durable use."
    });
  }

  return dedupeById(gaps);
}

function buildChoices(gaps) {
  return gaps.map((gap) => {
    const catalog = gapChoiceCatalog[gap.id];
    return {
      gap_id: gap.id,
      prompt: promptFor(gap),
      recommended: "A",
      options: catalog?.choices || [
        { id: "A", label: "Add evidence", action: "Attach the missing evidence and rerun the audit." },
        { id: "B", label: "Keep as draft", action: "Do not promote; keep as source material only." },
        { id: "C", label: "Decline", action: "Record the claim as declined for durable memory." }
      ]
    };
  });
}

function reviewRecordTemplate(result, gaps) {
  return {
    packet_id: result.packet?.id || "evidence_chain_candidate",
    routing_decision: result.routing_decision,
    human_reviewed: "declined",
    reviewer: "project_owner_pending",
    unresolved_gaps: gaps.map((gap) => gap.id),
    next_action: "Choose A/B/C for each gap, attach evidence if available, then rerun Mercury before promotion."
  };
}

function promptFor(gap) {
  return `How should Mercury handle this evidence gap: ${gap.description}`;
}

function attributionFor(sourceRefs) {
  return sourceRefs.length
    ? `Claim is linked to source_refs: ${sourceRefs.join(", ")}.`
    : "No source_refs are attached yet.";
}

function confidenceFor(result) {
  if (result.routing_decision === "accept") return "high";
  if (result.routing_decision === "revise") return "medium";
  return "low";
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)].filter(Boolean);
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function isAuditResult(value) {
  return Boolean(value && typeof value === "object" && (value.routing_decision || value.decision) && value.packet);
}

function createDraftResult(input, context = {}) {
  const claim = typeof input === "object" && input?.claim ? input.claim : String(input || "").trim();
  const packet = typeof input === "object" && input?.claim ? input : {
    id: context.id || "evidence_chain_candidate",
    claim,
    source_refs: normalizeList(context.source_refs || context.sourceRefs),
    audit_refs: normalizeList(context.audit_refs || context.auditRefs)
  };
  const missingSources = !normalizeList(packet.source_refs).length;
  const missingAudit = !normalizeList(packet.audit_refs).length;
  const failureModes = [
    missingSources ? "missing_source_refs" : "",
    missingAudit ? "missing_audit_refs" : ""
  ].filter(Boolean);
  return {
    packet,
    routing_decision: failureModes.length ? "quarantine" : "revise",
    failure_modes: failureModes,
    warnings: [],
    required_evidence: [],
    required_fixes: failureModes.map((mode) => `Resolve ${mode}.`),
    provenance: {
      reviewer: context.reviewer || "project_owner_pending"
    },
    content_summary: {
      core_claim: claim,
      attribution: attributionFor(packet.source_refs),
      confidence: failureModes.length ? "low" : "medium",
      confidence_basis: "Draft evidence chain before full Mercury audit."
    }
  };
}

function slug(value) {
  return String(value || "gap")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function cachedSourceCredibility(ref) {
  if (sourceCredibilityCache.has(ref)) {
    return sourceCredibilityCache.get(ref);
  }

  const value = classifySourceRef(ref);
  if (sourceCredibilityCache.size > 512) {
    sourceCredibilityCache.clear();
  }
  sourceCredibilityCache.set(ref, value);
  return value;
}
