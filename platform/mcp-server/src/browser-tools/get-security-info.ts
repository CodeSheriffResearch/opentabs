/**
 * browser_get_security_info — retrieve TLS certificate and security state
 * information using the CDP Security domain.
 */

import { z } from 'zod';
import { dispatchToExtension } from '../extension-protocol.js';
import { defineBrowserTool } from './definition.js';

const getSecurityInfo = defineBrowserTool({
  name: 'browser_get_security_info',
  description:
    'Get the security state and TLS certificate information for a browser tab using the Chrome DevTools Protocol Security domain. ' +
    'Returns the overall security state (secure, insecure, neutral), certificate details (issuer, subject, validity dates, ' +
    'protocol, cipher), and mixed content warnings. Useful for verifying HTTPS configuration, checking certificate validity, ' +
    'and detecting mixed content issues.',
  summary: 'Get security info for a tab',
  icon: 'shield-check',
  group: 'Inspection',
  input: z.object({
    tabId: z.number().int().positive().describe('Tab ID'),
  }),
  handler: async (args, state) =>
    dispatchToExtension(state, 'browser.getSecurityInfo', {
      tabId: args.tabId,
    }),
});

export { getSecurityInfo };
