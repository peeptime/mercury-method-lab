# OpenClaw Integration

## Status

OpenClaw is reserved as a local model or local agent bridge. It is not active by default.

## Preparation

Mercury exposes enough structure for a local agent to understand and call it:

- Project map: [information-architecture-blueprint.md](information-architecture-blueprint.md)
- Execution loop: [execution-loop.md](execution-loop.md)
- Commands: [../package.json](../package.json)
- Model providers: [../config/model-providers.json](../config/model-providers.json)
- Permissions: [../config/permissions.json](../config/permissions.json)
- State machine: [../config/state-machine.json](../config/state-machine.json)

## Local Provider Slot

`local-openclaw` is reserved in `config/model-providers.json`.

Expected shape:

```json
{
  "base_url": "http://127.0.0.1:11434/v1",
  "chat_path": "/chat/completions",
  "api_key_env": "OPENCLAW_API_KEY",
  "model_env": "OPENCLAW_MODEL"
}
```

The URL and model are placeholders until the local OpenClaw runtime is confirmed.

## Activation

```powershell
$env:MERCURY_MODEL_PROVIDER="local-openclaw"
$env:OPENCLAW_BASE_URL="http://127.0.0.1:11434/v1"
$env:OPENCLAW_MODEL="your-local-model"
npm run test:llm
```

If the runtime does not require an API key, leave `OPENCLAW_API_KEY` empty.

