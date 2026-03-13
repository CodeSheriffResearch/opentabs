# Asana

OpenTabs plugin for Asana — gives AI agents access to Asana through your authenticated browser session.

## Install

```bash
opentabs plugin install asana
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-asana
```

## Setup

1. Open [app.asana.com](https://asana.com) in Chrome and log in
2. Open the OpenTabs side panel — the Asana plugin should appear as **ready**

## Tools (24)

### Tasks (9)

| Tool | Description | Type |
|---|---|---|
| `get_task` | Get details of a specific task | Read |
| `create_task` | Create a new task | Write |
| `update_task` | Update an existing task | Write |
| `delete_task` | Delete a task permanently | Write |
| `search_tasks` | Search tasks in a workspace | Read |
| `get_tasks_for_project` | List tasks in a project | Read |
| `get_tasks_for_section` | List tasks in a section | Read |
| `get_subtasks` | List subtasks of a task | Read |
| `add_followers` | Add followers to a task | Write |

### Projects (4)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List projects in a workspace | Read |
| `get_project` | Get details of a specific project | Read |
| `create_project` | Create a new project in a workspace | Write |
| `update_project` | Update an existing project | Write |

### Sections (3)

| Tool | Description | Type |
|---|---|---|
| `list_sections` | List sections in a project | Read |
| `create_section` | Create a new section in a project | Write |
| `add_task_to_section` | Move a task into a section | Write |

### Stories (2)

| Tool | Description | Type |
|---|---|---|
| `get_stories_for_task` | List stories on a task | Read |
| `create_story` | Add a comment to a task | Write |

### Users (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the current user profile | Read |
| `get_user` | Get a user by GID | Read |
| `list_users_for_workspace` | List users in a workspace | Read |

### Workspaces (1)

| Tool | Description | Type |
|---|---|---|
| `list_workspaces` | List all workspaces | Read |

### Tags (1)

| Tool | Description | Type |
|---|---|---|
| `list_tags` | List tags in a workspace | Read |

### Teams (1)

| Tool | Description | Type |
|---|---|---|
| `list_teams` | List teams in a workspace | Read |

## How It Works

This plugin runs inside your Asana tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
