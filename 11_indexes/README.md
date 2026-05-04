# 11_indexes

Generated indexes live here.

These files are not the source of truth. They are rebuilt from Markdown, YAML, manifests, and filesystem metadata so the dashboard can search and summarize without hiding the real documents in a database.

## Outputs

- `source-index.json`: portable JSON file-level artifact index.
- `sample-index.json`: portable JSON sample-level index for grading, project binding, reuse, and feedback gaps.
- `mercury-index.sqlite`: optional local SQLite index when Node's SQLite module is available.

Run `npm run index` to rebuild generated views.

`sample-index.json` is also the source for pre-ingestion memory exports. `npm run export:memory` reads this index only; it does not scan artifact bodies or write to runtime memory databases.
