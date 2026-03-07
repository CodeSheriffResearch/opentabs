/**
 * MCP resource definitions for the OpenTabs server.
 *
 * Resources are static or dynamic documents that AI clients can fetch on demand
 * via `resources/read`. Unlike instructions (sent on every session), resources
 * are pull-based — clients discover them via `resources/list` and fetch content
 * when they need deeper context.
 *
 * Static resources return pre-built markdown content (guides, references).
 * The `opentabs://status` resource is dynamic — built from ServerState at read time.
 */

import type { ServerState } from './state.js';

/** A resource definition for MCP resources/list */
export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/** A resolved resource for MCP resources/read */
export interface ResolvedResource {
  uri: string;
  mimeType: string;
  text: string;
}

/** All registered resources */
const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'opentabs://guide/quick-start',
    name: 'Quick Start Guide',
    description: 'Installation, configuration, and first tool call',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://guide/plugin-development',
    name: 'Plugin Development Guide',
    description: 'Full guide to building OpenTabs plugins (SDK, patterns, conventions)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://guide/troubleshooting',
    name: 'Troubleshooting Guide',
    description: 'Common errors and resolution steps',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/sdk-api',
    name: 'SDK API Reference',
    description: 'Plugin SDK API reference (utilities, errors, lifecycle hooks)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/cli',
    name: 'CLI Reference',
    description: 'CLI command reference (opentabs, opentabs-plugin)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/browser-tools',
    name: 'Browser Tools Reference',
    description: 'All browser tools organized by category',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://status',
    name: 'Server Status',
    description: 'Live server state: loaded plugins, extension connectivity, tab states',
    mimeType: 'application/json',
  },
];

/** Resource URI → definition for O(1) lookup */
const RESOURCE_MAP = new Map(RESOURCES.map(r => [r.uri, r]));

// ---------------------------------------------------------------------------
// Static resource content
// ---------------------------------------------------------------------------

const QUICK_START_CONTENT = `# OpenTabs Quick Start Guide

## What is OpenTabs?

OpenTabs is a platform that gives AI agents access to web applications through the user's authenticated browser session. It consists of:

- **MCP Server** — runs on localhost, serves tools to AI clients via Streamable HTTP
- **Chrome Extension** — injects plugin adapters into matching browser tabs, relays tool calls
- **Plugin SDK** — allows anyone to create plugins as standalone npm packages

When connected, your AI client gets browser tools (tab management, screenshots, DOM interaction, network capture) and plugin tools (e.g., \`slack_send_message\`, \`github_list_repos\`) that operate in the user's authenticated context.

## Installation

\`\`\`bash
npm install -g @opentabs-dev/cli
\`\`\`

## Starting the Server

\`\`\`bash
opentabs start
\`\`\`

On first run, this:
1. Creates \`~/.opentabs/\` (config, logs, extension files)
2. Generates a WebSocket auth secret at \`~/.opentabs/extension/auth.json\`
3. Prints MCP client configuration blocks for Claude Code, Cursor, and Windsurf
4. Starts the MCP server on \`http://127.0.0.1:9515/mcp\`

To re-display the configuration blocks later:

\`\`\`bash
opentabs start --show-config
\`\`\`

## Loading the Chrome Extension

1. Open \`chrome://extensions/\` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select \`~/.opentabs/extension\`

The extension icon appears in the toolbar. Click it to open the side panel showing plugin states and tool permissions.

## Configuring Your MCP Client

Get the auth secret:

\`\`\`bash
opentabs config show --json --show-secret | jq -r .secret
\`\`\`

### Claude Code

CLI method (recommended):

\`\`\`bash
claude mcp add --transport http opentabs http://127.0.0.1:9515/mcp \\
  --header "Authorization: Bearer YOUR_SECRET_HERE"
\`\`\`

Or merge into \`~/.claude.json\`:

\`\`\`json
{
  "mcpServers": {
    "opentabs": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:9515/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_HERE"
      }
    }
  }
}
\`\`\`

### Cursor

Add to \`.cursor/mcp.json\`:

\`\`\`json
{
  "mcpServers": {
    "opentabs": {
      "type": "http",
      "url": "http://127.0.0.1:9515/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_HERE"
      }
    }
  }
}
\`\`\`

### Windsurf

Add to \`~/.codeium/windsurf/mcp_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "opentabs": {
      "serverUrl": "http://127.0.0.1:9515/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_HERE"
      }
    }
  }
}
\`\`\`

### OpenCode

Add to \`opencode.json\` in the project root:

\`\`\`json
{
  "mcp": {
    "opentabs": {
      "type": "remote",
      "url": "http://127.0.0.1:9515/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_HERE"
      }
    }
  }
}
\`\`\`

## Installing a Plugin

\`\`\`bash
opentabs plugin search              # Browse available plugins
opentabs plugin install <name>      # Install (e.g., opentabs plugin install slack)
\`\`\`

After installing, open the target web app in Chrome (e.g., \`app.slack.com\` for Slack). The extension detects the matching tab and loads the plugin adapter.

## Plugin Review Flow

Plugins start with permission \`'off'\` and must be reviewed before use. When you call a tool on an unreviewed plugin, the error response guides you through the review:

1. Call \`plugin_inspect\` with the plugin name to retrieve the adapter source code and a review token
2. Review the code for security (the response includes review guidance)
3. If the code is safe, call \`plugin_mark_reviewed\` with the review token and desired permission (\`'ask'\` or \`'auto'\`)
4. The plugin is now active — its tools are available

When a plugin updates to a new version, its permission resets to \`'off'\` and requires re-review.

## Permission Model

Every tool has a 3-state permission:

| Permission | Behavior |
|------------|----------|
| \`'off'\` | Disabled — tool call returns an error |
| \`'ask'\` | Requires human approval via the side panel dialog |
| \`'auto'\` | Executes immediately without user confirmation |

Configure permissions via CLI:

\`\`\`bash
opentabs config set plugin-permission.<plugin> ask
opentabs config set tool-permission.<plugin>.<tool> auto
\`\`\`

To bypass all permission checks (development only):

\`\`\`bash
OPENTABS_DANGEROUSLY_SKIP_PERMISSIONS=1 opentabs start
\`\`\`

## Available Tool Categories

### Plugin Tools (\`<plugin>_<tool>\`)
Execute inside the web page context using the user's authenticated browser session. Each plugin exposes domain-specific tools (e.g., \`slack_send_message\`, \`github_create_issue\`).

### Browser Tools (\`browser_*\`) — 40 built-in tools
General-purpose tools organized by category:
- **Tab Management** — open, close, list, switch tabs
- **Content Retrieval** — read page content, HTML, take screenshots
- **DOM Interaction** — click elements, type text, query selectors
- **Scroll & Navigation** — scroll, navigate, go back/forward
- **Storage & Cookies** — read/write localStorage, sessionStorage, cookies
- **Network Capture** — capture and inspect network requests, WebSocket frames, HAR export
- **Console** — read browser console logs
- **Site Analysis** — comprehensive analysis of a web page for plugin development

### Extension Tools (\`extension_*\`)
Diagnostics: extension state, logs, adapter injection status, WebSocket connectivity.

## Multi-Tab Targeting

When multiple tabs match a plugin, use \`plugin_list_tabs\` to discover available tabs and their IDs. Pass the optional \`tabId\` parameter to any plugin tool to target a specific tab. Without \`tabId\`, the platform auto-selects the best-ranked tab.

## Verifying the Setup

\`\`\`bash
opentabs status    # Check server, extension, and plugin status
opentabs doctor    # Run diagnostics and suggest fixes
\`\`\`

From your AI client, you can also:
1. Fetch \`opentabs://status\` to get a JSON snapshot of the server state
2. Call \`extension_get_state\` to verify the Chrome extension is connected
3. Call \`plugin_list_tabs\` to see which plugin tabs are ready
`;

