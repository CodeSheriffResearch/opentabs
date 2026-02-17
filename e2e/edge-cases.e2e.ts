/**
 * Edge-case E2E tests — concurrent dispatch, extension reload, multi-tab,
 * tab navigation away, and tool calls during reconnect.
 *
 * These tests cover critical untested scenarios that verify the platform
 * handles real-world edge cases gracefully.
 *
 * Prerequisites (all pre-built, not created at test time):
 *   - `bun run build` has been run (platform dist/ files exist)
 *   - `plugins/e2e-test` has been built (`cd plugins/e2e-test && bun run build`)
 *   - Chromium is installed for Playwright
 *
 * All tests use dynamic ports and are safe for parallel execution.
 */

import { test, expect, fetchWsUrl } from './fixtures.js';
import {
  waitForLog,
  waitForExtensionConnected,
  waitForExtensionDisconnected,
  openTestAppTab,
  parseToolResult,
  waitForToolResult,
  setupToolTest,
  callToolExpectSuccess,
} from './helpers.js';

// ---------------------------------------------------------------------------
// Concurrent tool dispatch
// ---------------------------------------------------------------------------

test.describe('Concurrent tool dispatch', () => {
  test('3-5 concurrent tool calls via Promise.all return correct results without interleaving', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    test.slow();

    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Fire 5 different tool calls concurrently
    const results = await Promise.all([
      mcpClient.callTool('e2e-test_echo', { message: 'concurrent-1' }),
      mcpClient.callTool('e2e-test_echo', { message: 'concurrent-2' }),
      mcpClient.callTool('e2e-test_greet', { name: 'Concurrent' }),
      mcpClient.callTool('e2e-test_get_status', {}),
      mcpClient.callTool('e2e-test_list_items', { limit: 2 }),
    ]);

    // All should succeed
    for (const result of results) {
      expect(result.isError).toBe(false);
    }

    // Verify each result matches its specific tool call (no interleaving)
    const echo1 = parseToolResult(results[0].content);
    expect(echo1.message).toBe('concurrent-1');

    const echo2 = parseToolResult(results[1].content);
    expect(echo2.message).toBe('concurrent-2');

    const greet = parseToolResult(results[2].content);
    expect(greet.greeting).toBe('Hello, Concurrent!');

    const status = parseToolResult(results[3].content);
    expect(status.version).toBe('1.0.0-test');

    const list = parseToolResult(results[4].content);
    expect(Array.isArray(list.items)).toBe(true);
    expect((list.items as unknown[]).length).toBe(2);

    // Verify the test server recorded all invocations
    const invocations = await testServer.invocations();
    const toolInvocations = invocations.filter(i => i.path !== '/api/auth.check');
    const echoCalls = toolInvocations.filter(i => i.path === '/api/echo');
    const greetCalls = toolInvocations.filter(i => i.path === '/api/greet');
    const statusCalls = toolInvocations.filter(i => i.path === '/api/status');
    const listCalls = toolInvocations.filter(i => i.path === '/api/list-items');

    expect(echoCalls.length).toBeGreaterThanOrEqual(2);
    expect(greetCalls.length).toBeGreaterThanOrEqual(1);
    expect(statusCalls.length).toBeGreaterThanOrEqual(1);
    expect(listCalls.length).toBeGreaterThanOrEqual(1);

    await page.close();
  });

  test('concurrent calls to the same tool with different args return distinct results', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Fire 4 echo calls concurrently with unique messages
    const messages = ['alpha', 'bravo', 'charlie', 'delta'];
    const results = await Promise.all(messages.map(msg => mcpClient.callTool('e2e-test_echo', { message: msg })));

    // All should succeed
    for (const result of results) {
      expect(result.isError).toBe(false);
    }

    // Each result should contain the correct message (no cross-contamination)
    const receivedMessages = results.map(r => (parseToolResult(r.content) as { message: string }).message);

    for (const msg of messages) {
      expect(receivedMessages).toContain(msg);
    }

    // Verify 1:1 mapping (each position returns its own message)
    for (let i = 0; i < messages.length; i++) {
      const result = results[i];
      if (!result) throw new Error(`Missing result at index ${i}`);
      const parsed = parseToolResult(result.content);
      expect(parsed.message).toBe(messages[i]);
    }

    await page.close();
  });
});

// ---------------------------------------------------------------------------
// extension_reload tool
// ---------------------------------------------------------------------------

test.describe('extension_reload tool', () => {
  test('extension_reload: sends reload signal and extension disconnects', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Verify tools work before reload
    const beforeOutput = await callToolExpectSuccess(mcpClient, mcpServer, 'e2e-test_echo', {
      message: 'before reload',
    });
    expect(beforeOutput.message).toBe('before reload');

    // Call extension_reload — the extension sends a response then reloads after 100ms
    const reloadResult = await mcpClient.callTool('extension_reload');
    expect(reloadResult.isError).toBe(false);

    // The extension should disconnect after receiving the reload signal.
    // chrome.runtime.reload() terminates the service worker; Playwright's
    // Chromium does not restart it, so we only verify the disconnect.
    await waitForExtensionDisconnected(mcpServer, 15_000);

    await page.close();
  });
});

