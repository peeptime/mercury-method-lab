# Execution Loop

## Closed Loop

Mercury should operate as a loop, not a folder dump:

```text
capture
  -> normalize
  -> validate
  -> reason
  -> decide
  -> act
  -> audit
  -> export
  -> review
```

## Loop Stages

| Stage | Main Artifact | Required Check |
| --- | --- | --- |
| capture | `00_raw/` | Source and capture time exist |
| normalize | `01_segmented/`, `02_cleaned/` | Fact and inference are separated |
| validate | schemas and scripts | Required fields and secret policy pass |
| reason | `08_skills/` | Skill role is explicit |
| decide | `05_decision_logs/` | Evidence and risk are recorded |
| act | `06_action_plans/` | Stop conditions and acceptance criteria exist |
| audit | `07_audit_reports/` | Counter evidence and failure mode exist |
| export | `10_exports/` | Output is stable and handoff-ready |
| review | state machine | Review date or supersession exists |

## Current Commands

```powershell
npm run doctor
npm run validate
npm run sync:skills
npm run test:llm
```

## Operating Rule

If an artifact cannot move forward, do not delete it. Move it to `rejected` or keep it in `03_uncertain/` with a reason.

