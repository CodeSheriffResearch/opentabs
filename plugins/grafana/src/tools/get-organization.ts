import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawOrg, mapOrg, orgSchema } from './schemas.js';

export const getOrganization = defineTool({
  name: 'get_organization',
  displayName: 'Get Organization',
  description: 'Get the current Grafana organization details including name and address.',
  summary: 'Get organization details',
  icon: 'building-2',
  group: 'Organization',
  input: z.object({}),
  output: z.object({ organization: orgSchema }),
  handle: async () => {
    const data = await api<RawOrg>('/org');
    return { organization: mapOrg(data) };
  },
});