// ---------------------------------------------------------------------------
// Multi-tab — same plugin, two tabs
// ---------------------------------------------------------------------------

test.describe('Multi-tab same plugin', () => {
  test('two tabs matching same plugin URL are both tracked, dispatch works on either', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    test.slow();

    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');
    await testServer.reset();

    // Open first tab
    const page1 = await openTestAppTab(extensionContext, testServer.url, mcpServer, testServer);
    await waitForToolResult(mcpClient, 'e2e-test_get_status', {}, { isError: false }, 15_000);

    // Tool works with first tab
    const output1 = await callToolExpectSuccess(mcpClient, mcpServer, 'e2e-test_echo', { message: 'tab-1' });
    expect(output1.message).toBe('tab-1');

    // Open second tab to same URL
    const page2 = await openTestAppTab(extensionContext, testServer.url, mcpServer, testServer);

    // Tool should still work (dispatches to one of the matching tabs)
    const output2 = await callToolExpectSuccess(mcpClient, mcpServer, 'e2e-test_echo', { message: 'multi-tab' });
    expect(output2.message).toBe('multi-tab');

    // Close first tab — tool should still work via second tab
    await page1.close();

    // Poll until the tool succeeds via the second tab
    const afterClose = await waitForToolResult(
      mcpClient,
      'e2e-test_echo',
      { message: 'after-close-tab1' },
      { isError: false },
      15_000,
    );
    const afterCloseOutput = parseToolResult(afterClose.content);
    expect(afterCloseOutput.message).toBe('after-close-tab1');

    // Close second tab — tool should now fail (no matching tabs)
    await page2.close();

    // Poll until the tool fails
    const afterCloseAll = await waitForToolResult(
      mcpClient,
      'e2e-test_echo',
      { message: 'after-close-all' },
      { isError: true },
      15_000,
    );
    expect(afterCloseAll.isError).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tab navigates away from matching URL
// ---------------------------------------------------------------------------

test.describe('Tab navigates away', () => {
  test('navigate matched tab to non-matching URL, tool becomes unavailable', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Tool works while tab is on matching URL
    const okOutput = await callToolExpectSuccess(mcpClient, mcpServer, 'e2e-test_echo', { message: 'before-nav' });
    expect(okOutput.message).toBe('before-nav');

    // Navigate the tab to a non-matching URL (example.com is not localhost)
    await page.goto('https://example.com', { waitUntil: 'load', timeout: 15_000 });

    // Poll until the tool fails (tab no longer matches plugin URL pattern)
    const failResult = await waitForToolResult(
      mcpClient,
      'e2e-test_echo',
      { message: 'after-nav-away' },
      { isError: true },
      15_000,
    );
    expect(failResult.isError).toBe(true);

    // Navigate back to the test server URL
    await page.goto(testServer.url, { waitUntil: 'load', timeout: 15_000 });

    // Wait for the adapter to be re-injected
    await page.waitForFunction(
      () => {
        const ot = (globalThis as Record<string, unknown>).__openTabs as
          | { adapters?: Record<string, unknown> }
          | undefined;
        return ot?.adapters?.['e2e-test'] !== undefined;
      },
      { timeout: 15_000 },
    );

    // Poll until the tool works again
    const recoveredResult = await waitForToolResult(
      mcpClient,
      'e2e-test_echo',
      { message: 'after-nav-back' },
      { isError: false },
      15_000,
    );
    const recoveredOutput = parseToolResult(recoveredResult.content);
    expect(recoveredOutput.message).toBe('after-nav-back');

    await page.close();
  });
});

// ---------------------------------------------------------------------------
// Tool call during extension reconnect window
// ---------------------------------------------------------------------------

test.describe('Tool call during reconnect window', () => {
  test('tool call when extension is disconnected returns clean error, not 30s timeout', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    // Steal the extension's WebSocket slot with a fake client to disconnect the real extension
    mcpServer.logs.length = 0;
    const wsUrl = await fetchWsUrl(mcpServer.port);
    const fakeWs = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      fakeWs.onopen = () => resolve();
      fakeWs.onerror = () => reject(new Error('WebSocket connect failed'));
      setTimeout(() => reject(new Error('WebSocket connect timeout')), 5_000);
    });

    // Wait for server to recognize the replacement
    await waitForLog(mcpServer, 'Closing previous extension WebSocket', 5_000);

    // Close the fake client too — server now has no extension
    fakeWs.close();

    // Wait until the server reports no extension connected
    await waitForExtensionDisconnected(mcpServer, 5_000);

    // Call a tool while the extension is disconnected.
    // Should return a clean error quickly (not hang for 30s dispatch timeout).
    const start = Date.now();
    const result = await mcpClient.callTool('e2e-test_echo', { message: 'during-reconnect' });
    const elapsed = Date.now() - start;

    expect(result.isError).toBe(true);
    expect(result.content).toContain('Extension not connected');

    // The error should come back quickly (well under the 30s dispatch timeout)
    expect(elapsed).toBeLessThan(10_000);

    // Wait for the real extension to reconnect for clean teardown
    await waitForExtensionConnected(mcpServer, 45_000);
  });

  test('browser_list_tabs during reconnect returns Extension not connected', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    // Disconnect the extension by stealing the WS slot
    mcpServer.logs.length = 0;
    const wsUrl = await fetchWsUrl(mcpServer.port);
    const fakeWs = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      fakeWs.onopen = () => resolve();
      fakeWs.onerror = () => reject(new Error('WebSocket connect failed'));
      setTimeout(() => reject(new Error('WebSocket connect timeout')), 5_000);
    });
    await waitForLog(mcpServer, 'Closing previous extension WebSocket', 5_000);
    fakeWs.close();
    await waitForExtensionDisconnected(mcpServer, 5_000);

    // Browser tool should also fail cleanly when extension is disconnected
    const result = await mcpClient.callTool('browser_list_tabs');
    expect(result.isError).toBe(true);
    expect(result.content).toContain('Extension not connected');

    // Wait for extension to reconnect for clean teardown
    await waitForExtensionConnected(mcpServer, 45_000);
  });
});

