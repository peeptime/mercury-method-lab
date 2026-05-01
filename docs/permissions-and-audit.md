# Permissions And Audit

## Permission Model

| Role | Can Read | Can Write | Can Approve |
| --- | --- | --- | --- |
| `collector` | `00_raw/` | `00_raw/`, `01_segmented/` | No |
| `cleaner` | `00_raw/`, `01_segmented/` | `02_cleaned/`, `03_uncertain/` | No |
| `memory-curator` | `02_cleaned/`, `03_uncertain/` | `04_memory_candidates/` | No |
| `decision-owner` | All artifacts | `05_decision_logs/`, `06_action_plans/` | Decision logs |
| `auditor` | All artifacts | `07_audit_reports/` | Audit verdicts |
| `operator` | `10_exports/`, scripts | Runtime config outside the repo | No |

The same person or agent can temporarily play multiple roles during solo work, but the artifact must still mark which role produced which output.

## Secret Rules

- Never commit `ARK_API_KEY`.
- Never write API keys into `README.md`, decision logs, audit reports, templates, or exports.
- Runtime credentials belong in environment variables.
- `.env.example` may list variable names, but not real values.

## Audit Gates

Before a judgment becomes reusable, check:

1. Raw material exists.
2. Cleaned facts are separated from inference.
3. Uncertainty is either documented or explicitly marked as absent.
4. Memory candidates include source, confidence, risk, status, and review date.
5. A decision log explains the conclusion.
6. An audit report identifies failure modes and counter evidence.

## Review Cadence

- High-risk memory candidates: review within 7 days.
- Medium-risk memory candidates: review within 30 days.
- Low-risk memory candidates: review within 90 days.

Risk is high when a wrong conclusion can affect money, legal exposure, trust, safety, or irreversible work.

