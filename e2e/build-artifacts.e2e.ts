/**
 * E2E tests for plugin build artifacts — source maps.
 *
 * Verifies that `opentabs-plugin build` generates source maps alongside the
 * IIFE adapter bundle, enabling browser DevTools debugging back to original
 * TypeScript source files.
 */

import { test, expect, E2E_TEST_PLUGIN_DIR } from './fixtures.js';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Source map verification
// ---------------------------------------------------------------------------

test.describe('Source maps — build artifacts', () => {
  const distDir = path.join(E2E_TEST_PLUGIN_DIR, 'dist');
  const iifePath = path.join(distDir, 'adapter.iife.js');
  const mapPath = path.join(distDir, 'adapter.iife.js.map');

  test('adapter.iife.js.map exists alongside the IIFE bundle', () => {
    expect(fs.existsSync(mapPath)).toBe(true);

    const stat = fs.statSync(mapPath);
    expect(stat.size).toBeGreaterThan(0);
  });

  test('IIFE bundle contains a debugId comment for source map association', () => {
    const iifeContent = fs.readFileSync(iifePath, 'utf-8');

    // Bun's external source map emits a //# debugId= comment that associates
    // the bundle with its .map file via a unique identifier.
    expect(iifeContent).toContain('//# debugId=');
  });

  test('source map is valid JSON with standard fields', () => {
    const raw = fs.readFileSync(mapPath, 'utf-8');
    const sourceMap = JSON.parse(raw) as {
      version: number;
      sources: string[];
      mappings: string;
      sourcesContent?: string[];
    };

    // Source Map Revision 3 format
    expect(sourceMap.version).toBe(3);

    // Must contain source file references
    expect(sourceMap.sources).toBeDefined();
    expect(Array.isArray(sourceMap.sources)).toBe(true);
    expect(sourceMap.sources.length).toBeGreaterThan(0);

    // Must contain mapping data
    expect(sourceMap.mappings).toBeDefined();
    expect(typeof sourceMap.mappings).toBe('string');
    expect(sourceMap.mappings.length).toBeGreaterThan(0);

    // Should include original TypeScript source files from the plugin
    const hasPluginSource = sourceMap.sources.some(s => s.includes('src/'));
    expect(hasPluginSource).toBe(true);

    // Should include sourcesContent for inline source viewing in DevTools
    expect(sourceMap.sourcesContent).toBeDefined();
    expect(Array.isArray(sourceMap.sourcesContent)).toBe(true);
    expect(sourceMap.sourcesContent?.length).toBe(sourceMap.sources.length);
  });
});
