/**
 * Hot reload tool notification E2E tests — MCP client session level.
 *
 * These tests verify that existing MCP client sessions survive hot reloads
 * and continue to see correct tool lists. The existing lifecycle.e2e.ts tests
 * verify at the WebSocket/extension level; these tests verify at the MCP
 * streamable HTTP session level — the layer AI agents interact with.
 *
 * Key scenarios:
 *   1. Session survives hot reload and tools/list still returns correct tools
 *   2. Browser tools remain callable from an existing session after hot reload
 *   3. Plugin tools remain callable from an existing session after hot reload
 *   4. Multiple rapid hot reloads don't break an existing session
 *
 * Prerequisites (all pre-built, not created at test time):
 *   - `bun run build` has been run (platform dist/ files exist)
 *   - `plugins/e2e-test` has been built (`cd plugins/e2e-test && bun run build`)
 *   - Chromium is installed for Playwright
 *
 * All tests use dynamic ports and are safe for parallel execution.
 */

import { test, expect } from './fixtures.js';
import {
  waitForExtensionConnected,
  waitForLog,
  parseToolResult,
  BROWSER_TOOL_NAMES,
  openTestAppTab,
  waitForToolResult,
} from './helpers.js';

// ---------------------------------------------------------------------------
// Session survival across hot reloads
// ---------------------------------------------------------------------------

test.describe.serial('Hot reload — MCP session tool list', () => {
  test('existing session sees correct tool list after hot reload', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    // 1. Wait for extension to connect and full handshake
    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    // 2. Get baseline tool list (session auto-initialized by fixture)
    const toolsBefore = await mcpClient.listTools();
    const namesBefore = toolsBefore.map(t => t.name).sort();

    expect(namesBefore.length).toBeGreaterThan(0);

    // Verify browser tools are present
    for (const bt of BROWSER_TOOL_NAMES) {
      expect(namesBefore).toContain(bt);
    }

    // 3. Trigger hot reload
    mcpServer.logs.length = 0;
    mcpServer.triggerHotReload();

    // 4. Wait for hot reload to complete (extension reconnect + syncAll)
    await waitForLog(mcpServer, 'tab.syncAll received', 20_000);

    // Verify hot reload notified our session
    const logsJoined = mcpServer.logs.join('\n');
    expect(logsJoined).toMatch(/re-registered \d+\/\d+ session\(s\), notifying of tool list change/);

    // 5. List tools from the SAME session — should still work
    const toolsAfter = await mcpClient.listTools();
    const namesAfter = toolsAfter.map(t => t.name).sort();

    // Tool list should be identical (no tools added or removed by the reload)
    expect(namesAfter).toEqual(namesBefore);
  });

  test('browser tools are callable from existing session after hot reload', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    // Call a browser tool before reload to establish baseline
    const beforeResult = await mcpClient.callTool('browser_list_tabs');
    expect(beforeResult.isError).toBe(false);

    // Trigger hot reload
    mcpServer.logs.length = 0;
    mcpServer.triggerHotReload();
    await waitForLog(mcpServer, 'tab.syncAll received', 20_000);

    // Call the same browser tool from the SAME session after reload
    const afterResult = await mcpClient.callTool('browser_list_tabs');
    expect(afterResult.isError).toBe(false);

    const tabs = JSON.parse(afterResult.content) as Array<Record<string, unknown>>;
    expect(Array.isArray(tabs)).toBe(true);
    expect(tabs.length).toBeGreaterThan(0);
  });

  test('multiple rapid hot reloads do not break an existing MCP session', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    test.slow();

    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    const toolsBefore = await mcpClient.listTools();
    const countBefore = toolsBefore.length;

    // Trigger 3 rapid hot reloads
    for (let i = 1; i <= 3; i++) {
      mcpServer.logs.length = 0;
      mcpServer.triggerHotReload();
      await waitForLog(mcpServer, 'tab.syncAll received', 30_000);
    }

    // Session should still be alive and return the same tools
    const toolsAfter = await mcpClient.listTools();
    expect(toolsAfter.length).toBe(countBefore);

    // Browser tool should still be callable
    const listResult = await mcpClient.callTool('browser_list_tabs');
    expect(listResult.isError).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Plugin tool dispatch across hot reload
// ---------------------------------------------------------------------------

test.describe.serial('Hot reload — plugin tool dispatch', () => {
  test('plugin tool is callable from existing session after hot reload', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    test.slow();

    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');
    await testServer.reset();

    // Open the test app tab to get adapter injected
    const page = await openTestAppTab(extensionContext, testServer.url);

    // Poll until the tool is callable (tab state = ready)
    await waitForToolResult(mcpClient, 'e2e-test_get_status', {}, { isError: false }, 15_000);

    // Call plugin tool before reload
    const beforeResult = await mcpClient.callTool('e2e-test_echo', { message: 'before-reload' });
    expect(beforeResult.isError).toBe(false);
    const beforeOutput = parseToolResult(beforeResult.content);
    expect(beforeOutput.message).toBe('before-reload');

    // Trigger hot reload
    mcpServer.logs.length = 0;
    mcpServer.triggerHotReload();
    await waitForLog(mcpServer, 'tab.syncAll received', 20_000);

    // Poll until the tool is callable again (tab state re-settled after hot reload)
    await waitForToolResult(mcpClient, 'e2e-test_echo', { message: 'post-reload-check' }, { isError: false }, 15_000);

    // Call plugin tool from the SAME session after reload
    const afterResult = await mcpClient.callTool('e2e-test_echo', { message: 'after-reload' });
    expect(afterResult.isError).toBe(false);
    const afterOutput = parseToolResult(afterResult.content);
    expect(afterOutput.message).toBe('after-reload');

    await page.close();
  });
});

