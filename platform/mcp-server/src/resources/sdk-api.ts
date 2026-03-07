/** SDK API Reference resource content. */

export const SDK_API_CONTENT = `# SDK API Reference

All exports from \`@opentabs-dev/plugin-sdk\`. Utilities run in the browser page context.

## Core Classes

### OpenTabsPlugin

Abstract base class for all plugins. Extend and export a singleton instance.

\`\`\`typescript
abstract class OpenTabsPlugin {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly description: string;
  abstract readonly urlPatterns: string[];
  abstract readonly tools: ToolDefinition[];
  abstract isReady(): Promise<boolean>;

  // Optional lifecycle hooks
  teardown?(): void;
  onActivate?(): void;
  onDeactivate?(): void;
  onNavigate?(url: string): void;
  onToolInvocationStart?(toolName: string): void;
  onToolInvocationEnd?(toolName: string, success: boolean, durationMs: number): void;
}
\`\`\`

### defineTool

Type-safe factory for tool definitions:

\`\`\`typescript
function defineTool<TInput, TOutput>(config: ToolDefinition<TInput, TOutput>): ToolDefinition<TInput, TOutput>
\`\`\`

### ToolDefinition

\`\`\`typescript
interface ToolDefinition<TInput, TOutput> {
  name: string;
  displayName?: string;
  description: string;
  summary?: string;
  icon?: LucideIconName;   // Lucide icon in kebab-case (default: 'wrench')
  group?: string;
  input: TInput;           // Zod object schema
  output: TOutput;         // Zod schema
  handle(params: z.infer<TInput>, context?: ToolHandlerContext): Promise<z.infer<TOutput>>;
}
\`\`\`

### ToolHandlerContext

\`\`\`typescript
interface ToolHandlerContext {
  reportProgress(opts: { progress?: number; total?: number; message?: string }): void;
}
\`\`\`

## DOM Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| \`waitForSelector\` | \`<T extends Element>(selector, opts?) => Promise<T>\` | Wait for element to appear (MutationObserver, default 10s) |
| \`waitForSelectorRemoval\` | \`(selector, opts?) => Promise<void>\` | Wait for element to be removed (default 10s) |
| \`querySelectorAll\` | \`<T extends Element>(selector) => T[]\` | Returns real array (not NodeList) |
| \`getTextContent\` | \`(selector) => string \\| null\` | Trimmed textContent of first match |
| \`observeDOM\` | \`(selector, callback, opts?) => () => void\` | MutationObserver, returns cleanup function |

Options: \`{ timeout?: number; signal?: AbortSignal }\` for wait functions. \`{ childList?: boolean; attributes?: boolean; subtree?: boolean }\` for observeDOM.

## Fetch Utilities

All fetch utilities use \`credentials: 'include'\` to leverage the page's authenticated session. Default timeout: 30s.

| Function | Signature | Description |
|----------|-----------|-------------|
| \`fetchFromPage\` | \`(url, init?) => Promise<Response>\` | Fetch with session cookies, throws ToolError on non-ok |
| \`fetchJSON\` | \`<T>(url, init?, schema?) => Promise<T>\` | GET + JSON parse. Optional Zod validation |
| \`postJSON\` | \`<T>(url, body, init?, schema?) => Promise<T>\` | POST JSON body + parse response |
| \`putJSON\` | \`<T>(url, body, init?, schema?) => Promise<T>\` | PUT JSON body + parse response |
| \`patchJSON\` | \`<T>(url, body, init?, schema?) => Promise<T>\` | PATCH JSON body + parse response |
| \`deleteJSON\` | \`<T>(url, init?, schema?) => Promise<T>\` | DELETE + parse response |
| \`postForm\` | \`<T>(url, body, init?, schema?) => Promise<T>\` | POST URL-encoded form (Record<string,string>) |
| \`postFormData\` | \`<T>(url, body, init?, schema?) => Promise<T>\` | POST multipart/form-data (FormData) |

When a Zod schema is passed as the last argument, the response is validated against it.

Helper functions:
- \`httpStatusToToolError(response, message)\` — maps HTTP status to ToolError category
- \`parseRetryAfterMs(value)\` — parses Retry-After header to milliseconds

Options extend \`RequestInit\` with \`{ timeout?: number }\`.

## Storage Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| \`getLocalStorage\` | \`(key) => string \\| null\` | Safe localStorage read (null on SecurityError) |
| \`setLocalStorage\` | \`(key, value) => void\` | Safe localStorage write |
| \`removeLocalStorage\` | \`(key) => void\` | Safe localStorage remove |
| \`getSessionStorage\` | \`(key) => string \\| null\` | Safe sessionStorage read |
| \`setSessionStorage\` | \`(key, value) => void\` | Safe sessionStorage write |
| \`removeSessionStorage\` | \`(key) => void\` | Safe sessionStorage remove |
| \`getCookie\` | \`(name) => string \\| null\` | Parse cookie by name from document.cookie |

All storage functions catch SecurityError (sandboxed iframes) and return null / no-op silently.

## Page State Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| \`getPageGlobal\` | \`(path) => unknown\` | Deep property access on globalThis via dot-notation (e.g., \`'app.auth.token'\`) |
| \`getCurrentUrl\` | \`() => string\` | Returns window.location.href |
| \`getPageTitle\` | \`() => string\` | Returns document.title |

\`getPageGlobal\` blocks access to \`__proto__\`, \`constructor\`, \`prototype\`.

## Timing Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| \`sleep\` | \`(ms, opts?) => Promise<void>\` | Promisified setTimeout. Options: \`{ signal?: AbortSignal }\` |
| \`retry\` | \`<T>(fn, opts?) => Promise<T>\` | Retry with configurable attempts, delay, backoff |
| \`waitUntil\` | \`(predicate, opts?) => Promise<void>\` | Poll predicate at interval until true |

**retry options:** \`{ maxAttempts?: 3, delay?: 1000, backoff?: false, maxDelay?: 30000, signal?: AbortSignal }\`

**waitUntil options:** \`{ interval?: 200, timeout?: 10000, signal?: AbortSignal }\`

## Logging

\`\`\`typescript
import { log } from '@opentabs-dev/plugin-sdk';

log.debug(message, ...args);
log.info(message, ...args);
log.warn(message, ...args);
log.error(message, ...args);
\`\`\`

Log entries route through the extension to the MCP server and connected clients. Falls back to \`console\` methods outside the adapter runtime. Args are safely serialized (handles circular refs, DOM nodes, functions).

## Error Handling

### ToolError

Structured error class with metadata for AI clients:

\`\`\`typescript
class ToolError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly retryAfterMs: number | undefined;
  readonly category: ErrorCategory | undefined;

  static auth(message, code?): ToolError;           // category: 'auth', not retryable
  static notFound(message, code?): ToolError;        // category: 'not_found', not retryable
  static rateLimited(message, retryAfterMs?, code?): ToolError;  // category: 'rate_limit', retryable
  static validation(message, code?): ToolError;      // category: 'validation', not retryable
  static timeout(message, code?): ToolError;         // category: 'timeout', retryable
  static internal(message, code?): ToolError;        // category: 'internal', not retryable
}
\`\`\`

\`ErrorCategory\`: \`'auth' | 'rate_limit' | 'not_found' | 'validation' | 'internal' | 'timeout'\`

## Lifecycle Hooks

Optional methods on \`OpenTabsPlugin\`:

| Hook | When Called |
|------|------------|
| \`onActivate()\` | After adapter registered on \`globalThis.__openTabs.adapters\` |
| \`onDeactivate()\` | Before adapter removal |
| \`teardown()\` | Before re-injection on plugin update |
| \`onNavigate(url)\` | On in-page URL changes (pushState, replaceState, popstate, hashchange) |
| \`onToolInvocationStart(toolName)\` | Before each tool handler call |
| \`onToolInvocationEnd(toolName, success, durationMs)\` | After each tool handler call |

Errors in hooks are caught and logged — they do not affect tool execution.

## Re-exports from @opentabs-dev/shared

| Export | Description |
|--------|-------------|
| \`ManifestTool\` | Tool metadata type for plugin manifests |
| \`Manifest\` | Complete plugin manifest type (\`PluginManifest\`) |
| \`validatePluginName(name)\` | Validates plugin name against \`NAME_REGEX\` and \`RESERVED_NAMES\` |
| \`validateUrlPattern(pattern)\` | Validates Chrome match patterns |
| \`NAME_REGEX\` | Regex for valid plugin names |
| \`RESERVED_NAMES\` | Set of reserved plugin names |
| \`LucideIconName\` | String literal union of valid Lucide icon names |
| \`LUCIDE_ICON_NAMES\` | Array of all valid Lucide icon names |
`;
