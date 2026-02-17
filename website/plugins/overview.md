# Plugins Overview

OpenTabs uses a plugin architecture. Each plugin adds support for a web application by defining tools and adapters.

## How Plugins Work

A plugin consists of:

1. **Tool definitions** — what the AI agent can do (with Zod schemas for inputs/outputs)
2. **An adapter script** — JavaScript that runs in the page's MAIN world to execute actions
3. **URL patterns** — which pages the plugin should activate on

When a matching tab is open, the Chrome extension injects the adapter. When the AI agent calls a tool, the adapter executes it using the page's authenticated APIs.

## Available Plugins

Check [npm](https://www.npmjs.com/search?q=opentabs-plugin) for published plugins.

## Creating Your Own

See [Creating a Plugin](/plugins/creating-a-plugin) for a step-by-step guide.
