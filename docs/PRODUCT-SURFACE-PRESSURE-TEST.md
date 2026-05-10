# Product Surface Pressure Test

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: declined
  reviewer: project_owner_pending
  audited_by: Mercury Lab self-audit
  audit_ref: user engineering stress-test brief 2026-05-10
```

Version `1.3.0` is a product-surface unfreeze.

It does not replace the Cycle 02 method-layer commitment. It creates a separate engineering axis: make Mercury usable by a person who has not read the README.

## Scope

| Area | v1.3.0 Status |
|---|---|
| Settings Panel | Shipped as a 7-category dashboard modal backed by `config/preferences.json`. |
| Icons | Shipped as a small inline Lucide-style SVG registry in `dashboard/product-layer.js`. |
| Button microcopy | Main product-layer actions now use short labels plus tooltips. |
| First-run onboarding | Shipped: provider, doctor, proof-case walkthrough. |
| Notifications | Shipped: in-app toast plus Web Notification permission path and command triggers. |
| Error UI | Shipped: global fetch failure toast and persistent reconnect banner. |
| Lite Mode | Shipped: `dashboard/lite.html`, single-file offline audit path, copy-as-Markdown. |
| Preferences | Shipped: `/api/preferences` GET/PATCH with persisted JSON. |
| Update / diagnostics | Shipped: `/api/update-check` and `/api/diagnostics`. |

## Product Rules

- Lite Mode must work from `file://` without network.
- Full Dashboard may use the Node backend, but should still show recoverable errors.
- Product UI must not mark human review as complete.
- Product UI must not bypass Mercury routing; Lite output keeps `human_reviewed: declined`.
- Settings are user preferences, not project memory.

## Acceptance Commands

```powershell
npm run dashboard:check
npm run doctor
npm run release:gate
```

## Known Boundaries

- Command execution still uses request/response, not SSE streaming.
- Native PDF export is represented in preferences but not yet implemented as a renderer.
- System notifications depend on browser permission and focus state.
- The existing dashboard remains no-framework static HTML/CSS/JS.
