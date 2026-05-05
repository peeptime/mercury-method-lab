#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need_cmd node
need_cmd npm
need_cmd git

node_major="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$node_major" -lt 20 ]; then
  echo "Node.js 20+ is required. Current: $(node --version)" >&2
  exit 1
fi

npm install
npm run doctor

echo "Mercury Method Lab install complete."
