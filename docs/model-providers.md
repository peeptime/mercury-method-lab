# Model Providers

## One Place To Switch Models

Model provider configuration lives in [../config/model-providers.json](../config/model-providers.json).

Scripts should read that file instead of hard-coding provider URLs and model names.

## Active Provider

The active provider is selected by:

```powershell
$env:MERCURY_MODEL_PROVIDER="ark-coding-plan"
```

If the variable is not set, Mercury uses the `active_provider` value from `config/model-providers.json`.

## Commands

```powershell
npm run test:llm
npm run start:llm
```

Legacy names remain available:

```powershell
npm run test:ark
npm run start:ark
```

## Key Policy

Configuration may expose the environment variable name, but never the key value.

Allowed:

```json
"api_key_env": "ARK_API_KEY"
```

Forbidden:

```json
"api_key": "real-key-value"
```

## Reserved Providers

| Provider | Purpose | Status |
| --- | --- | --- |
| `ark-coding-plan` | Current Ark OpenAI-compatible coding endpoint | active |
| `openai-compatible-custom` | Any future OpenAI-compatible hosted model | reserved |
| `local-openclaw` | Local OpenClaw-compatible endpoint | reserved |
