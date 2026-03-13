# Facebook

OpenTabs plugin for Facebook — gives AI agents access to Facebook through your authenticated browser session.

## Install

```bash
opentabs plugin install facebook
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-facebook
```

## Setup

1. Open [facebook.com](https://www.facebook.com) in Chrome and log in
2. Open the OpenTabs side panel — the Facebook plugin should appear as **ready**

## Tools (14)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the logged-in user profile | Read |

### Users (1)

| Tool | Description | Type |
|---|---|---|
| `get_user_profile` | Get a user profile by ID | Read |

### Posts (1)

| Tool | Description | Type |
|---|---|---|
| `get_user_posts` | Get a user's timeline posts | Read |

### Notifications (1)

| Tool | Description | Type |
|---|---|---|
| `list_notifications` | List your Facebook notifications | Read |

### Search (1)

| Tool | Description | Type |
|---|---|---|
| `search` | Search Facebook entities | Write |

### Marketplace (1)

| Tool | Description | Type |
|---|---|---|
| `search_marketplace` | Search Marketplace listings | Read |

### Events (1)

| Tool | Description | Type |
|---|---|---|
| `list_events` | List upcoming events | Read |

### Groups (1)

| Tool | Description | Type |
|---|---|---|
| `list_groups` | List your joined groups | Read |

### Saved (1)

| Tool | Description | Type |
|---|---|---|
| `list_saved` | List your saved items | Read |

### Interactions (2)

| Tool | Description | Type |
|---|---|---|
| `react_to_post` | React to a Facebook post | Write |
| `get_reactions` | Get reaction counts on a post | Read |

### Friends (3)

| Tool | Description | Type |
|---|---|---|
| `list_friend_requests` | List pending friend requests | Read |
| `confirm_friend_request` | Accept a friend request | Write |
| `delete_friend_request` | Decline a friend request | Write |

## How It Works

This plugin runs inside your Facebook tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
