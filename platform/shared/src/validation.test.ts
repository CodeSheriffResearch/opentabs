import { isBlockedUrlScheme, validatePluginName, validateUrlPattern } from './index.js';
import { describe, expect, test } from 'bun:test';

describe('validateUrlPattern', () => {
  describe('valid patterns', () => {
    test('https with specific domain', () => {
      expect(validateUrlPattern('https://example.com/*')).toBeNull();
    });

    test('http with specific domain', () => {
      expect(validateUrlPattern('http://example.com/*')).toBeNull();
    });

    test('wildcard scheme with specific domain', () => {
      expect(validateUrlPattern('*://example.com/*')).toBeNull();
    });

    test('subdomain wildcard', () => {
      expect(validateUrlPattern('*://*.slack.com/*')).toBeNull();
    });

    test('localhost', () => {
      expect(validateUrlPattern('*://localhost/*')).toBeNull();
    });

    test('localhost with port', () => {
      expect(validateUrlPattern('*://localhost:3000/*')).toBeNull();
    });

    test('specific path', () => {
      expect(validateUrlPattern('https://example.com/api/*')).toBeNull();
    });

    test('wildcard host', () => {
      expect(validateUrlPattern('*://*/*')).not.toBeNull(); // Too broad — should be rejected
    });
  });

  describe('overly broad patterns', () => {
    test('rejects *://*/*', () => {
      const error = validateUrlPattern('*://*/*');
      expect(error).not.toBeNull();
      expect(error).toContain('too broad');
    });

    test('rejects <all_urls>', () => {
      const error = validateUrlPattern('<all_urls>');
      expect(error).not.toBeNull();
      expect(error).toContain('too broad');
    });
  });

  describe('invalid patterns', () => {
    test('rejects missing scheme', () => {
      const error = validateUrlPattern('example.com/*');
      expect(error).not.toBeNull();
      expect(error).toContain('not a valid Chrome match pattern');
    });

    test('rejects empty string', () => {
      const error = validateUrlPattern('');
      expect(error).not.toBeNull();
    });

    test('rejects invalid host format', () => {
      const error = validateUrlPattern('*://???/*');
      expect(error).not.toBeNull();
      expect(error).toContain('invalid host');
    });
  });

  describe('host validation', () => {
    test('accepts standard TLD domains', () => {
      expect(validateUrlPattern('*://app.example.com/*')).toBeNull();
    });

    test('accepts subdomain wildcard with TLD', () => {
      expect(validateUrlPattern('*://*.example.co.uk/*')).toBeNull();
    });

    test('accepts wildcard host *', () => {
      // When host is just *, it's caught by the overly-broad check
      // since the full pattern becomes *://*/* which is <all_urls>-equivalent
      // But *://*/specific-path is valid:
      expect(validateUrlPattern('https://*/api')).toBeNull();
    });
  });

  describe('ftp scheme', () => {
    test('rejects ftp scheme (Chrome removed FTP support)', () => {
      const error = validateUrlPattern('ftp://example.com/*');
      expect(error).not.toBeNull();
      expect(error).toContain('not a valid Chrome match pattern');
    });
  });
});

describe('validatePluginName', () => {
  describe('valid names', () => {
    test('simple lowercase name', () => {
      expect(validatePluginName('slack')).toBeNull();
    });

    test('name with hyphens', () => {
      expect(validatePluginName('my-plugin')).toBeNull();
    });

    test('name with multiple hyphens', () => {
      expect(validatePluginName('my-cool-plugin')).toBeNull();
    });

    test('name with digits', () => {
      expect(validatePluginName('plugin123')).toBeNull();
    });

    test('name mixing letters and digits with hyphens', () => {
      expect(validatePluginName('my-plugin-2')).toBeNull();
    });

    test('single character name', () => {
      expect(validatePluginName('a')).toBeNull();
    });

    test('single digit name', () => {
      expect(validatePluginName('1')).toBeNull();
    });
  });

  describe('invalid names', () => {
    test('empty string', () => {
      expect(validatePluginName('')).toBe('Plugin name is required');
    });

    test('uppercase characters', () => {
      const error = validatePluginName('MyPlugin');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('leading hyphen', () => {
      const error = validatePluginName('-plugin');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('trailing hyphen', () => {
      const error = validatePluginName('plugin-');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('consecutive hyphens', () => {
      const error = validatePluginName('my--plugin');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('underscores', () => {
      const error = validatePluginName('my_plugin');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('spaces', () => {
      const error = validatePluginName('my plugin');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('dots', () => {
      const error = validatePluginName('my.plugin');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });

    test('special characters', () => {
      const error = validatePluginName('plugin@1');
      expect(error).not.toBeNull();
      expect(error).toContain('lowercase alphanumeric');
    });
  });

  describe('reserved names', () => {
    test('system is reserved', () => {
      const error = validatePluginName('system');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('browser is reserved', () => {
      const error = validatePluginName('browser');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('opentabs is reserved', () => {
      const error = validatePluginName('opentabs');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('extension is reserved', () => {
      const error = validatePluginName('extension');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('config is reserved', () => {
      const error = validatePluginName('config');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('plugin is reserved', () => {
      const error = validatePluginName('plugin');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('tool is reserved', () => {
      const error = validatePluginName('tool');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });

    test('mcp is reserved', () => {
      const error = validatePluginName('mcp');
      expect(error).not.toBeNull();
      expect(error).toContain('reserved');
    });
  });
});

describe('isBlockedUrlScheme', () => {
  describe('blocked schemes', () => {
    test('blocks javascript: URLs', () => {
      expect(isBlockedUrlScheme('javascript:alert(1)')).toBe(true);
    });

    test('blocks data: URLs', () => {
      expect(isBlockedUrlScheme('data:text/html,<h1>hi</h1>')).toBe(true);
    });

    test('blocks file: URLs', () => {
      expect(isBlockedUrlScheme('file:///etc/passwd')).toBe(true);
    });

    test('blocks chrome: URLs', () => {
      expect(isBlockedUrlScheme('chrome://extensions/')).toBe(true);
    });

    test('blocks blob: URLs', () => {
      expect(isBlockedUrlScheme('blob:https://example.com/uuid')).toBe(true);
    });
  });

  describe('allowed schemes', () => {
    test('allows http: URLs', () => {
      expect(isBlockedUrlScheme('http://example.com')).toBe(false);
    });

    test('allows https: URLs', () => {
      expect(isBlockedUrlScheme('https://example.com')).toBe(false);
    });

    test('allows https with path and query', () => {
      expect(isBlockedUrlScheme('https://example.com/path?q=1')).toBe(false);
    });
  });

  describe('case sensitivity', () => {
    test('uppercase JAVASCRIPT: is blocked (URL parser lowercases scheme)', () => {
      expect(isBlockedUrlScheme('JAVASCRIPT:alert(1)')).toBe(true);
    });

    test('mixed case Chrome: is blocked', () => {
      expect(isBlockedUrlScheme('Chrome://settings/')).toBe(true);
    });

    test('uppercase HTTPS: is allowed', () => {
      expect(isBlockedUrlScheme('HTTPS://example.com')).toBe(false);
    });
  });

  describe('unparseable URLs', () => {
    test('empty string is blocked', () => {
      expect(isBlockedUrlScheme('')).toBe(true);
    });

    test('bare word is blocked', () => {
      expect(isBlockedUrlScheme('notaurl')).toBe(true);
    });

    test('missing scheme is blocked', () => {
      expect(isBlockedUrlScheme('://example.com')).toBe(true);
    });
  });
});
