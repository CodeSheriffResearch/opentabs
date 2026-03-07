/** Plugin Development Guide resource content. */

export const PLUGIN_DEVELOPMENT_CONTENT = `# Plugin Development Guide

## Architecture

OpenTabs plugins run **in the browser page context**, not on the server. The MCP server discovers plugins, but tool execution happens inside the web page via an adapter IIFE injected by the Chrome extension. This means plugin code has full access to the page's DOM, JavaScript globals, cookies, localStorage, and authenticated fetch requests.

**Flow:** AI client → MCP server → Chrome extension (WebSocket) → adapter IIFE (page context) → tool handler → result back through the chain.

## Plugin Structure

A plugin is a standalone npm package with this structure:

\`\`\`
my-plugin/
├── package.json         # Must include "opentabs" field
├── src/
│   ├── plugin.ts        # OpenTabsPlugin subclass (entry point)
│   └── tools/
│       ├── get-data.ts  # One file per tool (convention)
│       └── send-msg.ts
├── dist/                # Built by opentabs-plugin build
│   ├── adapter.iife.js  # Injected into matching browser tabs
│   └── tools.json       # Tool schemas for MCP registration
└── tsconfig.json
\`\`\`

### package.json

\`\`\`json
{
  "name": "@scope/opentabs-plugin-myapp",
  "version": "1.0.0",
  "opentabs": {
    "name": "myapp",
    "displayName": "My App",
    "description": "Tools for My App",
    "urlPatterns": ["*://myapp.com/*"]
  },
  "main": "src/plugin.ts",
  "scripts": {
    "build": "opentabs-plugin build"
  },
  "dependencies": {
    "@opentabs-dev/plugin-sdk": "latest"
  },
  "devDependencies": {
    "@opentabs-dev/plugin-tools": "latest"
  }
}
\`\`\`

The \`opentabs.name\` field is the plugin identifier (lowercase, alphanumeric + hyphens). It becomes the tool name prefix (e.g., \`myapp_get_data\`).

## OpenTabsPlugin Base Class

Every plugin extends \`OpenTabsPlugin\` and exports an instance:

\`\`\`typescript
import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { getDataTool } from './tools/get-data.js';
import { sendMsgTool } from './tools/send-msg.js';

class MyPlugin extends OpenTabsPlugin {
  readonly name = 'myapp';
  readonly displayName = 'My App';
  readonly description = 'Tools for My App';
  readonly urlPatterns = ['*://myapp.com/*'];
  readonly tools: ToolDefinition[] = [getDataTool, sendMsgTool];

  async isReady(): Promise<boolean> {
    // Return true when the user is authenticated and the app is loaded
    return document.querySelector('.logged-in-indicator') !== null;
  }
}

export default new MyPlugin();
\`\`\`

### Required Members

| Member | Type | Purpose |
|--------|------|---------|
| \`name\` | \`string\` | Unique identifier (lowercase alphanumeric + hyphens) |
| \`displayName\` | \`string\` | Human-readable name shown in side panel |
| \`description\` | \`string\` | Brief plugin description |
| \`urlPatterns\` | \`string[]\` | Chrome match patterns for tab injection |
| \`tools\` | \`ToolDefinition[]\` | Array of tool definitions |
| \`isReady()\` | \`() => Promise<boolean>\` | Readiness probe — returns true when tab is ready for tool calls |

### Tab State Machine

| State | Condition |
|-------|-----------|
| \`closed\` | No browser tab matches the plugin's URL patterns |
| \`unavailable\` | Tab matches URL patterns but \`isReady()\` returns false |
| \`ready\` | Tab matches URL patterns and \`isReady()\` returns true |

## defineTool Factory

Each tool is defined with \`defineTool\`, which provides type inference:

\`\`\`typescript
import { z } from 'zod';
import { defineTool, fetchJSON } from '@opentabs-dev/plugin-sdk';
import type { ToolHandlerContext } from '@opentabs-dev/plugin-sdk';

export const getDataTool = defineTool({
  name: 'get_data',
  displayName: 'Get Data',
  description: 'Retrieves data from the app. Returns the matching records.',
  summary: 'Retrieve app data',
  icon: 'database',
  group: 'Data',
  input: z.object({
    query: z.string().describe('Search query string'),
    limit: z.number().int().min(1).max(100).default(25).describe('Max results to return'),
  }),
  output: z.object({
    results: z.array(z.object({
      id: z.string(),
      title: z.string(),
    })),
    total: z.number(),
  }),
  async handle(params, context?: ToolHandlerContext) {
    const data = await fetchJSON<{ items: Array<{ id: string; title: string }>; total: number }>(
      \`/api/data?q=\${encodeURIComponent(params.query)}&limit=\${params.limit}\`
    );
    return { results: data?.items ?? [], total: data?.total ?? 0 };
  },
});
\`\`\`

### ToolDefinition Fields

| Field | Required | Description |
|-------|----------|-------------|
| \`name\` | Yes | Tool name (auto-prefixed with plugin name) |
| \`displayName\` | No | Human-readable name for side panel (auto-derived from name if omitted) |
| \`description\` | Yes | Shown to AI agents — be specific and include return value info |
| \`summary\` | No | Short UI summary (falls back to description) |
| \`icon\` | No | Lucide icon name in kebab-case (defaults to \`wrench\`) |
| \`group\` | No | Visual grouping in the side panel |
| \`input\` | Yes | Zod object schema for parameters |
| \`output\` | Yes | Zod schema for return value |
| \`handle\` | Yes | Async function — runs in page context. Second arg is optional \`ToolHandlerContext\` |

### Progress Reporting

Long-running tools can report progress via the optional \`context\` parameter:

\`\`\`typescript
async handle(params, context?: ToolHandlerContext) {
  const items = await getItemList();
  for (let i = 0; i < items.length; i++) {
    context?.reportProgress({ progress: i + 1, total: items.length, message: \`Processing \${items[i].name}\` });
    await processItem(items[i]);
  }
  return { processed: items.length };
}
\`\`\`

## SDK Utilities Reference

All utilities are imported from \`@opentabs-dev/plugin-sdk\`. They run in the page context.

### DOM

| Function | Signature | Description |
|----------|-----------|-------------|
| \`waitForSelector\` | \`<T extends Element>(selector, opts?) → Promise<T>\` | Waits for element to appear (MutationObserver, default 10s timeout) |
| \`waitForSelectorRemoval\` | \`(selector, opts?) → Promise<void>\` | Waits for element to be removed (default 10s timeout) |
| \`querySelectorAll\` | \`<T extends Element>(selector) → T[]\` | Returns real array instead of NodeList |
| \`getTextContent\` | \`(selector) → string \\| null\` | Trimmed textContent of first match |
| \`observeDOM\` | \`(selector, callback, opts?) → () => void\` | MutationObserver on element, returns cleanup function |

### Fetch

All fetch utilities use \`credentials: 'include'\` to leverage the page's authenticated session.

| Function | Signature | Description |
|----------|-----------|-------------|
| \`fetchFromPage\` | \`(url, init?) → Promise<Response>\` | Fetch with session cookies, 30s timeout, ToolError on non-ok |
| \`fetchJSON\` | \`<T>(url, init?, schema?) → Promise<T>\` | Fetch + JSON parse. Optional Zod schema validation |
| \`postJSON\` | \`<T>(url, body, init?, schema?) → Promise<T>\` | POST with JSON body + parse response |
| \`putJSON\` | \`<T>(url, body, init?, schema?) → Promise<T>\` | PUT with JSON body + parse response |
| \`patchJSON\` | \`<T>(url, body, init?, schema?) → Promise<T>\` | PATCH with JSON body + parse response |
| \`deleteJSON\` | \`<T>(url, init?, schema?) → Promise<T>\` | DELETE + parse response |
| \`postForm\` | \`<T>(url, body, init?, schema?) → Promise<T>\` | POST URL-encoded form (Record<string,string>) |
| \`postFormData\` | \`<T>(url, body, init?, schema?) → Promise<T>\` | POST multipart/form-data (FormData) |

### Storage

| Function | Signature | Description |
|----------|-----------|-------------|
| \`getLocalStorage\` | \`(key) → string \\| null\` | Safe localStorage read (null on SecurityError) |
| \`setLocalStorage\` | \`(key, value) → void\` | Safe localStorage write |
| \`removeLocalStorage\` | \`(key) → void\` | Safe localStorage remove |
| \`getSessionStorage\` | \`(key) → string \\| null\` | Safe sessionStorage read |
| \`setSessionStorage\` | \`(key, value) → void\` | Safe sessionStorage write |
| \`removeSessionStorage\` | \`(key) → void\` | Safe sessionStorage remove |
| \`getCookie\` | \`(name) → string \\| null\` | Parse cookie by name from document.cookie |

### Page State

| Function | Signature | Description |
|----------|-----------|-------------|
| \`getPageGlobal\` | \`(path) → unknown\` | Safe deep property access on globalThis via dot-notation |
| \`getCurrentUrl\` | \`() → string\` | Returns window.location.href |
| \`getPageTitle\` | \`() → string\` | Returns document.title |

### Timing

| Function | Signature | Description |
|----------|-----------|-------------|
| \`retry\` | \`<T>(fn, opts?) → Promise<T>\` | Retry with configurable attempts (3), delay (1s), backoff, AbortSignal |
| \`sleep\` | \`(ms, opts?) → Promise<void>\` | Promisified setTimeout with optional AbortSignal |
| \`waitUntil\` | \`(predicate, opts?) → Promise<void>\` | Poll predicate at interval (200ms) until true, timeout (10s) |

### Logging

| Function | Description |
|----------|-------------|
| \`log.debug(message, ...args)\` | Debug level |
| \`log.info(message, ...args)\` | Info level |
| \`log.warn(message, ...args)\` | Warning level |
| \`log.error(message, ...args)\` | Error level |

Log entries flow from the page context through the extension to the MCP server and connected clients. Falls back to \`console\` methods outside the adapter runtime.

## ToolError Factories

Use static factory methods for structured errors. The dispatch chain propagates metadata (category, retryable, retryAfterMs) to AI clients.

| Factory | Signature | Category | Retryable |
|---------|-----------|----------|-----------|
| \`ToolError.auth\` | \`(message, code?) → ToolError\` | \`auth\` | No |
| \`ToolError.notFound\` | \`(message, code?) → ToolError\` | \`not_found\` | No |
| \`ToolError.rateLimited\` | \`(message, retryAfterMs?, code?) → ToolError\` | \`rate_limit\` | Yes |
| \`ToolError.validation\` | \`(message, code?) → ToolError\` | \`validation\` | No |
| \`ToolError.timeout\` | \`(message, code?) → ToolError\` | \`timeout\` | Yes |
| \`ToolError.internal\` | \`(message, code?) → ToolError\` | \`internal\` | No |

\`\`\`typescript
import { ToolError, fetchJSON } from '@opentabs-dev/plugin-sdk';

// Auth errors are automatically thrown by fetchJSON on 401/403
// For manual auth checks:
const token = getPageGlobal('app.auth.token') as string | undefined;
if (!token) throw ToolError.auth('User is not logged in');

// For domain-specific errors with custom codes:
throw ToolError.notFound('Channel not found', 'CHANNEL_NOT_FOUND');
throw ToolError.rateLimited('Slow down', 5000, 'SLACK_RATE_LIMITED');
\`\`\`

## Zod Schema Rules

Schemas are serialized to JSON Schema via \`z.toJSONSchema()\` for MCP registration. Follow these rules:

1. **Never use \`.transform()\`** — transforms cannot be represented in JSON Schema. Normalize input in the handler.
2. **Avoid \`.pipe()\`, \`.preprocess()\`, and effects** — these are runtime-only and break serialization.
3. **\`.refine()\` callbacks must never throw** — Zod 4 runs refine even on invalid base values. Wrap throwing code in try-catch.
4. **Use \`.describe()\` on every field** — descriptions are shown to AI agents in the tool schema.
5. **Keep schemas declarative** — primitives, objects, arrays, unions, literals, enums, optional, default.

## Lifecycle Hooks

Optional methods on \`OpenTabsPlugin\` — implement only what you need:

| Hook | Signature | When Called |
|------|-----------|------------|
| \`onActivate\` | \`() → void\` | After adapter registered on \`globalThis.__openTabs.adapters\` |
| \`onDeactivate\` | \`() → void\` | Before adapter removal (fires before \`teardown\`) |
| \`onNavigate\` | \`(url: string) → void\` | On in-page URL changes (pushState, replaceState, popstate, hashchange) |
| \`onToolInvocationStart\` | \`(toolName: string) → void\` | Before each \`tool.handle()\` |
| \`onToolInvocationEnd\` | \`(toolName: string, success: boolean, durationMs: number) → void\` | After each \`tool.handle()\` |
| \`teardown\` | \`() → void\` | Before re-injection on plugin update |

Errors in hooks are caught and logged — they do not affect tool execution.

## isReady() Polling Pattern

The extension polls \`isReady()\` to determine tab state. Common patterns:

\`\`\`typescript
// DOM-based: check for a logged-in indicator
async isReady(): Promise<boolean> {
  return document.querySelector('[data-testid="user-menu"]') !== null;
}

// Global-based: check for auth token in window globals
async isReady(): Promise<boolean> {
  return getPageGlobal('app.auth.token') !== undefined;
}

// API-based: verify session with a lightweight request
async isReady(): Promise<boolean> {
  try {
    await fetchJSON('/api/me');
    return true;
  } catch {
    return false;
  }
}
\`\`\`

## Auth Token Extraction

Plugins extract auth from the page — never ask users for credentials.

\`\`\`typescript
// From window globals (Slack pattern)
const token = getPageGlobal('TS.boot_data.api_token') as string | undefined;
if (!token) throw ToolError.auth('Not logged in');

// From localStorage
const token = getLocalStorage('auth_token');
if (!token) throw ToolError.auth('No auth token found');

// From cookies (session-based auth)
const session = getCookie('session_id');
if (!session) throw ToolError.auth('No session cookie');

// Cache on globalThis to avoid repeated extraction
const CACHE_KEY = '__opentabs_myapp_token';
function getToken(): string {
  const cached = (globalThis as Record<string, unknown>)[CACHE_KEY] as string | undefined;
  if (cached) return cached;
  const token = getPageGlobal('app.token') as string | undefined;
  if (!token) throw ToolError.auth('Not authenticated');
  (globalThis as Record<string, unknown>)[CACHE_KEY] = token;
  return token;
}
\`\`\`

## Build and Test Workflow

\`\`\`bash
# Build the plugin (generates dist/adapter.iife.js and dist/tools.json)
npx opentabs-plugin build
# Or if installed globally:
opentabs-plugin build

# The build command notifies the running MCP server via POST /reload
# No server restart needed — plugin changes are picked up automatically
\`\`\`

### Testing During Development

1. Build the plugin: \`opentabs-plugin build\`
2. Open the target web app in Chrome
3. Verify plugin loaded: call \`plugin_list_tabs\` from your AI client
4. Test a tool: call any plugin tool (e.g., \`myapp_get_data\`)
5. Check logs: call \`extension_get_logs\` to see adapter injection and tool execution logs

### Scaffolding a New Plugin

\`\`\`bash
npx @opentabs-dev/create-plugin
# Or with the CLI installed:
opentabs plugin create
\`\`\`

## Publishing to npm

\`\`\`json
{
  "name": "@scope/opentabs-plugin-myapp",
  "opentabs": {
    "name": "myapp",
    "displayName": "My App",
    "description": "Tools for My App",
    "urlPatterns": ["*://myapp.com/*"]
  }
}
\`\`\`

Package naming convention: \`opentabs-plugin-<name>\` or \`@scope/opentabs-plugin-<name>\`. The MCP server auto-discovers packages matching these patterns in global node_modules.

\`\`\`bash
npm publish
# Users install with:
opentabs plugin install myapp
\`\`\`

## Common Patterns

### API Wrapper

\`\`\`typescript
const API_BASE = '/api/v1';

async function apiGet<T>(path: string): Promise<T> {
  const result = await fetchJSON<T>(\`\${API_BASE}\${path}\`);
  if (result === undefined) throw ToolError.internal(\`Unexpected empty response from \${path}\`);
  return result;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const result = await postJSON<T>(\`\${API_BASE}\${path}\`, body);
  if (result === undefined) throw ToolError.internal(\`Unexpected empty response from \${path}\`);
  return result;
}
\`\`\`

### Waiting for App State

\`\`\`typescript
import { waitForSelector, waitUntil, getPageGlobal } from '@opentabs-dev/plugin-sdk';

// Wait for the app to finish loading before executing
await waitForSelector('.app-loaded');

// Wait for a specific global to be set
await waitUntil(() => getPageGlobal('app.initialized') === true);
\`\`\`

### Retrying Flaky Operations

\`\`\`typescript
import { retry, ToolError } from '@opentabs-dev/plugin-sdk';

const result = await retry(
  () => fetchJSON<Data>('/api/flaky-endpoint'),
  { maxAttempts: 3, delay: 1000, backoff: true }
);
\`\`\`

## Core Principle: APIs Not DOM

Every tool must use the web app's own APIs — the same endpoints the web app calls internally. DOM scraping is never acceptable as a tool implementation strategy: it is fragile (breaks on UI changes), limited (only sees what's rendered), and slow (requires waiting for DOM mutations).

When an API is hard to discover, invest time reverse-engineering network traffic rather than falling back to DOM. The only acceptable DOM uses are:
- **\`isReady()\`** — checking auth indicators (e.g., a logged-in avatar)
- **URL hash navigation** — changing views via \`window.location.hash\`
- **Last-resort compose flows** — when no API exists for creating content (extremely rare)

## Token Persistence

Module-level variables (\`let cachedAuth = null\`) are reset when the Chrome extension reloads and re-injects the adapter IIFE. If the host app has already deleted the token from localStorage by this point, the plugin becomes unavailable.

Persist auth tokens to \`globalThis.__openTabs.tokenCache.<pluginName>\`, which survives adapter re-injection (the page itself is not reloaded — only the IIFE is re-executed).

\`\`\`typescript
const getPersistedToken = (): string | null => {
  try {
    const ns = (globalThis as Record<string, unknown>).__openTabs as
      | Record<string, unknown>
      | undefined;
    const cache = ns?.tokenCache as
      | Record<string, string | undefined>
      | undefined;
    return cache?.myPlugin ?? null;
  } catch {
    return null;
  }
};

const setPersistedToken = (token: string): void => {
  try {
    const g = globalThis as Record<string, unknown>;
    if (!g.__openTabs) g.__openTabs = {};
    const ns = g.__openTabs as Record<string, unknown>;
    if (!ns.tokenCache) ns.tokenCache = {};
    const cache = ns.tokenCache as Record<string, string | undefined>;
    cache.myPlugin = token;
  } catch {}
};

const clearPersistedToken = (): void => {
  try {
    const ns = (globalThis as Record<string, unknown>).__openTabs as
      | Record<string, unknown>
      | undefined;
    const cache = ns?.tokenCache as
      | Record<string, string | undefined>
      | undefined;
    if (cache) cache.myPlugin = undefined;
  } catch {}
};

// In getAuth():
const getAuth = (): Auth | null => {
  const persisted = getPersistedToken();
  if (persisted) return { token: persisted };

  const raw = readLocalStorage('token');
  if (!raw) return null;
  setPersistedToken(raw);
  return { token: raw };
};
\`\`\`

Always clear the persisted token on 401 responses to handle token rotation.

## Adapter Injection Timing

Adapters are injected at **two points** during page load:

1. **\`loading\`** — before page JavaScript runs. The adapter IIFE registers on \`globalThis.__openTabs\` and can read localStorage/cookies before the host app modifies them.
2. **\`complete\`** — after the page is fully loaded. The adapter is re-injected (idempotent) and \`isReady()\` is probed to determine tab state.

This means:
- \`isReady()\` may be called at both injection points. At \`loading\` time, page globals do not exist yet — return \`false\` gracefully. At \`complete\` time, everything is ready.
- Auth tokens from localStorage should be cached at \`loading\` time before the host app can delete them.

## Advanced Auth Patterns

### XHR/Fetch Interception

Some web apps use internal RPC endpoints or obfuscated API paths that are hard to discover via network capture. Monkey-patch \`XMLHttpRequest\` to intercept all API traffic and capture auth headers at runtime.

\`\`\`typescript
const origOpen = XMLHttpRequest.prototype.open;
const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
const origSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method: string, url: string) {
  (this as Record<string, unknown>)._url = url;
  (this as Record<string, unknown>)._method = method;
  return origOpen.apply(this, arguments as unknown as Parameters<typeof origOpen>);
};
XMLHttpRequest.prototype.setRequestHeader = function (name: string, value: string) {
  if (name.toLowerCase() === 'authorization') {
    setPersistedToken(value); // Capture auth header
  }
  return origSetHeader.apply(this, arguments as unknown as Parameters<typeof origSetHeader>);
};
\`\`\`

Install the interceptor at adapter load time to capture auth tokens from early boot requests. Store captured tokens on \`globalThis\` so they survive adapter re-injection.

### Cookie-Based Auth with CSRF

Many web apps use HttpOnly session cookies for auth but require a CSRF token for write operations. The CSRF token is typically in a non-HttpOnly cookie (e.g., \`csrftoken\`, \`sentry-sc\`).

\`\`\`typescript
const csrfToken = getCookie('csrftoken');
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken ?? '',
  },
  body: JSON.stringify(payload),
  credentials: 'include', // HttpOnly cookies sent automatically
});
\`\`\`

Check \`window.__initialData.csrfCookieName\` or similar bootstrap globals to discover the cookie name. GET requests work without the CSRF token.

### Opaque Auth Headers

Some apps compute cryptographic auth tokens via obfuscated JavaScript. These tokens cannot be generated — only captured and replayed. Use the XHR interceptor pattern above to capture them, then implement a polling wait:

\`\`\`typescript
const waitForToken = async (): Promise<string> => {
  for (let i = 0; i < 50; i++) {
    const token = getPersistedToken();
    if (token) return token;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw ToolError.auth('Auth token not captured — try refreshing the page');
};
\`\`\`

If a write operation returns 200 but the action does not take effect, the cryptographic token may be missing or stale. Capture and replay the token using the XHR interceptor pattern above.

### Extension/Programmatic APIs

When standard API paths are blocked (undocumented crypto tokens, deprecated endpoints), complex web apps often expose higher-level programmatic interfaces:

- Internal extension APIs on \`window\` (compose, send, draft management)
- JavaScript-exposed infrastructure for accessibility or testing
- \`webpackChunk\`-based module access to internal stores

Discovery: use \`browser_execute_script\` with \`Object.keys(window).filter(k => !['location', 'chrome', 'document', 'navigator'].includes(k))\` to find non-standard globals, then explore their methods.

### API Deprecation

Internal API endpoints can be deprecated without warning. When multiple API generations exist, test each endpoint independently. If an endpoint returns 404 or 403 unexpectedly, it may be deprecated for that account or region. Remove tools that depend on deprecated endpoints rather than shipping broken tools.

## CSP Considerations

The adapter IIFE bypasses the page's Content Security Policy via file-based injection (\`chrome.scripting.executeScript({ files: [...] })\`). Plugin code runs as extension-origin code and is not subject to inline script restrictions.

**Trusted Types**: Some pages enforce Trusted Types CSP, which blocks \`innerHTML\`, \`outerHTML\`, and \`insertAdjacentHTML\`. If you need to extract text from HTML strings, use regex instead:

\`\`\`typescript
const text = html.replace(/<[^>]+>/g, '');
\`\`\`
`;