/** URI → content for static resources that have been written */
const CONTENT_MAP = new Map<string, string>([['opentabs://guide/quick-start', QUICK_START_CONTENT]]);

/** Return all resource definitions for resources/list */
export const getAllResources = (_state: ServerState): ResourceDefinition[] =>
  RESOURCES.map(r => ({
    uri: r.uri,
    name: r.name,
    description: r.description,
    mimeType: r.mimeType,
  }));

/**
 * Resolve a resource by URI, returning its content.
 * Returns null if the URI is not recognized.
 */
export const resolveResource = (state: ServerState, uri: string): ResolvedResource | null => {
  const def = RESOURCE_MAP.get(uri);
  if (!def) return null;

  if (uri === 'opentabs://status') {
    return { uri, mimeType: 'application/json', text: buildStatusResource(state) };
  }

  const content = CONTENT_MAP.get(uri);
  if (content) {
    return { uri, mimeType: def.mimeType, text: content };
  }

  // Static resources without content yet return a placeholder
  return { uri, mimeType: def.mimeType, text: `# ${def.name}\n\nContent coming soon.` };
};

/** Build the dynamic status resource JSON from server state */
const buildStatusResource = (state: ServerState): string => {
  const plugins = [...state.registry.plugins.values()].map(p => ({
    name: p.name,
    displayName: p.displayName,
    toolCount: p.tools.length,
    tools: p.tools.map(t => `${p.name}_${t.name}`),
    tabState: state.tabMapping.get(p.name)?.state ?? 'closed',
    tabs: (state.tabMapping.get(p.name)?.tabs ?? []).map(t => ({
      tabId: t.tabId,
      url: t.url,
      title: t.title,
      ready: t.ready,
    })),
  }));

  return JSON.stringify(
    {
      extensionConnected: state.extensionWs !== null,
      plugins,
      failedPlugins: [...state.registry.failures],
      browserToolCount: state.cachedBrowserTools.length,
      pluginToolCount: [...state.registry.plugins.values()].reduce((sum, p) => sum + p.tools.length, 0),
      skipPermissions: state.skipPermissions,
      uptime: Math.round((Date.now() - state.startedAt) / 1000),
    },
    null,
    2,
  );
};
