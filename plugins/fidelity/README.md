# Fidelity

OpenTabs plugin for Fidelity Investments — gives AI agents access to Fidelity through your authenticated browser session.

## Install

```bash
opentabs plugin install fidelity
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-fidelity
```

## Setup

1. Open [digital.fidelity.com](https://digital.fidelity.com/ftgw/digital/portfolio/summary) in Chrome and log in
2. Open the OpenTabs side panel — the Fidelity plugin should appear as **ready**

## Tools (13)

### Portfolio (4)

| Tool | Description | Type |
|---|---|---|
| `get_portfolio_summary` | View total portfolio balance and daily gain/loss | Read |
| `get_positions` | View holdings for your accounts | Read |
| `get_balance_history` | View portfolio balance over time | Read |
| `get_portfolio_events` | View portfolio earnings, dividends, and milestones | Read |

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `list_accounts` | List all accounts with balances | Read |
| `get_advisor_info` | View your advisor assignment | Read |
| `get_service_messages` | Check message center alerts | Read |

### Market Data (5)

| Tool | Description | Type |
|---|---|---|
| `get_quotes` | Get real-time stock quotes | Read |
| `get_market_movers` | View top market movers | Read |
| `get_investment_news` | News for your portfolio holdings | Read |
| `get_top_news` | Top financial news headlines | Read |
| `get_customer_orders` | View buy/sell order flow sentiment | Read |

### Retirement (1)

| Tool | Description | Type |
|---|---|---|
| `get_contribution_data` | View IRA/HSA contribution limits and YTD | Read |

## How It Works

This plugin runs inside your Fidelity tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
