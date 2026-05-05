#!/usr/bin/env bash
set -euo pipefail

if command -v pkg >/dev/null 2>&1; then
  pkg install -y nodejs git
fi

cd "$(dirname "$0")/.."

node_major="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$node_major" -lt 20 ]; then
  echo "Node.js 20+ is required. Current: $(node --version)" >&2
  exit 1
fi

npm install
npm run doctor

echo "Mercury Method Lab Termux install complete."
