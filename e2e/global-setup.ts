/**
 * Playwright global setup — verifies E2E test prerequisites before running tests.
 *
 * Checks that the e2e-test plugin has been built (dist/tools.json and
 * dist/adapter.iife.js exist). Without these artifacts, E2E tests will
 * fail with confusing errors during plugin discovery.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PLUGIN_DIR = resolve('plugins/e2e-test/dist');
const REQUIRED_FILES = ['tools.json', 'adapter.iife.js'] as const;

export default function globalSetup(): void {
  const missing = REQUIRED_FILES.filter(file => !existsSync(resolve(PLUGIN_DIR, file)));

  if (missing.length > 0) {
    throw new Error(
      `E2E test plugin not built (missing: ${missing.join(', ')}).\n` +
        'Run: cd plugins/e2e-test && bun install && bun run build',
    );
  }
}
