/**
 * `opentabs reload` command — triggers server config/plugin rediscovery or extension reload.
 */

import { isConnectionRefused } from '../config.js';
import { parsePort, resolvePort } from '../parse-port.js';
import pc from 'picocolors';
import type { Command } from 'commander';

interface ReloadOptions {
  port?: number;
  extension?: boolean;
}

const handleReload = async (options: ReloadOptions): Promise<void> => {
  const port = resolvePort(options);

  if (options.extension) {
    await reloadExtension(port);
  } else {
    await reloadServer(port);
  }
};

const reloadServer = async (port: number): Promise<void> => {
  const url = `http://localhost:${port}/reload`;

  try {
    const res = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(10_000) });
    const data = (await res.json()) as { ok: boolean; plugins?: number; durationMs?: number; error?: string };

    if (data.ok) {
      console.log(pc.green('Server reloaded successfully'));
      if (data.plugins !== undefined && data.durationMs !== undefined) {
        console.log(pc.dim(`  ${data.plugins} plugin(s) discovered in ${data.durationMs}ms`));
      }
    } else {
      console.error(pc.red(`Reload failed: ${data.error ?? 'unknown error'}`));
      process.exit(1);
    }
  } catch (err: unknown) {
    if (isConnectionRefused(err)) {
      console.error(pc.red('Server not running'));
      const portSuffix = port !== 9515 ? ` --port ${port}` : '';
      console.error(pc.dim(`Start it with: opentabs dev${portSuffix}`));
    } else {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error: ${message}`));
    }
    process.exit(1);
  }
};

const reloadExtension = async (port: number): Promise<void> => {
  const url = `http://localhost:${port}/extension/reload`;

  try {
    const res = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(5_000) });
    const data = (await res.json()) as { ok: boolean; message?: string; error?: string };

    if (data.ok) {
      console.log(pc.green('Extension reload signal sent'));
      if (data.message) {
        console.log(pc.dim(`  ${data.message}`));
      }
    } else {
      console.error(pc.red(`Extension reload failed: ${data.error ?? 'unknown error'}`));
      process.exit(1);
    }
  } catch (err: unknown) {
    if (isConnectionRefused(err)) {
      console.error(pc.red('Server not running'));
      const portSuffix = port !== 9515 ? ` --port ${port}` : '';
      console.error(pc.dim(`Start it with: opentabs dev${portSuffix}`));
    } else {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error: ${message}`));
    }
    process.exit(1);
  }
};

const registerReloadCommand = (program: Command): void => {
  program
    .command('reload')
    .description('Reload server config/plugins or trigger extension reload')
    .option('--port <number>', 'MCP server port (default: 9515)', parsePort)
    .option('--extension', 'Reload the Chrome extension instead of server config')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs reload                  # Reload server config and plugins
  $ opentabs reload --extension      # Reload the Chrome extension
  $ opentabs reload --port 3000      # Reload server on custom port`,
    )
    .action((_options: ReloadOptions, command: Command) => handleReload(command.optsWithGlobals()));
};

export { registerReloadCommand };
