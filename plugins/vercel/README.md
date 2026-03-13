# Vercel

OpenTabs plugin for Vercel — gives AI agents access to Vercel through your authenticated browser session.

## Install

```bash
opentabs plugin install vercel
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-vercel
```

## Setup

1. Open [vercel.com](https://vercel.com/dashboard) in Chrome and log in
2. Open the OpenTabs side panel — the Vercel plugin should appear as **ready**

## Tools (8)

### Projects (2)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List all Vercel projects | Read |
| `get_project` | Get project details | Read |

### Deployments (2)

| Tool | Description | Type |
|---|---|---|
| `list_deployments` | List Vercel deployments | Read |
| `get_deployment` | Get deployment details | Read |

### Domains (1)

| Tool | Description | Type |
|---|---|---|
| `list_domains` | List project domains | Read |

### Environment (1)

| Tool | Description | Type |
|---|---|---|
| `list_env_vars` | List project environment variables | Read |

### Account (2)

| Tool | Description | Type |
|---|---|---|
| `get_user` | Get current user profile | Read |
| `list_teams` | List Vercel teams | Read |

## How It Works

This plugin runs inside your Vercel tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
