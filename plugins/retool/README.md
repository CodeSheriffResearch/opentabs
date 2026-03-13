# Retool

OpenTabs plugin for Retool — gives AI agents access to Retool through your authenticated browser session.

## Install

```bash
opentabs plugin install retool
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-retool
```

## Setup

1. Open [retool.com](https://retool.com) in Chrome and log in
2. Open the OpenTabs side panel — the Retool plugin should appear as **ready**

## Tools (21)

### Users (2)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated user profile | Read |
| `change_user_name` | Change the current user name | Write |

### Organization (3)

| Tool | Description | Type |
|---|---|---|
| `get_organization` | Get the current organization details | Read |
| `list_user_spaces` | List accessible user spaces | Read |
| `list_experiments` | List active feature experiments | Read |

### Apps (6)

| Tool | Description | Type |
|---|---|---|
| `list_apps` | List all Retool apps and folders | Read |
| `create_app` | Create a new Retool web app | Write |
| `clone_app` | Clone an existing app | Write |
| `create_folder` | Create a new app or workflow folder | Write |
| `rename_folder` | Rename an app or workflow folder | Write |
| `delete_folder` | Delete an empty folder | Write |

### Resources (4)

| Tool | Description | Type |
|---|---|---|
| `list_resources` | List all configured data resources | Read |
| `create_resource_folder` | Create a new resource folder | Write |
| `delete_resource_folder` | Delete a resource folder | Write |
| `move_resource_to_folder` | Move a resource to a folder | Write |

### Workflows (1)

| Tool | Description | Type |
|---|---|---|
| `list_workflows` | List all workflows and workflow folders | Read |

### Environments (1)

| Tool | Description | Type |
|---|---|---|
| `list_environments` | List all deployment environments | Read |

### Source Control (2)

| Tool | Description | Type |
|---|---|---|
| `list_branches` | List source control branches | Read |
| `get_source_control_settings` | Get source control configuration | Read |

### Playground (1)

| Tool | Description | Type |
|---|---|---|
| `list_playground_queries` | List saved playground queries | Read |

### Agents (1)

| Tool | Description | Type |
|---|---|---|
| `list_agents` | List all Retool AI agents | Read |

## How It Works

This plugin runs inside your Retool tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
