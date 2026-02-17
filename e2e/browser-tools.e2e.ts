/**
 * Browser tools E2E tests — MCP client → MCP server → WebSocket → extension → chrome.tabs API.
 *
 * These tests exercise the browser tools that call chrome.* APIs directly
 * through the extension's background script, bypassing the plugin adapter
 * lifecycle entirely. Each tool dispatches a JSON-RPC command from the MCP
 * server to the extension via WebSocket and returns the result.
 *
 * Prerequisites (all pre-built, not created at test time):
 *   - `bun run build` has been run (platform dist/ files exist)
 *   - `plugins/e2e-test` has been built (`cd plugins/e2e-test && bun run build`)
 *   - Chromium is installed for Playwright
 *
 * All tests use dynamic ports and are safe for parallel execution.
 */

import { test, expect } from './fixtures.js';
import { waitForExtensionConnected, waitForLog, parseToolResult, waitFor } from './helpers.js';
import type { McpClient, McpServer, TestServer } from './fixtures.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wait for extension handshake and list tools.
 * Returns the tool list for further assertions.
 */
const initAndListTools = async (
  mcpServer: McpServer,
  mcpClient: McpClient,
): Promise<Array<{ name: string; description: string }>> => {
  await waitForExtensionConnected(mcpServer);
  await waitForLog(mcpServer, 'tab.syncAll received');
  return mcpClient.listTools();
};

/**
 * Open a tab to the test server via browser_open_tab, wait for load,
 * and return the tab ID. Uses the test server URL which is http://localhost
 * and accessible to the extension (unlike data: or chrome: URLs).
 */
const openTestServerTab = async (mcpClient: McpClient, testServer: TestServer): Promise<number> => {
  const openResult = await mcpClient.callTool('browser_open_tab', { url: testServer.url });
  expect(openResult.isError).toBe(false);
  const tabInfo = parseToolResult(openResult.content);
  const tabId = tabInfo.id as number;

  // Poll until the page finishes loading via browser_execute_script
  await waitFor(
    async () => {
      try {
        const result = await mcpClient.callTool('browser_execute_script', { tabId });
        if (result.isError) return false;
        const data = parseToolResult(result.content);
        const value = data.value as Record<string, unknown> | undefined;
        return value?.readyState === 'complete';
      } catch {
        return false;
      }
    },
    10_000,
    300,
    `tab ${tabId} readyState === complete`,
  );

  return tabId;
};

// ---------------------------------------------------------------------------
// Browser tools presence
// ---------------------------------------------------------------------------

test.describe('Browser tools — tool listing', () => {
  test('browser tools appear in tools/list', async ({ mcpServer, extensionContext: _extensionContext, mcpClient }) => {
    const tools = await initAndListTools(mcpServer, mcpClient);
    const toolNames = tools.map(t => t.name);

    expect(toolNames).toContain('browser_list_tabs');
    expect(toolNames).toContain('browser_open_tab');
    expect(toolNames).toContain('browser_close_tab');
    expect(toolNames).toContain('browser_navigate_tab');
    expect(toolNames).toContain('browser_execute_script');
    expect(toolNames).toContain('extension_reload');
  });
});

// ---------------------------------------------------------------------------
// browser_list_tabs
// ---------------------------------------------------------------------------

