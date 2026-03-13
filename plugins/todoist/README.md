# Todoist

OpenTabs plugin for Todoist — gives AI agents access to Todoist through your authenticated browser session.

## Install

```bash
opentabs plugin install todoist
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-todoist
```

## Setup

1. Open [app.todoist.com](https://app.todoist.com) in Chrome and log in
2. Open the OpenTabs side panel — the Todoist plugin should appear as **ready**

## Tools (33)

### Projects (8)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List all projects | Read |
| `get_project` | Get a project by ID | Read |
| `create_project` | Create a new project | Write |
| `update_project` | Update a project | Write |
| `delete_project` | Delete a project | Write |
| `archive_project` | Archive a project | Write |
| `unarchive_project` | Unarchive a project | Write |
| `list_collaborators` | List project collaborators | Read |

### Tasks (7)

| Tool | Description | Type |
|---|---|---|
| `list_tasks` | List tasks with optional filters | Read |
| `get_task` | Get a task by ID | Read |
| `create_task` | Create a new task | Write |
| `update_task` | Update an existing task | Write |
| `close_task` | Complete a task | Write |
| `reopen_task` | Reopen a completed task | Write |
| `delete_task` | Delete a task permanently | Write |

### Sections (5)

| Tool | Description | Type |
|---|---|---|
| `list_sections` | List sections | Read |
| `get_section` | Get a section by ID | Read |
| `create_section` | Create a section | Write |
| `update_section` | Update a section | Write |
| `delete_section` | Delete a section | Write |

### Comments (5)

| Tool | Description | Type |
|---|---|---|
| `list_comments` | List comments on a task or project | Read |
| `get_comment` | Get a comment by ID | Read |
| `create_comment` | Add a comment to a task or project | Write |
| `update_comment` | Update a comment | Write |
| `delete_comment` | Delete a comment | Write |

### Labels (8)

| Tool | Description | Type |
|---|---|---|
| `list_labels` | List all labels | Read |
| `get_label` | Get a label by ID | Read |
| `create_label` | Create a new label | Write |
| `update_label` | Update a label | Write |
| `delete_label` | Delete a label | Write |
| `list_shared_labels` | List shared label names | Read |
| `rename_shared_label` | Rename a shared label | Write |
| `remove_shared_label` | Remove a shared label | Write |

## How It Works

This plugin runs inside your Todoist tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
