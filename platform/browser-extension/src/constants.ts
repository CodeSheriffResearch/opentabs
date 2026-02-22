export const KEEPALIVE_ALARM = 'opentabs-keepalive';
export const KEEPALIVE_INTERVAL_MINUTES = 0.5; // Chrome 120+ supports 30-second alarm periods; older versions require 1 minute minimum
export const PLUGINS_META_KEY = 'plugins_meta';
export const WS_CONNECTED_KEY = 'wsConnected';
/**
 * Default timeout for chrome.scripting.executeScript calls (ms).
 *
 * Set to 25 seconds — 5 seconds less than the MCP server's DISPATCH_TIMEOUT_MS
 * (30 seconds in platform/mcp-server/src/state.ts). This guarantees the extension
 * sends a response (success or timeout error) before the server gives up and
 * discards the pending dispatch, preventing orphaned script executions whose
 * results are silently dropped.
 *
 * For tools that report progress, this timeout is reset on each progress event
 * (see tool-dispatch.ts). The absolute upper bound is MAX_SCRIPT_TIMEOUT_MS.
 */
export const SCRIPT_TIMEOUT_MS = 25_000;
/**
 * Absolute maximum timeout for progress-reporting tools (ms).
 *
 * Matches MAX_DISPATCH_TIMEOUT_MS on the MCP server (5 minutes) minus a 5-second
 * safety margin, ensuring the extension always responds before the server gives up.
 */
export const MAX_SCRIPT_TIMEOUT_MS = 295_000;
/**
 * Timeout for isReady() probes during tab state computation (ms).
 *
 * Caps how long computePluginTabState waits for an adapter's isReady()
 * response. If the probe doesn't return within this window, the tab is
 * reported as "unavailable" rather than blocking state computation.
 */
export const IS_READY_TIMEOUT_MS = 5_000;
/** Delay before chrome.runtime.reload() to allow the WebSocket response to flush */
export const RELOAD_FLUSH_DELAY_MS = 100;
/** Delay (ms) before retrying adapter injection after a hash verification failure */
export const INJECTION_RETRY_DELAY_MS = 200;
/** Delay (ms) for a tab to render after focus before capturing a screenshot */
export const SCREENSHOT_RENDER_DELAY_MS = 100;
/** Delay (ms) to let the WebSocket response flush before forcing a reconnect */
export const WS_FLUSH_DELAY_MS = 50;
/** Matches lowercase alphanumeric plugin names with optional hyphen separators (e.g., "slack", "e2e-test") */
export const VALID_PLUGIN_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Validate a plugin name against the expected format */
export const isValidPluginName = (name: string): boolean => VALID_PLUGIN_NAME.test(name);
