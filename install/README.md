# Install Mercury Method Lab

```yaml
provenance:
  authors: project_owner + Codex
  ai_assisted: true
  human_reviewed: pending
  audited_by: Mercury Lab self-audit
  audit_ref: docs/ITERATION-HANDOFF-1.0.0.md
```

Mercury Method Lab requires Node.js 20+, npm, and Git.

## macOS And Linux

```bash
./install/install.sh
```

## Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\install\install-windows.ps1
```

## Android / Termux

```bash
./install/install-termux.sh
```

## What The Install Scripts Do

- Check Node.js major version.
- Check npm and Git availability.
- Run `npm install`.
- Run `npm run doctor`.

They do not write secrets, start background services, or write to external runtime memory databases.

## After Install

```powershell
npm run release:gate
npm run dashboard
```

Open `http://127.0.0.1:4788`.

## Common Problems

| Problem | Fix |
|---|---|
| Node.js is missing | Install Node.js 20+ from the official installer or package manager. |
| PowerShell blocks scripts | Run with `-ExecutionPolicy Bypass` for this one script. |
| npm install fails on network | Retry on a stable network; no alternative package manager is required. |
| Dashboard port is busy | Stop the process using port `4788`, then run `npm run dashboard` again. |
