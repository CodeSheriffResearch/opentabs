import { getPluginsFromConfig, readConfig, resolvePluginPath } from './config.js';
import { afterAll, afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Test isolation: override config dir so tests don't touch real config
// ---------------------------------------------------------------------------

const TEST_BASE_DIR = mkdtempSync(join(tmpdir(), 'opentabs-cli-config-test-'));
const originalConfigDir = Bun.env.OPENTABS_CONFIG_DIR;
Bun.env.OPENTABS_CONFIG_DIR = TEST_BASE_DIR;

afterAll(() => {
  if (originalConfigDir !== undefined) {
    Bun.env.OPENTABS_CONFIG_DIR = originalConfigDir;
  } else {
    delete Bun.env.OPENTABS_CONFIG_DIR;
  }
  rmSync(TEST_BASE_DIR, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// readConfig
// ---------------------------------------------------------------------------

describe('readConfig', () => {
  const configPath = join(TEST_BASE_DIR, 'read-config-test.json');

  afterEach(async () => {
    try {
      await Bun.file(configPath).delete();
    } catch {
      // File may not exist
    }
  });

  test('returns null for missing file', async () => {
    const result = await readConfig(join(TEST_BASE_DIR, 'nonexistent.json'));
    expect(result).toBeNull();
  });

  test('returns config object for valid JSON object', async () => {
    await Bun.write(configPath, JSON.stringify({ plugins: [], tools: {}, secret: 'test' }));
    const result = await readConfig(configPath);
    expect(result).toEqual({ plugins: [], tools: {}, secret: 'test' });
  });

  test('returns null for JSON array', async () => {
    await Bun.write(configPath, JSON.stringify([1, 2, 3]));
    const result = await readConfig(configPath);
    expect(result).toBeNull();
  });

  test('returns null for JSON string', async () => {
    await Bun.write(configPath, JSON.stringify('hello'));
    const result = await readConfig(configPath);
    expect(result).toBeNull();
  });

  test('returns null for JSON number', async () => {
    await Bun.write(configPath, JSON.stringify(42));
    const result = await readConfig(configPath);
    expect(result).toBeNull();
  });

  test('returns null for JSON null', async () => {
    await Bun.write(configPath, 'null');
    const result = await readConfig(configPath);
    expect(result).toBeNull();
  });

  test('returns null for invalid JSON', async () => {
    await Bun.write(configPath, '{not valid json}');
    const result = await readConfig(configPath);
    expect(result).toBeNull();
  });

  test('returns null for truncated JSON', async () => {
    await Bun.write(configPath, '{"plugins": [');
    const result = await readConfig(configPath);
    expect(result).toBeNull();
  });

  test('returns config with extra fields preserved', async () => {
    await Bun.write(configPath, JSON.stringify({ plugins: [], custom: 'value' }));
    const result = await readConfig(configPath);
    expect(result).toEqual({ plugins: [], custom: 'value' });
  });
});

// ---------------------------------------------------------------------------
// getPluginsFromConfig
// ---------------------------------------------------------------------------

describe('getPluginsFromConfig', () => {
  test('returns string array from plugins field', () => {
    const config = { plugins: ['/path/a', '/path/b'] };
    expect(getPluginsFromConfig(config)).toEqual(['/path/a', '/path/b']);
  });

  test('filters non-string elements from mixed array', () => {
    const config = { plugins: ['/valid', 123, null, true, '/also-valid', undefined] };
    expect(getPluginsFromConfig(config)).toEqual(['/valid', '/also-valid']);
  });

  test('returns empty array when plugins key is missing', () => {
    const config = { tools: {} };
    expect(getPluginsFromConfig(config)).toEqual([]);
  });

  test('returns empty array when plugins is not an array', () => {
    expect(getPluginsFromConfig({ plugins: 'not-an-array' })).toEqual([]);
    expect(getPluginsFromConfig({ plugins: 42 })).toEqual([]);
    expect(getPluginsFromConfig({ plugins: null })).toEqual([]);
    expect(getPluginsFromConfig({ plugins: {} })).toEqual([]);
  });

  test('returns empty array for empty plugins array', () => {
    expect(getPluginsFromConfig({ plugins: [] })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// resolvePluginPath
// ---------------------------------------------------------------------------

describe('resolvePluginPath', () => {
  test('returns absolute path as-is', () => {
    const result = resolvePluginPath('/home/user/my-plugin', '/home/user/.opentabs/config.json');
    expect(result).toBe('/home/user/my-plugin');
  });

  test('resolves relative path against config directory', () => {
    const result = resolvePluginPath('../my-plugin', '/home/user/.opentabs/config.json');
    expect(result).toBe('/home/user/my-plugin');
  });

  test('resolves dot-slash relative path against config directory', () => {
    const result = resolvePluginPath('./plugins/my-plugin', '/home/user/.opentabs/config.json');
    expect(result).toBe('/home/user/.opentabs/plugins/my-plugin');
  });

  test('resolves bare name relative path against config directory', () => {
    const result = resolvePluginPath('my-plugin', '/home/user/.opentabs/config.json');
    expect(result).toBe('/home/user/.opentabs/my-plugin');
  });
});
