# Best Buy

OpenTabs plugin for Best Buy — gives AI agents access to Best Buy through your authenticated browser session.

## Install

```bash
opentabs plugin install bestbuy
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-bestbuy
```

## Setup

1. Open [bestbuy.com](https://www.bestbuy.com) in Chrome and log in
2. Open the OpenTabs side panel — the Best Buy plugin should appear as **ready**

## Tools (11)

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated user profile | Read |
| `get_saved_cards` | List saved payment cards | Read |
| `get_customer_plans` | Get active plans and subscriptions | Read |

### Products (3)

| Tool | Description | Type |
|---|---|---|
| `search_products` | Search for products on Best Buy | Read |
| `get_product` | Get product details by SKU ID | Read |
| `get_product_reviews` | Get product reviews by SKU ID | Read |

### Cart (3)

| Tool | Description | Type |
|---|---|---|
| `get_cart` | View current cart contents and total | Read |
| `add_to_cart` | Add a product to the cart | Write |
| `navigate_to_checkout` | Go to checkout to complete purchase | Write |

### Purchases (2)

| Tool | Description | Type |
|---|---|---|
| `list_purchases` | List purchase history | Read |
| `get_purchase_details` | Get in-store purchase receipt | Read |

## How It Works

This plugin runs inside your Best Buy tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
