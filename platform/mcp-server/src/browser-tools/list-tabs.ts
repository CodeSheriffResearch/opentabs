/**
 * browser_list_tabs — lists all open browser tabs.
 */

import { defineBrowserTool } from './definition.js';
import { dispatchToExtension } from '../extension-protocol.js';
import { z } from 'zod';

const listTabs = defineBrowserTool({
  name: 'browser_list_tabs',
  description: 'List all open browser tabs. Returns tab ID, title, URL, and active status for each tab.',
  input: z.object({}),
  handler: async (_args, state) => dispatchToExtension(state, 'browser.listTabs', {}),
});

export { listTabs };
