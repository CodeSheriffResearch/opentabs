# YNAB

OpenTabs plugin for YNAB (You Need A Budget) — gives AI agents access to YNAB through your authenticated browser session.

## Install

```bash
opentabs plugin install ynab
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-ynab
```

## Setup

1. Open [app.ynab.com](https://app.ynab.com) in Chrome and log in
2. Open the OpenTabs side panel — the YNAB plugin should appear as **ready**

## Tools (15)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get your YNAB user profile | Read |

### Plans (1)

| Tool | Description | Type |
|---|---|---|
| `get_plan` | Get the active plan details | Read |

### Accounts (2)

| Tool | Description | Type |
|---|---|---|
| `list_accounts` | List all budget accounts | Read |
| `get_account` | Get account details by ID | Read |

### Categories (2)

| Tool | Description | Type |
|---|---|---|
| `list_categories` | List budget categories with balances | Read |
| `update_category_budget` | Set budgeted amount for a category | Write |

### Payees (1)

| Tool | Description | Type |
|---|---|---|
| `list_payees` | List all payees | Read |

### Transactions (6)

| Tool | Description | Type |
|---|---|---|
| `list_transactions` | List budget transactions | Read |
| `get_transaction` | Get transaction details by ID | Read |
| `create_transaction` | Create a new transaction | Write |
| `update_transaction` | Update a transaction | Write |
| `delete_transaction` | Delete a transaction | Write |
| `list_scheduled_transactions` | List scheduled/recurring transactions | Read |

### Months (2)

| Tool | Description | Type |
|---|---|---|
| `list_months` | List budget months with summaries | Read |
| `get_month` | Get budget details for a month | Read |

## How It Works

This plugin runs inside your YNAB tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
