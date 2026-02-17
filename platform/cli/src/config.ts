/**
 * Config file helpers shared across CLI commands.
 */

import { homedir } from 'node:os';
import { join, dirname, resolve, isAbsolute } from 'node:path';

export const getConfigDir = (): string => Bun.env.OPENTABS_CONFIG_DIR || join(homedir(), '.opentabs');

export const getConfigPath = (): string => join(getConfigDir(), 'config.json');

export const getLogFilePath = (): string => join(getConfigDir(), 'server.log');

export const readConfig = async (configPath: string): Promise<Record<string, unknown> | null> => {
  const configFile = Bun.file(configPath);
  if (!(await configFile.exists())) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(await configFile.text());
  } catch (err) {
    console.error(`Invalid JSON in config: ${err instanceof Error ? err.message : String(err)}`);
    console.error(`File: ${configPath}`);
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    console.error(
      `Invalid config at ${configPath}: expected a JSON object, got ${Array.isArray(parsed) ? 'array' : String(parsed)}`,
    );
    return null;
  }
  return parsed as Record<string, unknown>;
};

export const getPluginsFromConfig = (config: Record<string, unknown>): string[] =>
  Array.isArray(config.plugins) ? (config.plugins as unknown[]).filter((p): p is string => typeof p === 'string') : [];

export const resolvePluginPath = (pluginPath: string, configPath: string): string =>
  isAbsolute(pluginPath) ? pluginPath : resolve(dirname(configPath), pluginPath);

export const isConnectionRefused = (err: unknown): boolean => {
  if (!(err instanceof TypeError)) return false;
  const cause = (err as TypeError & { cause?: { code?: string } }).cause;
  return cause?.code === 'ECONNREFUSED';
};
