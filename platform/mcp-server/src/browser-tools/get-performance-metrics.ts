/**
 * browser_get_performance_metrics — collect performance metrics for a tab
 * using the CDP Performance domain and page-level performance APIs.
 */

import { z } from 'zod';
import { dispatchToExtension } from '../extension-protocol.js';
import { defineBrowserTool } from './definition.js';

const getPerformanceMetrics = defineBrowserTool({
  name: 'browser_get_performance_metrics',
  description:
    'Get performance metrics for a browser tab using the Chrome DevTools Protocol. ' +
    'Returns DOM stats (nodes, documents, event listeners), JS heap memory usage, ' +
    'layout metrics (count, duration, style recalculations), and Web Vitals timing ' +
    '(TTFB, DOM content loaded, load complete, FCP, LCP). ' +
    'Useful for diagnosing performance bottlenecks, memory leaks, and layout thrashing.',
  summary: 'Get performance metrics for a tab',
  icon: 'gauge',
  group: 'Performance',
  input: z.object({
    tabId: z.number().int().positive().describe('Tab ID'),
  }),
  handler: async (args, state) =>
    dispatchToExtension(state, 'browser.getPerformanceMetrics', {
      tabId: args.tabId,
    }),
});

export { getPerformanceMetrics };
