# Wikipedia

OpenTabs plugin for Wikipedia — gives AI agents access to Wikipedia through your authenticated browser session.

## Install

```bash
opentabs plugin install wikipedia
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-wikipedia
```

## Setup

1. Open [wikipedia.org](https://en.wikipedia.org) in Chrome and log in
2. Open the OpenTabs side panel — the Wikipedia plugin should appear as **ready**

## Tools (19)

### Articles (11)

| Tool | Description | Type |
|---|---|---|
| `search_articles` | Search Wikipedia for articles matching a query | Read |
| `get_article` | Get article summary and metadata | Read |
| `get_page_summary` | Get a quick article summary | Read |
| `get_article_sections` | Get the table of contents of an article | Read |
| `get_section_content` | Read a specific section of an article | Read |
| `get_article_categories` | List categories an article belongs to | Read |
| `get_article_links` | List internal links from an article | Read |
| `get_article_languages` | List language versions of an article | Read |
| `get_backlinks` | Find pages that link to an article | Read |
| `get_random_articles` | Get random Wikipedia articles | Read |
| `opensearch` | Autocomplete article title search | Write |

### Revisions (2)

| Tool | Description | Type |
|---|---|---|
| `get_revisions` | Get revision history of an article | Read |
| `compare_revisions` | Compare two article revisions | Write |

### Activity (2)

| Tool | Description | Type |
|---|---|---|
| `get_recent_changes` | List recent edits across Wikipedia | Read |
| `get_featured_content` | Get today's featured content | Read |

### Users (2)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the logged-in user profile | Read |
| `get_user_contributions` | List edits made by a user | Read |

### Categories (1)

| Tool | Description | Type |
|---|---|---|
| `get_category_members` | List pages in a category | Read |

### Statistics (1)

| Tool | Description | Type |
|---|---|---|
| `get_page_views` | Get daily page view statistics | Read |

## How It Works

This plugin runs inside your Wikipedia tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
