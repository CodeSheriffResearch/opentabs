import { sdkVersion } from './sdk-version.js';
import { describe, expect, test } from 'bun:test';

describe('sdkVersion', () => {
  test('is a string', () => {
    expect(typeof sdkVersion).toBe('string');
  });

  test('is a valid semver-like version', () => {
    expect(sdkVersion).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('matches the plugin-sdk package.json version', async () => {
    const nodePath = await import('node:path');
    const nodeUrl = await import('node:url');

    const sdkPkgPath = nodePath.join(
      nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url)),
      '..',
      '..',
      'plugin-sdk',
      'package.json',
    );
    const pkgJson = (await Bun.file(sdkPkgPath).json()) as { version: string };

    expect(sdkVersion).toBe(pkgJson.version);
  });

  test('is not the fallback value', () => {
    expect(sdkVersion).not.toBe('0.0.0');
  });
});
