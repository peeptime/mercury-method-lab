# Pre-Ingestion Policy

## Purpose

Some documents have long-term value but should not immediately affect the reasoning chain. Mercury handles them through a pre-ingestion track.

## Two Tracks

| Track | Directory | Meaning |
| --- | --- | --- |
| Pre-ingestion | `00_inbox/` | Valuable but not yet absorbed |
| Active source | `00_raw/` | Accepted source material for analysis |

Do not force every uploaded document into active analysis. A file can stay in `00_inbox/` until a task, review, or search query makes it relevant.

## Statuses

| Status | Meaning |
| --- | --- |
| `staged` | File is present and registered |
| `deferred` | File is intentionally delayed |
| `indexed` | File has been added to the generated index |
| `draft` | File has entered the active artifact flow |
| `rejected` | File should not be used, but history is kept |

## Sovereignty

Markdown/YAML and original files remain the source of truth.

Generated database and JSON index files are operational views only. They may be rebuilt from the filesystem and manifests.

## Promotion Rule

Promote from `00_inbox/` to `00_raw/` only when:

- A concrete analysis task needs it.
- A human decides the source should influence judgment.
- A scheduled review marks it as active.
- A search result shows it is relevant to the current question.

## Recommended Workflow

1. Put files in `00_inbox/`.
2. Register them in `00_inbox/_manifest.yaml`.
3. Run `npm run index`.
4. Check the GUI review queue.
5. Extract or move only the needed files into `00_raw/`.

