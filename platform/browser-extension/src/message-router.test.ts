import { validatePluginPayload } from './message-router.js';
import { describe, expect, test } from 'bun:test';
import type { ValidatedPluginPayload } from './message-router.js';

/** Minimal valid plugin payload for use as a base in tests */
const validPayload = (): Record<string, unknown> => ({
  name: 'test-plugin',
  version: '1.0.0',
  urlPatterns: ['*://example.com/*'],
  tools: [{ name: 'do-thing', description: 'Does a thing', enabled: true }],
});

/** Assert the result is non-null and return the narrowed type */
const expectValid = (raw: unknown): ValidatedPluginPayload => {
  const result = validatePluginPayload(raw);
  expect(result).not.toBeNull();
  return result as ValidatedPluginPayload;
};

describe('validatePluginPayload', () => {
  describe('valid payloads', () => {
    test('accepts a minimal valid payload', () => {
      const result = expectValid(validPayload());
      expect(result.name).toBe('test-plugin');
      expect(result.version).toBe('1.0.0');
      expect(result.urlPatterns).toEqual(['*://example.com/*']);
      expect(result.tools).toHaveLength(1);
    });

    test('accepts payload with optional fields', () => {
      const result = expectValid({
        ...validPayload(),
        displayName: 'Test Plugin',
        sourcePath: '/some/path',
        adapterHash: 'abc123',
        trustTier: 'official',
      });
      expect(result.displayName).toBe('Test Plugin');
      expect(result.sourcePath).toBe('/some/path');
      expect(result.adapterHash).toBe('abc123');
      expect(result.trustTier).toBe('official');
    });

    test('accepts single-word plugin name', () => {
      expectValid({ ...validPayload(), name: 'slack' });
    });

    test('accepts hyphenated plugin name', () => {
      expectValid({ ...validPayload(), name: 'my-cool-plugin' });
    });

    test('accepts name with digits', () => {
      expectValid({ ...validPayload(), name: 'plugin123' });
    });

    test('accepts name with hyphens and digits', () => {
      expectValid({ ...validPayload(), name: 'my-plugin-2' });
    });
  });

  describe('non-object payloads', () => {
    test('rejects null', () => {
      expect(validatePluginPayload(null)).toBeNull();
    });

    test('rejects undefined', () => {
      expect(validatePluginPayload(undefined)).toBeNull();
    });

    test('rejects a string', () => {
      expect(validatePluginPayload('not-an-object')).toBeNull();
    });

    test('rejects a number', () => {
      expect(validatePluginPayload(42)).toBeNull();
    });

    test('rejects an array', () => {
      expect(validatePluginPayload([1, 2, 3])).toBeNull();
    });

    test('rejects a boolean', () => {
      expect(validatePluginPayload(true)).toBeNull();
    });
  });

  describe('name validation', () => {
    test('rejects missing name', () => {
      const { name: _, ...payload } = validPayload();
      expect(validatePluginPayload(payload)).toBeNull();
    });

    test('rejects empty name', () => {
      expect(validatePluginPayload({ ...validPayload(), name: '' })).toBeNull();
    });

    test('rejects non-string name', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 123 })).toBeNull();
    });

    test('rejects name with uppercase characters', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 'MyPlugin' })).toBeNull();
    });

    test('rejects name with forward slash (path traversal)', () => {
      expect(validatePluginPayload({ ...validPayload(), name: '../evil' })).toBeNull();
    });

    test('rejects name with backslash (path traversal)', () => {
      expect(validatePluginPayload({ ...validPayload(), name: '..\\evil' })).toBeNull();
    });

    test('rejects name with dot-dot (path traversal)', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 'foo..bar' })).toBeNull();
    });

    test('rejects name with leading hyphen', () => {
      expect(validatePluginPayload({ ...validPayload(), name: '-plugin' })).toBeNull();
    });

    test('rejects name with trailing hyphen', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 'plugin-' })).toBeNull();
    });

    test('rejects name with consecutive hyphens', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 'my--plugin' })).toBeNull();
    });

    test('rejects name with spaces', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 'my plugin' })).toBeNull();
    });

    test('rejects name with special characters', () => {
      expect(validatePluginPayload({ ...validPayload(), name: 'my_plugin' })).toBeNull();
    });

    test('rejects name with @ symbol', () => {
      expect(validatePluginPayload({ ...validPayload(), name: '@scoped/plugin' })).toBeNull();
    });
  });

  describe('urlPatterns handling', () => {
    test('passes through valid string patterns', () => {
      const result = expectValid({
        ...validPayload(),
        urlPatterns: ['*://a.com/*', '*://b.com/*'],
      });
      expect(result.urlPatterns).toEqual(['*://a.com/*', '*://b.com/*']);
    });

    test('returns empty array when urlPatterns is missing', () => {
      const { urlPatterns: _, ...payload } = validPayload();
      const result = expectValid(payload);
      expect(result.urlPatterns).toEqual([]);
    });

    test('returns empty array when urlPatterns is not an array', () => {
      const result = expectValid({ ...validPayload(), urlPatterns: 'not-an-array' });
      expect(result.urlPatterns).toEqual([]);
    });

    test('filters out non-string entries from urlPatterns', () => {
      const result = expectValid({
        ...validPayload(),
        urlPatterns: ['*://valid.com/*', 123, null, '*://also-valid.com/*'],
      });
      expect(result.urlPatterns).toEqual(['*://valid.com/*', '*://also-valid.com/*']);
    });
  });

  describe('tools handling', () => {
    test('passes through valid tool definitions', () => {
      const tools = [
        { name: 'tool-a', description: 'Tool A', enabled: true },
        { name: 'tool-b', description: 'Tool B', enabled: false },
      ];
      const result = expectValid({ ...validPayload(), tools });
      expect(result.tools).toHaveLength(2);
      const firstTool = result.tools[0];
      expect(firstTool).toBeDefined();
      expect((firstTool as NonNullable<typeof firstTool>).name).toBe('tool-a');
      const secondTool = result.tools[1];
      expect(secondTool).toBeDefined();
      expect((secondTool as NonNullable<typeof secondTool>).enabled).toBe(false);
    });

    test('returns empty array when tools is missing', () => {
      const { tools: _, ...payload } = validPayload();
      const result = expectValid(payload);
      expect(result.tools).toEqual([]);
    });

    test('returns empty array when tools is not an array', () => {
      const result = expectValid({ ...validPayload(), tools: 'not-an-array' });
      expect(result.tools).toEqual([]);
    });

    test('filters out tools missing name', () => {
      const result = expectValid({
        ...validPayload(),
        tools: [
          { description: 'No name', enabled: true },
          { name: 'valid', description: 'Has name', enabled: true },
        ],
      });
      expect(result.tools).toHaveLength(1);
      const filteredTool = result.tools[0];
      expect(filteredTool).toBeDefined();
      expect((filteredTool as NonNullable<typeof filteredTool>).name).toBe('valid');
    });

    test('filters out tools missing description', () => {
      const result = expectValid({
        ...validPayload(),
        tools: [
          { name: 'no-desc', enabled: true },
          { name: 'valid', description: 'Has desc', enabled: true },
        ],
      });
      expect(result.tools).toHaveLength(1);
    });

    test('filters out tools missing enabled flag', () => {
      const result = expectValid({
        ...validPayload(),
        tools: [
          { name: 'no-enabled', description: 'Missing enabled' },
          { name: 'valid', description: 'Has enabled', enabled: false },
        ],
      });
      expect(result.tools).toHaveLength(1);
      const enabledTool = result.tools[0];
      expect(enabledTool).toBeDefined();
      expect((enabledTool as NonNullable<typeof enabledTool>).name).toBe('valid');
    });

    test('filters out non-object tool entries', () => {
      const result = expectValid({
        ...validPayload(),
        tools: ['not-an-object', null, 42, { name: 'valid', description: 'OK', enabled: true }],
      });
      expect(result.tools).toHaveLength(1);
    });
  });

  describe('default values', () => {
    test('defaults version to 0.0.0 when missing', () => {
      const { version: _, ...payload } = validPayload();
      const result = expectValid(payload);
      expect(result.version).toBe('0.0.0');
    });

    test('defaults version to 0.0.0 when non-string', () => {
      const result = expectValid({ ...validPayload(), version: 123 });
      expect(result.version).toBe('0.0.0');
    });

    test('defaults trustTier to local when missing', () => {
      const result = expectValid(validPayload());
      expect(result.trustTier).toBe('local');
    });

    test('defaults trustTier to local for invalid value', () => {
      const result = expectValid({ ...validPayload(), trustTier: 'invalid' });
      expect(result.trustTier).toBe('local');
    });

    test('accepts official trustTier', () => {
      expect(expectValid({ ...validPayload(), trustTier: 'official' }).trustTier).toBe('official');
    });

    test('accepts community trustTier', () => {
      expect(expectValid({ ...validPayload(), trustTier: 'community' }).trustTier).toBe('community');
    });

    test('accepts local trustTier', () => {
      expect(expectValid({ ...validPayload(), trustTier: 'local' }).trustTier).toBe('local');
    });

    test('displayName is undefined when missing', () => {
      expect(expectValid(validPayload()).displayName).toBeUndefined();
    });

    test('displayName is undefined when non-string', () => {
      expect(expectValid({ ...validPayload(), displayName: 42 }).displayName).toBeUndefined();
    });

    test('sourcePath is undefined when missing', () => {
      expect(expectValid(validPayload()).sourcePath).toBeUndefined();
    });

    test('adapterHash is undefined when missing', () => {
      expect(expectValid(validPayload()).adapterHash).toBeUndefined();
    });
  });
});
