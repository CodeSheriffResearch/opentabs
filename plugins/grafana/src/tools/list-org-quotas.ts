import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawQuota, mapQuota, quotaSchema } from './schemas.js';

export const listOrgQuotas = defineTool({
  name: 'list_org_quotas',
  displayName: 'List Org Quotas',
  description:
    'List all resource quotas for the current Grafana organization including limits and current usage for dashboards, data sources, alert rules, etc.',
  summary: 'List organization resource quotas',
  icon: 'gauge',
  group: 'Organization',
  input: z.object({}),
  output: z.object({ quotas: z.array(quotaSchema) }),
  handle: async () => {
    const data = await api<RawQuota[]>('/org/quotas');
    return { quotas: data.map(mapQuota) };
  },
});
