# Uber

OpenTabs plugin for Uber — gives AI agents access to Uber through your authenticated browser session.

## Install

```bash
opentabs plugin install uber
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-uber
```

## Setup

1. Open [uber.com](https://www.uber.com) in Chrome and log in
2. Open the OpenTabs side panel — the Uber plugin should appear as **ready**

## Tools (8)

### Account (2)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the current Uber user profile | Read |
| `get_membership` | Get Uber One membership details and savings | Read |

### Activities (2)

| Tool | Description | Type |
|---|---|---|
| `get_past_activities` | Get recent trip and order history | Read |
| `get_upcoming_activities` | Get upcoming trips or reservations | Read |

### Rides (2)

| Tool | Description | Type |
|---|---|---|
| `search_locations` | Search for addresses and places | Read |
| `get_travel_status` | Check if user has an active ride | Read |

### Products (2)

| Tool | Description | Type |
|---|---|---|
| `get_product_suggestions` | Get available Uber products and services | Read |
| `get_enabled_products` | Get Uber products available in the region | Read |

## How It Works

This plugin runs inside your Uber tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
