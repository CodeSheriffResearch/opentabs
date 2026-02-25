/**
 * Validates that the running Bun version meets the project's minimum requirement.
 *
 * Reads the minimum version from the "engines.bun" field in the root package.json.
 * Supports ">= X.Y.Z" format. Exits with code 1 and a clear error message if the
 * running version is too old.
 *
 * Invoked automatically via the "postinstall" script in package.json.
 */

import { resolve } from 'node:path';

if (typeof Bun === 'undefined') {
  process.exit(0);
}

const ROOT = resolve(import.meta.dirname, '..');

interface PackageJson {
  engines?: {
    bun?: string;
  };
}

const parseVersion = (version: string): [number, number, number] | null => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
};

const compareVersions = (a: [number, number, number], b: [number, number, number]): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  if (a[2] !== b[2]) return a[2] - b[2];
  return 0;
};

const main = async (): Promise<void> => {
  const pkgPath = resolve(ROOT, 'package.json');
  const raw = await Bun.file(pkgPath).text();
  const pkg: PackageJson = JSON.parse(raw) as PackageJson;

  const enginesField = pkg.engines?.bun;
  if (!enginesField) {
    console.warn('No engines.bun field found in package.json — skipping version check.');
    return;
  }

  // Extract version from ">= X.Y.Z" format
  const versionMatch = enginesField.match(/>=\s*([\d.]+)/);
  if (!versionMatch?.[1]) {
    console.warn(`Could not parse engines.bun value "${enginesField}" — skipping version check.`);
    return;
  }

  const minVersionStr = versionMatch[1];
  const minVersion = parseVersion(minVersionStr);
  if (!minVersion) {
    console.warn(`Could not parse minimum version "${minVersionStr}" — skipping version check.`);
    return;
  }

  const currentVersionStr = Bun.version;
  const currentVersion = parseVersion(currentVersionStr);
  if (!currentVersion) {
    console.warn(`Could not parse current Bun version "${currentVersionStr}" — skipping version check.`);
    return;
  }

  if (compareVersions(currentVersion, minVersion) < 0) {
    console.error(
      `\n` +
        `  ERROR: Bun ${currentVersionStr} is below the minimum required version.\n` +
        `  This project requires Bun >= ${minVersionStr}.\n` +
        `\n` +
        `  Upgrade Bun:  bun upgrade\n`,
    );
    process.exit(1);
  }
};

await main();