test.describe('browser_list_tabs', () => {
  test('returns an array of tab objects with id, title, url, active, windowId', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const result = await mcpClient.callTool('browser_list_tabs');
    expect(result.isError).toBe(false);

    const tabs = JSON.parse(result.content) as Array<Record<string, unknown>>;
    expect(Array.isArray(tabs)).toBe(true);
    expect(tabs.length).toBeGreaterThan(0);

    const firstTab = tabs[0];
    expect(firstTab).toBeDefined();
    if (!firstTab) throw new Error('No tabs returned');
    expect(firstTab).toHaveProperty('id');
    expect(firstTab).toHaveProperty('title');
    expect(firstTab).toHaveProperty('url');
    expect(firstTab).toHaveProperty('active');
    expect(firstTab).toHaveProperty('windowId');
    expect(typeof firstTab.id).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// browser_open_tab
// ---------------------------------------------------------------------------

test.describe('browser_open_tab', () => {
  test('creates a new tab and returns its info', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const result = await mcpClient.callTool('browser_open_tab', { url: 'https://example.com' });
    expect(result.isError).toBe(false);

    const tabInfo = parseToolResult(result.content);
    expect(tabInfo).toHaveProperty('id');
    expect(typeof tabInfo.id).toBe('number');
    expect(tabInfo).toHaveProperty('windowId');

    // Verify the tab appears in list_tabs
    const listResult = await mcpClient.callTool('browser_list_tabs');
    const tabs = JSON.parse(listResult.content) as Array<Record<string, unknown>>;
    const found = tabs.find(t => t.id === tabInfo.id);
    expect(found).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// browser_close_tab
// ---------------------------------------------------------------------------

test.describe('browser_close_tab', () => {
  test('closes a tab by ID and it disappears from tab list', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    // Open a tab first
    const openResult = await mcpClient.callTool('browser_open_tab', { url: 'https://example.com' });
    expect(openResult.isError).toBe(false);
    const tabInfo = parseToolResult(openResult.content);
    const tabId = tabInfo.id as number;

    // Close it
    const closeResult = await mcpClient.callTool('browser_close_tab', { tabId });
    expect(closeResult.isError).toBe(false);
    const closeData = parseToolResult(closeResult.content);
    expect(closeData.ok).toBe(true);

    // Verify it's gone from the list
    const listResult = await mcpClient.callTool('browser_list_tabs');
    const tabs = JSON.parse(listResult.content) as Array<Record<string, unknown>>;
    const found = tabs.find(t => t.id === tabId);
    expect(found).toBeUndefined();
  });

  test('closing a non-existent tab returns an error', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const result = await mcpClient.callTool('browser_close_tab', { tabId: 999999 });
    expect(result.isError).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// browser_navigate_tab
// ---------------------------------------------------------------------------

test.describe('browser_navigate_tab', () => {
  test('navigates an existing tab to a new URL', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    // Open a tab
    const openResult = await mcpClient.callTool('browser_open_tab', { url: 'https://example.com' });
    expect(openResult.isError).toBe(false);
    const tabInfo = parseToolResult(openResult.content);
    const tabId = tabInfo.id as number;

    // Navigate it
    const navResult = await mcpClient.callTool('browser_navigate_tab', {
      tabId,
      url: 'https://example.org',
    });
    expect(navResult.isError).toBe(false);
    const navData = parseToolResult(navResult.content);
    expect(navData.id).toBe(tabId);

    // Clean up
    await mcpClient.callTool('browser_close_tab', { tabId });
  });
});

// ---------------------------------------------------------------------------
// browser_execute_script
// ---------------------------------------------------------------------------

test.describe('browser_execute_script', () => {
  test('returns page info for an open tab', async ({
    mcpServer,
    testServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const tabId = await openTestServerTab(mcpClient, testServer);

    // Execute page inspection (no returnExpression)
    const execResult = await mcpClient.callTool('browser_execute_script', { tabId });
    if (execResult.isError) {
      throw new Error(`browser_execute_script failed: ${execResult.content}`);
    }

    const execData = parseToolResult(execResult.content);
    expect(execData).toHaveProperty('value');

    const value = execData.value as Record<string, unknown>;
    expect(value).toHaveProperty('title');
    expect(value).toHaveProperty('url');
    expect(value).toHaveProperty('readyState');
    expect(typeof value.title).toBe('string');
    expect(typeof value.url).toBe('string');

    await mcpClient.callTool('browser_close_tab', { tabId });
  });

  test('returnExpression extracts a specific DOM value', async ({
    mcpServer,
    testServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const tabId = await openTestServerTab(mcpClient, testServer);

    // Use returnExpression to get document.title
    const execResult = await mcpClient.callTool('browser_execute_script', {
      tabId,
      returnExpression: 'document.title',
    });
    expect(execResult.isError).toBe(false);

    const execData = parseToolResult(execResult.content);
    const value = execData.value as Record<string, unknown>;
    expect(value).toHaveProperty('expression', 'document.title');
    expect(value).toHaveProperty('expressionValue');
    expect(typeof value.expressionValue).toBe('string');
    // Page info baseline should also be present
    expect(value).toHaveProperty('title');
    expect(value).toHaveProperty('url');

    await mcpClient.callTool('browser_close_tab', { tabId });
  });

  test('invalid returnExpression root returns error info without failing', async ({
    mcpServer,
    testServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const tabId = await openTestServerTab(mcpClient, testServer);

    const execResult = await mcpClient.callTool('browser_execute_script', {
      tabId,
      returnExpression: 'nonexistent.property',
    });
    expect(execResult.isError).toBe(false);

    const execData = parseToolResult(execResult.content);
    const value = execData.value as Record<string, unknown>;
    expect(value).toHaveProperty('expressionError');
    // Page info baseline should still be present
    expect(value).toHaveProperty('title');

    await mcpClient.callTool('browser_close_tab', { tabId });
  });
});

// ---------------------------------------------------------------------------
// browser tools — open + navigate + close lifecycle
// ---------------------------------------------------------------------------

test.describe('Browser tools — tab lifecycle', () => {
  test('open → inspect → close: full tab lifecycle', async ({
    mcpServer,
    testServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    // 1. Open tab to the test server (http://localhost — accessible to extension)
    const tabId = await openTestServerTab(mcpClient, testServer);

    // 2. Inspect the page
    const execResult = await mcpClient.callTool('browser_execute_script', { tabId });
    expect(execResult.isError).toBe(false);

    // 3. Verify the tab appears in list
    const listResult = await mcpClient.callTool('browser_list_tabs');
    expect(listResult.isError).toBe(false);
    const tabs = JSON.parse(listResult.content) as Array<Record<string, unknown>>;
    expect(tabs.find(t => t.id === tabId)).toBeDefined();

    // 4. Close
    const closeResult = await mcpClient.callTool('browser_close_tab', { tabId });
    expect(closeResult.isError).toBe(false);

    // 5. Verify gone
    const listResult2 = await mcpClient.callTool('browser_list_tabs');
    const tabs2 = JSON.parse(listResult2.content) as Array<Record<string, unknown>>;
    expect(tabs2.find(t => t.id === tabId)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Browser tools — no extension connected
// ---------------------------------------------------------------------------

test.describe('Browser tools — extension not connected', () => {
  test('browser_list_tabs fails gracefully when extension is not connected', async ({
    mcpServer: _mcpServer,
    mcpClient,
  }) => {
    // Do NOT use extensionContext fixture — no extension launched
    const result = await mcpClient.callTool('browser_list_tabs');
    expect(result.isError).toBe(true);
    expect(result.content).toContain('Extension not connected');
  });
});

// ---------------------------------------------------------------------------
// Browser tools — URL validation (safe URL scheme enforcement)
// ---------------------------------------------------------------------------

test.describe('Browser tools — URL validation', () => {
  test('browser_navigate_tab rejects javascript: URL', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('browser_navigate_tab', {
      tabId: 1,
      url: 'javascript:alert(1)',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('browser_navigate_tab rejects data: URL', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('browser_navigate_tab', {
      tabId: 1,
      url: 'data:text/html,<h1>hi</h1>',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('browser_navigate_tab rejects file: URL', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('browser_navigate_tab', {
      tabId: 1,
      url: 'file:///etc/passwd',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('browser_open_tab rejects javascript: URL', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('browser_open_tab', {
      url: 'javascript:alert(1)',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('browser_open_tab rejects data: URL', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('browser_open_tab', {
      url: 'data:text/html,<h1>hi</h1>',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('browser_open_tab rejects file: URL', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('browser_open_tab', {
      url: 'file:///etc/passwd',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('browser_open_tab accepts valid https: URL', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await initAndListTools(mcpServer, mcpClient);

    const result = await mcpClient.callTool('browser_open_tab', { url: 'https://example.com' });
    expect(result.isError).toBe(false);

    const tabInfo = parseToolResult(result.content);
    expect(tabInfo).toHaveProperty('id');

    // Clean up
    await mcpClient.callTool('browser_close_tab', { tabId: tabInfo.id });
  });
});
