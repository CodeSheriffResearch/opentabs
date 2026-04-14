/**
 * browser_get_memory_usage — retrieve DOM counters and JS heap stats
 * using the CDP Memory and Runtime domains.
 */

import { z } from 'zod';
import { dispatchToExtension } from '../extension-protocol.js';
import { defineBrowserTool } from './definition.js';

const getMemoryUsage = defineBrowserTool({
  name: 'browser_get_memory_usage',
  description:
    'Get memory usage statistics for a browser tab using the Chrome DevTools Protocol. ' +
    'Returns DOM counters (documents, nodes, event listeners) via the Memory domain and ' +
    'JS heap statistics (used bytes, total bytes, usage percentage) via the Runtime domain. ' +
    'Useful for detecting memory leaks, monitoring DOM growth, and tracking JS heap pressure.',
  summary: 'Get memory usage for a tab',
  icon: 'memory-stick',
  group: 'Performance',
  input: z.object({
    tabId: z.number().int().positive().describe('Tab ID'),
  }),
  handler: async (args, state) =>
    dispatchToExtension(state, 'browser.getMemoryUsage', {
      tabId: args.tabId,
    }),
});

export { getMemoryUsage };
