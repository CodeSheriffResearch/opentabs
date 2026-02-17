/**
 * browser_execute_script — inspects page state or evaluates a return expression
 * in a browser tab.
 *
 * Runs via chrome.scripting.executeScript with a pre-compiled function.
 * Arbitrary string eval is blocked by MV3 CSP in both ISOLATED and MAIN worlds,
 * so this tool provides structured page inspection by default and supports a
 * limited returnExpression for extracting specific DOM values.
 */

import { defineBrowserTool } from './definition.js';
import { dispatchToExtension } from '../extension-protocol.js';
import { z } from 'zod';

const executeScript = defineBrowserTool({
  name: 'browser_execute_script',
  description:
    'Inspect a browser tab and return page metadata (title, URL, origin, readyState, characterSet, contentType, cookieEnabled, and the first 500 chars of outerHTML). ' +
    'By default runs in ISOLATED world (extension context). Set world to "MAIN" to access page globals. ' +
    'Optionally pass a returnExpression to extract a specific value using dot-notation property access ' +
    '(e.g. "document.title", "location.href", "navigator.language", "document.body.className"). ' +
    'Only simple property chains are supported — method calls, bracket notation, and complex expressions are not.',
  input: z.object({
    tabId: z.number().int().positive().describe('Tab ID to inspect'),
    returnExpression: z
      .string()
      .optional()
      .describe(
        'A simple JS expression to evaluate and return (e.g. "document.title", "location.href"). ' +
          'Falls back to full page info if omitted or if evaluation fails.',
      ),
    world: z
      .enum(['ISOLATED', 'MAIN'])
      .optional()
      .describe('Execution world: ISOLATED (default, extension context) or MAIN (page context)'),
  }),
  handler: async (args, state) =>
    dispatchToExtension(state, 'browser.executeScript', {
      tabId: args.tabId,
      returnExpression: args.returnExpression,
      world: args.world,
    }),
});

export { executeScript };