// ---------------------------------------------------------------------------
// Tool dispatch timeout (extension-side 25s script timeout)
// ---------------------------------------------------------------------------

test.describe('Tool dispatch timeout', () => {
  test('tool call exceeding SCRIPT_TIMEOUT_MS returns a clean timeout error', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    // This test waits 25+ seconds for the timeout to fire
    test.slow();

    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Verify the tool works normally before adding the delay
    const okOutput = await callToolExpectSuccess(mcpClient, mcpServer, 'e2e-test_echo', { message: 'pre-timeout' });
    expect(okOutput.message).toBe('pre-timeout');

    // Set the test server delay to 27 seconds — longer than SCRIPT_TIMEOUT_MS (25s)
    // but shorter than DISPATCH_TIMEOUT_MS (30s), so the extension timeout fires first
    await testServer.setSlow(27_000);

    const start = Date.now();
    const result = await mcpClient.callTool('e2e-test_echo', { message: 'should-timeout' });
    const elapsed = Date.now() - start;

    // The extension-side timeout (25s) should produce a clean error
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('timed out');

    // Should take ~25s (the extension timeout), not 30s (the server timeout)
    expect(elapsed).toBeGreaterThan(20_000);
    expect(elapsed).toBeLessThan(29_000);

    // Reset slow mode for clean teardown
    await testServer.setSlow(0);
    await page.close();
  });
});

// ---------------------------------------------------------------------------
// Tool input validation
// ---------------------------------------------------------------------------

test.describe('Tool input validation', () => {
  test('browser tool with wrong argument type returns Zod validation error', async ({ mcpClient }) => {
    // browser_navigate_tab expects { tabId: number, url: string }
    // Send tabId as a string instead of a number — Zod validation fires server-side
    const result = await mcpClient.callTool('browser_navigate_tab', {
      tabId: 'not-a-number',
      url: 'https://example.com',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('invalid');
  });

  test('browser tool with missing required field returns Zod validation error', async ({ mcpClient }) => {
    // browser_navigate_tab requires both tabId and url — omit url
    const result = await mcpClient.callTool('browser_navigate_tab', { tabId: 1 });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('invalid');
  });

  test('browser tool with unsafe URL scheme returns Zod validation error', async ({ mcpClient }) => {
    // browser_navigate_tab rejects javascript: URLs via safeUrl Zod refinement
    const result = await mcpClient.callTool('browser_navigate_tab', {
      tabId: 1,
      url: 'javascript:alert(1)',
    });
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('url');
  });

  test('plugin tool with missing required field still dispatches (no server-side validation)', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // e2e-test_echo expects { message: string } but we omit it
    // Plugin tools have no server-side Zod validation — the adapter receives raw args
    const result = await mcpClient.callTool('e2e-test_echo', {});
    expect(result.isError).toBe(false);
    // The test server returns { message: "" } for missing/undefined message field
    const output = parseToolResult(result.content);
    expect(output.message).toBe('');

    await page.close();
  });

  test('nonexistent tool returns clean error', async ({ mcpClient }) => {
    const result = await mcpClient.callTool('nonexistent_tool', {});
    expect(result.isError).toBe(true);
    expect(result.content.toLowerCase()).toContain('not found');
  });
});
