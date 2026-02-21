import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';

/**
 * Access the sdk.log namespace from globalThis.__openTabs.log, registered by
 * the SDK's log module at import time. This avoids importing `log` directly
 * from the SDK package (which may not include the log module in older published
 * versions). At runtime inside the adapter IIFE, the platform SDK bundles
 * log.ts which registers the log object on globalThis.
 */
interface SdkLog {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

const getSdkLog = (): SdkLog | undefined => {
  const ot = (globalThis as Record<string, unknown>).__openTabs as Record<string, unknown> | undefined;
  return ot?.log as SdkLog | undefined;
};

export const logLevels = defineTool({
  name: 'log_levels',
  displayName: 'Log Levels',
  description: 'Emits one log entry at each level (debug, info, warning, error) for E2E testing of the plugin logging pipeline',
  icon: 'wrench',
  input: z.object({
    prefix: z.string().describe('A unique prefix to identify log messages from this invocation'),
  }),
  output: z.object({
    ok: z.boolean().describe('Whether the log calls completed'),
    levels: z.array(z.string()).describe('The log levels that were emitted'),
  }),
  handle: async params => {
    const sdkLog = getSdkLog();
    if (!sdkLog) {
      return { ok: false, levels: [] };
    }

    sdkLog.debug(`${params.prefix} debug-message`, { level: 'debug' });
    sdkLog.info(`${params.prefix} info-message`, { level: 'info' });
    sdkLog.warn(`${params.prefix} warning-message`, { level: 'warning' });
    sdkLog.error(`${params.prefix} error-message`, { level: 'error' });

    return { ok: true, levels: ['debug', 'info', 'warning', 'error'] };
  },
});
