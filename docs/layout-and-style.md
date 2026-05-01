# Layout And Style

## Directory Layout

| Directory | Purpose |
| --- | --- |
| `00_raw/` | Original source material. Do not edit after capture. |
| `01_segmented/` | Split raw material into smaller units. |
| `02_cleaned/` | Separate facts from inference and noise. |
| `03_uncertain/` | Preserve unclear, contradictory, or suspicious signals. |
| `04_memory_candidates/` | Candidate knowledge for future reuse. |
| `05_decision_logs/` | Why a judgment was made. |
| `06_action_plans/` | What should be done next. |
| `07_audit_reports/` | Independent challenge and risk review. |
| `08_skills/` | Repository source of Mercury skills. |
| `09_templates/` | Human-facing templates. |
| `10_exports/` | Stable handoff outputs. |
| `docs/` | Architecture, governance, permissions, and operating rules. |
| `schemas/` | Machine-readable artifact rules. |
| `scripts/` | Local automation and validation. |

## Naming

- Use lowercase kebab-case for new machine-facing files.
- Use date prefix `YYYY-MM-DD-` for decision logs, audit reports, and exports.
- Keep one event or decision per artifact unless the file is explicitly an index.

## Writing Style

- Write conclusions first, then evidence.
- Separate fact, inference, risk, and action.
- Prefer short sections with stable headings.
- Record uncertainty instead of smoothing it away.
- Avoid storing secrets, tokens, private keys, or credentials in markdown or yaml.

## Visual Layout For Documents

- Keep top-level heading as the artifact title.
- Use tables for field comparisons and role boundaries.
- Use plain lists for action items and risks.
- Use fenced code blocks for commands and state flows.

