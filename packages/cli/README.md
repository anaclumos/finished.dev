# @finished/cli

[![npm version](https://img.shields.io/npm/v/@finished/cli.svg)](https://www.npmjs.com/package/@finished/cli)
[![license](https://img.shields.io/npm/l/@finished/cli.svg)](https://github.com/finished-dev/finished.dev/blob/main/LICENSE)

**Agent Fleet Management CLI** — Get phone push notifications the moment your agents, builds, or background tasks complete.

## Overview

`finished` is a lightweight CLI tool designed to notify you when long-running tasks finish. Whether you're training a model, running a complex build, or waiting for an AI agent to complete a task, `finished` sends a push notification directly to your phone (via the [finished.dev](https://finished.dev) web dashboard).

- **Zero dependencies**: Fast and lightweight.
- **Reliable**: Automatic retries with exponential backoff.
- **Integration-friendly**: Works with any shell script, CI/CD pipeline, or agent workflow.
- **Cross-platform**: Runs anywhere Bun or Node.js is available.

## Installation

```bash
# Global install using Bun (recommended)
bun install -g @finished/cli

# Global install using npm
npm install -g @finished/cli

# Or run directly without installing
bunx @finished/cli ping "Quick task done"
```

## Quick Start

1. **Sign Up**: Create an account at [finished.dev](https://finished.dev).
2. **Get API Key**: Navigate to **Settings > API Keys** and create a new key (starts with `fin_`).
3. **Initialize**: Run the setup command:
   ```bash
   finished init
   ```
4. **Send Notification**:
   ```bash
   finished ping "My first notification!"
   ```

## Commands

### `init`
Interactive setup to configure your API key and server URL.
```bash
finished init
```
*Stores configuration in `~/.finished/config.json`.*

### `ping <message>`
Send a task completion notification.
```bash
finished ping "Backup completed"
```

**Options:**
- `--status <success|failure|cancelled>`: Task outcome (default: `success`).
- `--source <name>`: Identify where the task came from (e.g., `claude`, `github-actions`).
- `--duration <ms>`: Include task duration in milliseconds.
- `--server <url>`: Override the default server URL.

**Example with options:**
```bash
finished ping "Build failed" --status failure --source "jenkins" --duration 45000
```

### `test`
Validate your API key and test the connection to the server.
```bash
finished test
```

### `status`
Show your current configuration, including the masked API key and Machine ID.
```bash
finished status
```

## Integration Examples

### After a Build
```bash
npm run build && finished ping "Build successful" --source "local-build"
```

### In a Python Script
```bash
python train_model.py && finished ping "Model training finished" --duration $SECONDS
```

### With AI Agents
Add this to your agent's system prompt or toolset:
```bash
claude "Analyze this log file" && finished ping "Claude analysis done" --source claude
```

### CI/CD Pipelines (GitHub Actions)
```yaml
- name: Notify on completion
  if: always()
  run: npx @finished/cli ping "Workflow ${{ job.status }}" --status ${{ job.status }}
  env:
    FINISHED_API_KEY: ${{ secrets.FINISHED_API_KEY }}
```
*(Note: Ensure you run `finished init` or have the config file present, or the CLI will support environment variables in future versions. For now, it relies on `~/.finished/config.json`).*

## Troubleshooting

### "Not configured. Run: finished init"
The CLI cannot find your configuration. Ensure you have run `finished init` and that `~/.finished/config.json` exists and is readable.

### Notifications not appearing
1. Run `finished test` to verify your API key and connection.
2. Check [finished.dev](https://finished.dev) to ensure your browser is registered for push notifications.
3. Ensure your API key is valid and has not been deleted.

### Connection Issues
If you are behind a corporate proxy, ensure the CLI can reach `https://finished.dev`. You can override the server URL using the `--server` flag if you are hosting a private instance.

## License

MIT © [finished.dev](https://finished.dev)
