# WhatsApp

OpenTabs plugin for WhatsApp Web — gives AI agents access to WhatsApp through your authenticated browser session.

## Install

```bash
opentabs plugin install whatsapp
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-whatsapp
```

## Setup

1. Open [web.whatsapp.com](https://web.whatsapp.com) in Chrome and log in
2. Open the OpenTabs side panel — the WhatsApp plugin should appear as **ready**

## Tools (21)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the current WhatsApp user profile | Read |

### Chats (8)

| Tool | Description | Type |
|---|---|---|
| `list_chats` | List all WhatsApp chats | Read |
| `get_chat` | Get a single chat by ID | Read |
| `archive_chat` | Archive or unarchive a chat | Write |
| `pin_chat` | Pin or unpin a chat | Write |
| `mute_chat` | Mute or unmute a chat | Write |
| `mark_chat_read` | Mark a chat as read or unread | Write |
| `delete_chat` | Delete a chat | Write |
| `clear_chat` | Clear all messages from a chat | Write |

### Messages (5)

| Tool | Description | Type |
|---|---|---|
| `list_messages` | List messages in a chat | Read |
| `send_message` | Send a text message | Write |
| `star_message` | Star or unstar messages | Write |
| `delete_message` | Delete messages locally | Write |
| `revoke_message` | Unsend messages for everyone | Write |

### Contacts (4)

| Tool | Description | Type |
|---|---|---|
| `list_contacts` | List all contacts | Read |
| `get_contact` | Get a single contact by ID | Read |
| `block_contact` | Block a contact | Write |
| `unblock_contact` | Unblock a contact | Write |

### Groups (3)

| Tool | Description | Type |
|---|---|---|
| `create_group` | Create a new group chat | Write |
| `get_group_invite_link` | Get group invite link | Read |
| `revoke_group_invite_link` | Revoke and regenerate group invite link | Write |

## How It Works

This plugin runs inside your WhatsApp tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