// ---------------------------------------------------------------------------
// Tool list consistency
// ---------------------------------------------------------------------------

test.describe('Hot reload — tool list consistency', () => {
  test('new MCP session after hot reload sees same tools as before', async ({
    mcpServer,
    extensionContext: _extensionContext,
    mcpClient,
  }) => {
    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    // Get tool list from auto-initialized session
    const toolsBefore = await mcpClient.listTools();
    const namesBefore = toolsBefore.map(t => t.name).sort();

    // Close session
    await mcpClient.close();

    // Trigger hot reload
    mcpServer.logs.length = 0;
    mcpServer.triggerHotReload();
    await waitForLog(mcpServer, 'tab.syncAll received', 20_000);

    // Create a fresh session (reuse the mcpClient object which creates a new session)
    mcpClient.resetSession();
    await mcpClient.initialize();
    const toolsAfter = await mcpClient.listTools();
    const namesAfter = toolsAfter.map(t => t.name).sort();

    expect(namesAfter).toEqual(namesBefore);
  });

  test('health endpoint reflects correct state after hot reload', async ({
    mcpServer,
    extensionContext: _extensionContext,
  }) => {
    await waitForExtensionConnected(mcpServer);
    await waitForLog(mcpServer, 'tab.syncAll received');

    const healthBefore = await mcpServer.health();
    expect(healthBefore).not.toBeNull();
    if (!healthBefore) throw new Error('health returned null');
    const pluginsBefore = healthBefore.plugins;

    // Hot reload
    mcpServer.logs.length = 0;
    mcpServer.triggerHotReload();
    await waitForLog(mcpServer, 'tab.syncAll received', 20_000);

    const healthAfter = await mcpServer.health();
    expect(healthAfter).not.toBeNull();
    if (!healthAfter) throw new Error('health returned null');

    // Extension should still be connected and plugin count unchanged
    expect(healthAfter.extensionConnected).toBe(true);
    expect(healthAfter.plugins).toBe(pluginsBefore);
  });
});
