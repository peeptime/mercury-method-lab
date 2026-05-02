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

## API Key Aliases

Hosted providers can define `api_key_env_aliases`. Mercury checks the primary env name first, then aliases.

Common accepted aliases:

| Purpose | Env names |
| --- | --- |
| Ark Coding Plan | `ARK_API_KEY`, `MERCURY_API_KEY` |
| OpenAI hosted | `OPENAI_API_KEY`, `MERCURY_OPENAI_API_KEY`, `MERCURY_API_KEY` |
| Generic OpenAI-compatible | `MERCURY_OPENAI_API_KEY`, `OPENAI_API_KEY`, `MERCURY_API_KEY` |

Local OpenAI-compatible providers set `api_key_required: false`. They may still send a key if the local server requires one.

## Reserved Providers

| Provider | Purpose | Status |
| --- | --- | --- |
| `ark-coding-plan` | Current Ark OpenAI-compatible coding endpoint | active |
| `openai` | Hosted OpenAI API | reserved |
| `openai-compatible-custom` | Any future OpenAI-compatible hosted model | reserved |
| `local-openclaw` | Local OpenClaw-compatible endpoint | reserved |
| `ollama-local` | Local Ollama OpenAI-compatible endpoint | reserved |
| `vllm-local` | Local vLLM OpenAI-compatible endpoint | reserved |
| `lm-studio-local` | Local LM Studio OpenAI-compatible endpoint | reserved |

## Local Runtime Examples

Use a local runtime by switching providers:

```powershell
$env:MERCURY_MODEL_PROVIDER="ollama-local"
$env:OLLAMA_MODEL="qwen2.5:7b"
npm run test:llm
```

Other local slots:

```powershell
$env:MERCURY_MODEL_PROVIDER="vllm-local"
$env:VLLM_MODEL="local-model"
```

```powershell
$env:MERCURY_MODEL_PROVIDER="lm-studio-local"
$env:LM_STUDIO_MODEL="local-model"
```
