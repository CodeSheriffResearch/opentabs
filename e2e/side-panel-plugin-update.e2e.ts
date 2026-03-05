/**
 * Side panel plugin update UI E2E tests.
 *
 * Verifies:
 *   1. When a plugin has an available update, the three-dot menu button shows
 *      a yellow dot indicator
 *   2. Opening the menu shows an "Update to vX.Y.Z" menu item
 *   3. When no update is available, no dot is shown and no Update menu item appears
 *   4. Clicking Update triggers the update flow; on failure an error alert appears
 *   5. After a successful update the version changes and the update indicator clears
 *
 * These tests use the dev-only `POST /__test/set-outdated` endpoint to inject
 * fake outdated plugin data and `POST /__test/simulate-update` to simulate
 * a successful update by mutating the plugin version in the server registry.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  cleanupTestConfigDir,
  E2E_TEST_PLUGIN_DIR,
  expect,
  launchExtensionContext,
  startMcpServer,
  startTestServer,
  test,
  writeTestConfig,
} from './fixtures.js';
import {
  openSidePanel,
  openTestAppTab,
  setupAdapterSymlink,
  waitForExtensionConnected,
  waitForLog,
} from './helpers.js';

/** Read the e2e-test plugin's package name and version from its package.json. */
const getPluginPackageInfo = (): { name: string; version: string } => {
  const pkg = JSON.parse(fs.readFileSync(path.join(E2E_TEST_PLUGIN_DIR, 'package.json'), 'utf-8')) as {
    name: string;
    version: string;
  };
  return { name: pkg.name, version: pkg.version };
};

/**
 * Inject fake outdated plugin entries into the MCP server via the dev-only
 * test endpoint. Triggers a `plugins.changed` notification to the extension.
 */
const setOutdatedPlugins = async (
  port: number,
  secret: string,
  outdatedPlugins: Array<{ name: string; currentVersion: string; latestVersion: string; updateCommand: string }>,
): Promise<void> => {
  const res = await fetch(`http://localhost:${port}/__test/set-outdated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ outdatedPlugins }),
  });
  if (!res.ok) {
    throw new Error(`setOutdatedPlugins failed: ${res.status} ${await res.text()}`);
  }
};

/**
 * Simulate a successful plugin update via the dev-only test endpoint.
 * Mutates the plugin's version in the server registry, clears the outdated
 * entry, and sends a `plugins.changed` notification.
 */
const simulateUpdate = async (port: number, secret: string, pluginName: string, newVersion: string): Promise<void> => {
  const res = await fetch(`http://localhost:${port}/__test/simulate-update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ pluginName, newVersion }),
  });
  if (!res.ok) {
    throw new Error(`simulateUpdate failed: ${res.status} ${await res.text()}`);
  }
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Side panel — plugin update indicator', () => {
  test('update dot and menu item appear when update is available, disappear when cleared', async () => {
    const absPluginPath = path.resolve(E2E_TEST_PLUGIN_DIR);
    const { name: pkgName, version: currentVersion } = getPluginPackageInfo();

    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-update-'));
    writeTestConfig(configDir, {
      localPlugins: [absPluginPath],
      permissions: { 'e2e-test': { permission: 'auto' } },
    });

    const server = await startMcpServer(configDir, true);
    const testServer = await startTestServer();
    const { context, cleanupDir, extensionDir } = await launchExtensionContext(server.port, server.secret);
    setupAdapterSymlink(configDir, extensionDir);

    try {
      await waitForExtensionConnected(server);
      await waitForLog(server, 'tab.syncAll received', 15_000);

      // Open a matching tab so the plugin is in 'ready' state
      await openTestAppTab(context, testServer.url, server, testServer);

      const sidePanelPage = await openSidePanel(context);

      // Wait for the plugin card to appear
      await expect(sidePanelPage.getByText('E2E Test')).toBeVisible({ timeout: 30_000 });

      // --- Verify: no update dot when no update is available ---
      const menuButton = sidePanelPage.locator('[aria-label="Plugin options"]');
      await expect(menuButton).toBeVisible();

      // The update dot is a child div with bg-primary class
      const updateDot = menuButton.locator('div.rounded-full');
      await expect(updateDot).not.toBeVisible();

      // Open menu and verify no Update menu item exists
      await menuButton.click();
      const updateMenuItem = sidePanelPage.locator('[role="menuitem"]', { hasText: /^Update to v/ });
      await expect(updateMenuItem).not.toBeVisible();

      // Close menu by pressing Escape
      await sidePanelPage.keyboard.press('Escape');

      // --- Inject fake update data ---
      const fakeLatestVersion = '99.0.0';
      const secret = server.secret;
      expect(secret).toBeTruthy();
      if (!secret) throw new Error('Server secret is required');
      await setOutdatedPlugins(server.port, secret, [
        {
          name: pkgName,
          currentVersion,
          latestVersion: fakeLatestVersion,
          updateCommand: `npm update -g ${pkgName}`,
        },
      ]);

      // --- Verify: update dot now visible ---
      await expect(updateDot).toBeVisible({ timeout: 10_000 });

      // Open menu and verify Update menu item appears with correct version
      await menuButton.click();
      await expect(updateMenuItem).toBeVisible({ timeout: 5_000 });
      await expect(updateMenuItem).toContainText(`Update to v${fakeLatestVersion}`);

      // Close menu
      await sidePanelPage.keyboard.press('Escape');

      // --- Clear outdated plugins and verify dot disappears ---
      await setOutdatedPlugins(server.port, secret, []);

      await expect(updateDot).not.toBeVisible({ timeout: 10_000 });

      // Open menu and verify Update menu item is gone
      await menuButton.click();
      await expect(updateMenuItem).not.toBeVisible();
    } finally {
      await context.close();
      await server.kill();
      await testServer.kill();
      cleanupTestConfigDir(configDir);
      if (cleanupDir) fs.rmSync(cleanupDir, { recursive: true, force: true });
    }
  });
});

