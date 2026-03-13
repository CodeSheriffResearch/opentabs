# Bitbucket

OpenTabs plugin for Bitbucket — gives AI agents access to Bitbucket through your authenticated browser session.

## Install

```bash
opentabs plugin install bitbucket
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-bitbucket
```

## Setup

1. Open [bitbucket.org](https://bitbucket.org) in Chrome and log in
2. Open the OpenTabs side panel — the Bitbucket plugin should appear as **ready**

## Tools (27)

### Repositories (3)

| Tool | Description | Type |
|---|---|---|
| `list_repositories` | List repositories in a workspace | Read |
| `get_repository` | Get repository details | Read |
| `create_repository` | Create a new repository | Write |

### Pull Requests (10)

| Tool | Description | Type |
|---|---|---|
| `list_pull_requests` | List pull requests for a repository | Read |
| `get_pull_request` | Get pull request details | Read |
| `create_pull_request` | Create a new pull request | Write |
| `update_pull_request` | Update a pull request | Write |
| `merge_pull_request` | Merge a pull request | Write |
| `decline_pull_request` | Decline a pull request | Write |
| `approve_pull_request` | Approve a pull request | Write |
| `list_pr_comments` | List pull request comments | Read |
| `create_pr_comment` | Add a comment to a pull request | Write |
| `get_pull_request_diff` | Get pull request diff | Read |

### Branches & Tags (4)

| Tool | Description | Type |
|---|---|---|
| `list_branches` | List repository branches | Read |
| `create_branch` | Create a new branch | Write |
| `delete_branch` | Delete a branch | Write |
| `list_tags` | List repository tags | Read |

### Commits (2)

| Tool | Description | Type |
|---|---|---|
| `list_commits` | List repository commits | Read |
| `get_commit` | Get commit details | Read |

### Pipelines (3)

| Tool | Description | Type |
|---|---|---|
| `list_pipelines` | List repository pipelines | Read |
| `get_pipeline` | Get pipeline details | Read |
| `list_pipeline_steps` | List pipeline steps | Read |

### Source (2)

| Tool | Description | Type |
|---|---|---|
| `get_file_content` | Read a file from a repository | Read |
| `search_code` | Search code in a workspace | Read |

### Workspaces (2)

| Tool | Description | Type |
|---|---|---|
| `list_workspaces` | List workspaces | Read |
| `list_workspace_members` | List workspace members | Read |

### Users (1)

| Tool | Description | Type |
|---|---|---|
| `get_user_profile` | Get current user profile | Read |

## How It Works

This plugin runs inside your Bitbucket tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
