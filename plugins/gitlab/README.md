# GitLab

OpenTabs plugin for GitLab — gives AI agents access to GitLab through your authenticated browser session.

## Install

```bash
opentabs plugin install gitlab
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-gitlab
```

## Setup

1. Open [gitlab.com](https://gitlab.com) in Chrome and log in
2. Open the OpenTabs side panel — the GitLab plugin should appear as **ready**

## Tools (22)

### Projects (2)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List accessible projects | Read |
| `get_project` | Get project details | Read |

### Search (1)

| Tool | Description | Type |
|---|---|---|
| `search_projects` | Search for projects | Read |

### Issues (4)

| Tool | Description | Type |
|---|---|---|
| `list_issues` | List issues for a project | Read |
| `get_issue` | Get issue details | Read |
| `create_issue` | Create a new issue | Write |
| `update_issue` | Update an issue | Write |

### Merge Requests (6)

| Tool | Description | Type |
|---|---|---|
| `list_merge_requests` | List merge requests for a project | Read |
| `get_merge_request` | Get merge request details | Read |
| `create_merge_request` | Create a new merge request | Write |
| `update_merge_request` | Update a merge request | Write |
| `merge_merge_request` | Merge a merge request | Write |
| `get_merge_request_diff` | Get the diff of a merge request | Read |

### Notes (2)

| Tool | Description | Type |
|---|---|---|
| `list_notes` | List notes on an issue or merge request | Read |
| `create_note` | Add a comment to an issue or MR | Write |

### Branches (1)

| Tool | Description | Type |
|---|---|---|
| `list_branches` | List branches for a project | Read |

### Content (2)

| Tool | Description | Type |
|---|---|---|
| `get_file_content` | Read a file from a repository | Read |
| `list_commits` | List commits for a project | Read |

### CI/CD (3)

| Tool | Description | Type |
|---|---|---|
| `list_pipelines` | List CI/CD pipelines | Read |
| `list_pipeline_jobs` | List jobs for a pipeline | Read |
| `get_job_log` | Get the log output of a job | Read |

### Users (1)

| Tool | Description | Type |
|---|---|---|
| `get_user_profile` | Get a user profile | Read |

## How It Works

This plugin runs inside your GitLab tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
