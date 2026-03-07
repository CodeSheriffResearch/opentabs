/**
 * E2E tests for MCP prompts capability.
 *
 * Verifies that the MCP server correctly handles prompts/list and prompts/get
 * requests through the full Streamable HTTP transport, including session
 * management and JSON-RPC framing.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  cleanupTestConfigDir,
  createMcpClient,
  E2E_TEST_PLUGIN_DIR,
  expect,
  startMcpServer,
  test,
  writeTestConfig,
} from './fixtures.js';

// ---------------------------------------------------------------------------
// Prompts E2E tests — server-only (no extension or browser needed)
// ---------------------------------------------------------------------------

test.describe('MCP prompts — prompts/list', () => {
  test('returns build_plugin prompt with arguments', async () => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-prompts-list-'));
    writeTestConfig(configDir, { localPlugins: [E2E_TEST_PLUGIN_DIR] });

    const server = await startMcpServer(configDir);
    const client = createMcpClient(server.port, server.secret);

    try {
      await client.initialize();

      const prompts = await client.listPrompts();

      expect(prompts.length).toBeGreaterThanOrEqual(1);

      const buildPlugin = prompts.find(p => p.name === 'build_plugin');
      expect(buildPlugin).toBeDefined();
      expect(buildPlugin?.description).toBeTruthy();
      expect(buildPlugin?.description).toContain('plugin');

      // Verify arguments
      const args = buildPlugin?.arguments ?? [];
      expect(args.length).toBeGreaterThanOrEqual(1);

      const urlArg = args.find(a => a.name === 'url');
      expect(urlArg).toBeDefined();
      expect(urlArg?.required).toBe(true);
      expect(urlArg?.description).toBeTruthy();

      const nameArg = args.find(a => a.name === 'name');
      expect(nameArg).toBeDefined();
      expect(nameArg?.required).toBe(false);
    } finally {
      await client.close();
      await server.kill();
      cleanupTestConfigDir(configDir);
    }
  });
});

test.describe('MCP prompts — prompts/get', () => {
  test('resolves build_plugin with url argument', async () => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-prompts-get-'));
    writeTestConfig(configDir, { localPlugins: [E2E_TEST_PLUGIN_DIR] });

    const server = await startMcpServer(configDir);
    const client = createMcpClient(server.port, server.secret);

    try {
      await client.initialize();

      const result = await client.getPrompt('build_plugin', { url: 'https://app.slack.com' });

      // Description reflects the target URL
      expect(result.description).toContain('https://app.slack.com');

      // First message is the workflow text, followed by embedded resource messages
      expect(result.messages.length).toBeGreaterThanOrEqual(1);
      const msg = result.messages[0];
      expect(msg).toBeDefined();
      expect(msg?.role).toBe('user');
      expect(msg?.content.type).toBe('text');

      // Message text contains the URL and key workflow elements
      const text = msg?.content.text ?? '';
      expect(text).toContain('https://app.slack.com');
      expect(text).toContain('plugin_analyze_site');
      expect(text).toContain('Phase 1');
      expect(text).toContain('Phase 2');
      expect(text).toContain('Phase 3');
      expect(text).toContain('Phase 4');
      expect(text).toContain('Phase 5');

      // Embedded resources: plugin-development guide and sdk-api reference
      const embeddedResources = result.messages.filter(
        (m: { content: { type: string } }) => m.content.type === 'resource',
      );
      expect(embeddedResources).toHaveLength(2);
    } finally {
      await client.close();
      await server.kill();
      cleanupTestConfigDir(configDir);
    }
  });

  test('resolves build_plugin with both url and name arguments', async () => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-prompts-get-name-'));
    writeTestConfig(configDir, { localPlugins: [E2E_TEST_PLUGIN_DIR] });

    const server = await startMcpServer(configDir);
    const client = createMcpClient(server.port, server.secret);

    try {
      await client.initialize();

      const result = await client.getPrompt('build_plugin', {
        url: 'https://linear.app',
        name: 'linear',
      });

      const text = result.messages[0]?.content.text ?? '';
      expect(text).toContain('https://linear.app');
      expect(text).toContain('`linear`');
    } finally {
      await client.close();
      await server.kill();
      cleanupTestConfigDir(configDir);
    }
  });

  test('resolves build_plugin with no arguments (uses defaults)', async () => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-prompts-get-defaults-'));
    writeTestConfig(configDir, { localPlugins: [E2E_TEST_PLUGIN_DIR] });

    const server = await startMcpServer(configDir);
    const client = createMcpClient(server.port, server.secret);

    try {
      await client.initialize();

      const result = await client.getPrompt('build_plugin', {});

      expect(result.description).toContain('https://example.com');
      expect(result.messages[0]?.content.text).toContain('https://example.com');
    } finally {
      await client.close();
      await server.kill();
      cleanupTestConfigDir(configDir);
    }
  });

  test('returns error for unknown prompt name', async () => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-prompts-get-unknown-'));
    writeTestConfig(configDir, { localPlugins: [E2E_TEST_PLUGIN_DIR] });

    const server = await startMcpServer(configDir);
    const client = createMcpClient(server.port, server.secret);

    try {
      await client.initialize();

      await expect(client.getPrompt('nonexistent_prompt', {})).rejects.toThrow();
    } finally {
      await client.close();
      await server.kill();
      cleanupTestConfigDir(configDir);
    }
  });
});

test.describe('MCP prompts — session lifecycle', () => {
  test('prompts are available immediately after initialize (no extension needed)', async () => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-prompts-lifecycle-'));
    // No plugins, no extension — prompts are a server-only capability
    writeTestConfig(configDir, { localPlugins: [] });

    const server = await startMcpServer(configDir);
    const client = createMcpClient(server.port, server.secret);

    try {
      await client.initialize();

      // prompts/list works without any extension connection
      const prompts = await client.listPrompts();
      expect(prompts.length).toBeGreaterThanOrEqual(1);

      // prompts/get works without any extension connection
      const result = await client.getPrompt('build_plugin', { url: 'https://github.com' });
      expect(result.messages.length).toBeGreaterThanOrEqual(1);
      expect(result.messages[0]?.content.text).toContain('https://github.com');
    } finally {
      await client.close();
      await server.kill();
      cleanupTestConfigDir(configDir);
    }
  });
});
