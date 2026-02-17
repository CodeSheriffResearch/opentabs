/**
 * Shared port parser and resolver for Commander options.
 */

import { InvalidArgumentError } from 'commander';

const DEFAULT_PORT = 9515;

const parsePort = (value: string): number => {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new InvalidArgumentError('Must be an integer between 1 and 65535.');
  }
  return port;
};

/**
 * Resolves the MCP server port from (in priority order):
 * 1. The --port flag (passed via Commander options)
 * 2. The OPENTABS_PORT environment variable
 * 3. The default port (9515)
 */
const resolvePort = (options: { port?: number }): number => {
  if (options.port !== undefined) return options.port;

  const envPort = Bun.env.OPENTABS_PORT;
  if (envPort !== undefined) {
    const parsed = Number(envPort);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535) {
      return parsed;
    }
  }

  return DEFAULT_PORT;
};

export { parsePort, resolvePort };
