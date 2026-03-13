# Robinhood

OpenTabs plugin for Robinhood — gives AI agents access to Robinhood through your authenticated browser session.

## Install

```bash
opentabs plugin install robinhood
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-robinhood
```

## Setup

1. Open [robinhood.com](https://robinhood.com) in Chrome and log in
2. Open the OpenTabs side panel — the Robinhood plugin should appear as **ready**

## Tools (23)

### Account (4)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get current Robinhood user profile | Read |
| `get_account` | Get brokerage account details | Read |
| `list_transfers` | List ACH bank transfers | Read |
| `list_notifications` | List recent notifications | Read |

### Portfolio (5)

| Tool | Description | Type |
|---|---|---|
| `get_portfolio` | Get portfolio summary | Read |
| `get_portfolio_historicals` | Get historical portfolio performance | Read |
| `list_positions` | List current stock positions | Read |
| `list_crypto_holdings` | List current crypto holdings | Read |
| `list_dividends` | List dividend payments | Read |

### Market Data (9)

| Tool | Description | Type |
|---|---|---|
| `get_quote` | Get real-time stock quotes | Read |
| `get_fundamentals` | Get fundamental financial data for a stock | Read |
| `get_historicals` | Get historical price data for stocks | Read |
| `get_earnings` | Get earnings history and estimates | Read |
| `get_ratings` | Get analyst ratings for a stock | Read |
| `get_instrument` | Get instrument details by UUID | Read |
| `search_instruments` | Search instruments by name or ticker | Read |
| `get_market_hours` | Get market hours for a date | Read |
| `get_news_feed` | Get news and market feed | Read |

### Orders (1)

| Tool | Description | Type |
|---|---|---|
| `list_orders` | List recent stock orders | Read |

### Lists (4)

| Tool | Description | Type |
|---|---|---|
| `list_watchlists` | List all watchlists | Read |
| `get_watchlist` | Get watchlist details and items | Read |
| `create_watchlist` | Create a new custom watchlist | Write |
| `delete_watchlist` | Delete a custom watchlist | Write |

## How It Works

This plugin runs inside your Robinhood tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
