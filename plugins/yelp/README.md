# Yelp

OpenTabs plugin for Yelp — gives AI agents access to Yelp through your authenticated browser session.

## Install

```bash
opentabs plugin install yelp
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-yelp
```

## Setup

1. Open [www.yelp.com](https://www.yelp.com) in Chrome and log in
2. Open the OpenTabs side panel — the Yelp plugin should appear as **ready**

## Tools (7)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated Yelp user profile | Read |

### Businesses (3)

| Tool | Description | Type |
|---|---|---|
| `search_businesses` | Search for businesses by keyword and location | Read |
| `get_business` | Get business details by alias | Read |
| `get_current_page_businesses` | Extract businesses from the current search results page | Read |

### Search (1)

| Tool | Description | Type |
|---|---|---|
| `autocomplete` | Get search autocomplete suggestions | Write |

### Navigation (2)

| Tool | Description | Type |
|---|---|---|
| `navigate_to_search` | Open Yelp search results in the browser | Write |
| `navigate_to_business` | Open a business page in the browser | Write |

## How It Works

This plugin runs inside your Yelp tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
