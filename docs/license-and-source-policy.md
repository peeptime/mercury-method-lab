# License And Source Policy

## Purpose

Keep the project publishable by separating original work, open-source dependencies, public knowledge, and third-party text.

## Source Classes

| Class | Use | Requirement |
| --- | --- | --- |
| Original project text | Core docs, skills, templates | Keep authorship clear |
| MIT dependencies | Runtime inspiration and integration | Preserve license notices when copying code |
| Public knowledge | Concepts and general methods | Rewrite in project language |
| Third-party prompt/skill packs | Study only unless licensed | Do not copy text, atoms, naming, or structure |
| Private notes | Internal strategy | Do not publish unless sanitized |

## dbskill Policy

dbskill is treated as a third-party non-commercial skill pack. It may inform gap analysis, but it must not be imported.

Allowed:

- identify that creator/commercial diagnosis is a missing capability
- study how skill packaging creates adoption speed
- compare against public business/content concepts

Forbidden:

- copy `SKILL.md` content
- copy atoms or knowledge packages
- copy names, output templates, or examples
- present a derivative as original
- use it as a commercial dependency without authorization

## Upstream Mercury Agent Policy

Upstream Mercury Agent is MIT licensed and can be integrated more freely, but the preferred relationship is still adapter-based.

Allowed:

- document compatibility
- call CLI commands
- sync skills into upstream runtime paths
- export migration bundles

Avoid:

- vendoring upstream source without reason
- depending on undocumented internals
- claiming this project is the upstream runtime

