# Mercury GUI lifecycle workbench rollout

## Artifact Metadata

- schema_version: 0.1
- type: action_plan
- status: draft
- owner_role: operator
- source_refs: dashboard/app.js
- decision_refs: 
- created_at: 2026-04-26
- review_at: 2026-04-27
- intent: immediate
- reminder_intensity: strict
- id: mercury-gui-lifecycle-workbench-rollout

## Goal

Turn the Mercury GUI from a read-only dashboard into an operational lifecycle workbench.

## Immediate Action

- Use the GUI to select artifacts, inspect metadata/content, update owner and review date, and advance lifecycle state.
- Keep every GUI mutation in `data/lifecycle-log.jsonl`.

## Today

- Ship artifact detail view.
- Ship lifecycle transition buttons.
- Ship create-artifact form backed by templates.
- Ship lifecycle log panel.
- Add lifecycle management documentation.

## Three Days

- Review whether evidence requirements should block transitions in the API.
- Add richer templates for decision logs, audit reports, and action plans.
- Decide whether lifecycle log entries should be periodically summarized into decision logs.

## Wait Conditions

- Do not expose the dashboard outside localhost without an explicit access-control pass.
- Do not replace Markdown/YAML as the source of truth until the file workflow is stable.

## Stop Conditions

- Stop a transition if required evidence is missing.
- Stop a GUI write if it would touch files outside managed artifact directories.

## Acceptance Criteria

- Artifact rows are selectable.
- Detail panel shows metadata, preview, history, and valid next states.
- Metadata saves write back to source files.
- New artifacts are created from templates.
- GUI changes append lifecycle events.

## Next Review

2026-04-27
