const requiredFields = [
  "id",
  "title",
  "type",
  "claim",
  "source_refs",
  "audit_refs",
  "context",
  "risk_level"
];

const allowedRiskLevels = new Set(["low", "medium", "high"]);
const allowedExpectedDecisions = new Set(["accept", "revise", "quarantine", "discard"]);

export function validatePacketShape(packet) {
  const errors = [];
  const warnings = [];

  for (const field of requiredFields) {
    if (isEmpty(packet[field])) {
      errors.push({
        field,
        message: `Missing required field: ${field}`
      });
    }
  }

  for (const field of ["source_refs", "audit_refs", "expected_blockers"]) {
    if (packet[field] !== undefined && !Array.isArray(packet[field])) {
      errors.push({
        field,
        message: `${field} must be a list`
      });
    }
  }

  if (packet.risk_level && !allowedRiskLevels.has(String(packet.risk_level))) {
    errors.push({
      field: "risk_level",
      message: "risk_level must be low, medium, or high"
    });
  }

  if (packet.expected_decision && !allowedExpectedDecisions.has(String(packet.expected_decision))) {
    warnings.push({
      field: "expected_decision",
      message: `Unknown expected_decision: ${packet.expected_decision}`
    });
  }

  if (packet.context !== undefined && (typeof packet.context !== "object" || Array.isArray(packet.context))) {
    errors.push({
      field: "context",
      message: "context must be a mapping"
    });
  }

  return { errors, warnings };
}

function isEmpty(value) {
  return value === undefined
    || value === null
    || value === "";
}
