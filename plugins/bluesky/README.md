# Bluesky

OpenTabs plugin for Bluesky — gives AI agents access to Bluesky through your authenticated browser session.

## Install

```bash
opentabs plugin install bluesky
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-bluesky
```

## Setup

1. Open [bsky.app](https://bsky.app) in Chrome and log in
2. Open the OpenTabs side panel — the Bluesky plugin should appear as **ready**

## Tools (38)

### Feed (6)

| Tool | Description | Type |
|---|---|---|
| `get_timeline` | Get the home timeline | Read |
| `get_feed` | Get posts from a custom feed | Read |
| `get_author_feed` | Get posts by a specific user | Read |
| `get_post_thread` | Get a post and its reply thread | Read |
| `get_posts` | Get multiple posts by URI | Read |
| `get_list_feed` | Get posts from a user list | Read |

### Posts (7)

| Tool | Description | Type |
|---|---|---|
| `create_post` | Create a new post | Write |
| `delete_post` | Delete a post | Write |
| `search_posts` | Search posts by keyword | Read |
| `like_post` | Like a post | Write |
| `unlike_post` | Remove a like from a post | Write |
| `repost` | Repost a post | Write |
| `unrepost` | Remove a repost | Write |

### Profiles (5)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated user's profile | Read |
| `get_user_profile` | Get a user profile by DID or handle | Read |
| `get_user_profiles` | Get multiple user profiles | Read |
| `search_users` | Search for users | Read |
| `search_users_typeahead` | Typeahead search for users | Read |

### Social Graph (9)

| Tool | Description | Type |
|---|---|---|
| `get_followers` | Get a user's followers | Read |
| `get_follows` | Get accounts a user follows | Read |
| `follow_user` | Follow a user | Write |
| `unfollow_user` | Unfollow a user | Write |
| `get_blocks` | Get blocked accounts | Read |
| `mute_actor` | Mute a user | Write |
| `unmute_actor` | Unmute a user | Write |
| `mute_thread` | Mute a thread | Write |
| `unmute_thread` | Unmute a thread | Write |

### Notifications (3)

| Tool | Description | Type |
|---|---|---|
| `list_notifications` | List notifications | Read |
| `get_unread_count` | Get unread notification count | Read |
| `mark_notifications_seen` | Mark notifications as seen | Write |

### Chat (8)

| Tool | Description | Type |
|---|---|---|
| `list_conversations` | List DM conversations | Read |
| `get_conversation` | Get conversation details | Read |
| `get_messages` | Get messages in a conversation | Read |
| `send_message` | Send a DM | Write |
| `delete_message` | Delete a message | Write |
| `mute_conversation` | Mute a conversation | Write |
| `unmute_conversation` | Unmute a conversation | Write |
| `mark_conversation_read` | Mark a conversation as read | Write |

## How It Works

This plugin runs inside your Bluesky tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