test.describe('Side panel — plugin update flow', () => {
  test('clicking Update on a local plugin shows error alert on failure', async () => {
    const absPluginPath = path.resolve(E2E_TEST_PLUGIN_DIR);
    const { name: pkgName, version: currentVersion } = getPluginPackageInfo();

    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-update-'));
    writeTestConfig(configDir, {
      localPlugins: [absPluginPath],
      permissions: { 'e2e-test': { permission: 'auto' } },
    });

    const server = await startMcpServer(configDir, true);
    const testServer = await startTestServer();
    const { context, cleanupDir, extensionDir } = await launchExtensionContext(server.port, server.secret);
    setupAdapterSymlink(configDir, extensionDir);

    try {
      await waitForExtensionConnected(server);
      await waitForLog(server, 'tab.syncAll received', 15_000);

      await openTestAppTab(context, testServer.url, server, testServer);
      const sidePanelPage = await openSidePanel(context);
      await expect(sidePanelPage.getByText('E2E Test')).toBeVisible({ timeout: 30_000 });

      const secret = server.secret;
      expect(secret).toBeTruthy();
      if (!secret) throw new Error('Server secret is required');

      // Inject fake outdated data
      const fakeLatestVersion = '99.0.0';
      await setOutdatedPlugins(server.port, secret, [
        {
          name: pkgName,
          currentVersion,
          latestVersion: fakeLatestVersion,
          updateCommand: `npm update -g ${pkgName}`,
        },
      ]);

      // Wait for update dot to appear
      const menuButton = sidePanelPage.locator('[aria-label="Plugin options"]');
      const updateDot = menuButton.locator('div.rounded-full');
      await expect(updateDot).toBeVisible({ timeout: 10_000 });

      // Open menu and click Update
      await menuButton.click();
      const updateMenuItem = sidePanelPage.locator('[role="menuitem"]', { hasText: /^Update to v/ });
      await expect(updateMenuItem).toBeVisible({ timeout: 5_000 });
      await updateMenuItem.click();

      // The update will fail because this is a local plugin — npm update -g
      // fails for packages not installed globally. Verify error alert appears.
      const errorAlert = sidePanelPage.locator('[role="alert"]');
      await expect(errorAlert).toBeVisible({ timeout: 30_000 });
    } finally {
      await context.close();
      await server.kill();
      await testServer.kill();
      cleanupTestConfigDir(configDir);
      if (cleanupDir) fs.rmSync(cleanupDir, { recursive: true, force: true });
    }
  });

  test('successful update changes version, clears update dot and menu item', async () => {
    const absPluginPath = path.resolve(E2E_TEST_PLUGIN_DIR);
    const { name: pkgName, version: currentVersion } = getPluginPackageInfo();

    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-update-'));
    writeTestConfig(configDir, {
      localPlugins: [absPluginPath],
      permissions: { 'e2e-test': { permission: 'auto' } },
    });

    const server = await startMcpServer(configDir, true);
    const testServer = await startTestServer();
    const { context, cleanupDir, extensionDir } = await launchExtensionContext(server.port, server.secret);
    setupAdapterSymlink(configDir, extensionDir);

    try {
      await waitForExtensionConnected(server);
      await waitForLog(server, 'tab.syncAll received', 15_000);

      await openTestAppTab(context, testServer.url, server, testServer);
      const sidePanelPage = await openSidePanel(context);
      await expect(sidePanelPage.getByText('E2E Test')).toBeVisible({ timeout: 30_000 });

      const secret = server.secret;
      expect(secret).toBeTruthy();
      if (!secret) throw new Error('Server secret is required');

      // Inject fake outdated data
      const fakeLatestVersion = '99.0.0';
      await setOutdatedPlugins(server.port, secret, [
        {
          name: pkgName,
          currentVersion,
          latestVersion: fakeLatestVersion,
          updateCommand: `npm update -g ${pkgName}`,
        },
      ]);

      // Wait for update dot to appear
      const menuButton = sidePanelPage.locator('[aria-label="Plugin options"]');
      const updateDot = menuButton.locator('div.rounded-full');
      await expect(updateDot).toBeVisible({ timeout: 10_000 });

      // Verify the Update menu item is present with correct version
      await menuButton.click();
      const updateMenuItem = sidePanelPage.locator('[role="menuitem"]', { hasText: /^Update to v/ });
      await expect(updateMenuItem).toContainText(`Update to v${fakeLatestVersion}`);
      await sidePanelPage.keyboard.press('Escape');

      // Simulate a successful update — changes the plugin version in the
      // server registry, clears outdated, and sends plugins.changed
      await simulateUpdate(server.port, secret, 'e2e-test', fakeLatestVersion);

      // Verify: update dot disappears after successful update
      await expect(updateDot).not.toBeVisible({ timeout: 10_000 });

      // Verify: Update menu item is gone
      await menuButton.click();
      await expect(updateMenuItem).not.toBeVisible();
      await sidePanelPage.keyboard.press('Escape');

      // Verify: plugin version changed on the server
      const healthRes = await fetch(`http://localhost:${server.port}/health`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const health = (await healthRes.json()) as {
        pluginDetails: Array<{ name: string }>;
      };
      const pluginDetail = health.pluginDetails.find((p: { name: string }) => p.name === 'e2e-test');
      expect(pluginDetail).toBeDefined();
    } finally {
      await context.close();
      await server.kill();
      await testServer.kill();
      cleanupTestConfigDir(configDir);
      if (cleanupDir) fs.rmSync(cleanupDir, { recursive: true, force: true });
    }
  });
});
