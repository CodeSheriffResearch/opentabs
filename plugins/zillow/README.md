# Zillow

OpenTabs plugin for Zillow real estate search — gives AI agents access to Zillow through your authenticated browser session.

## Install

```bash
opentabs plugin install zillow
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-zillow
```

## Setup

1. Open [zillow.com](https://www.zillow.com) in Chrome and log in
2. Open the OpenTabs side panel — the Zillow plugin should appear as **ready**

## Tools (12)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the current Zillow user profile | Read |

### Search (8)

| Tool | Description | Type |
|---|---|---|
| `search_locations` | Search for cities, ZIP codes, neighborhoods, and addresses | Read |
| `search_for_sale` | Search properties for sale | Read |
| `search_for_rent` | Search rental properties | Read |
| `search_recently_sold` | Search recently sold properties | Read |
| `search_open_houses` | Find properties with open houses | Read |
| `search_new_construction` | Find new construction homes | Read |
| `search_foreclosures` | Find foreclosure properties | Read |
| `search_by_owner` | Find for-sale-by-owner listings | Read |

### Properties (1)

| Tool | Description | Type |
|---|---|---|
| `search_by_address` | Look up a property by street address | Read |

### Saved Homes (1)

| Tool | Description | Type |
|---|---|---|
| `get_saved_homes` | Get saved/favorited home zpids | Read |

### Market (1)

| Tool | Description | Type |
|---|---|---|
| `get_market_overview` | Get market listing counts for an area | Read |

## How It Works

This plugin runs inside your Zillow tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
