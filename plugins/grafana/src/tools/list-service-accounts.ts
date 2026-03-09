import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawServiceAccount, serviceAccountSchema, mapServiceAccount } from './schemas.js';

export const listServiceAccounts = defineTool({
  name: 'list_service_accounts',
  displayName: 'List Service Accounts',
  description:
    'Search and list service accounts in the Grafana instance. Service accounts are used for API access and automation — each has its own set of API tokens and permissions.',
  summary: 'List service accounts',
  icon: 'key',
  group: 'Service Accounts',
  input: z.object({
    query: z.string().optional().describe('Search query to filter service accounts by name'),
    per_page: z.number().optional().describe('Number of results per page (default 50)'),
  }),
  output: z.object({
    service_accounts: z.array(serviceAccountSchema).describe('List of service accounts'),
    total_count: z.number().describe('Total number of service accounts matching the query'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.query !== undefined) query.query = params.query;
    if (params.per_page !== undefined) query.perPage = params.per_page;

    const res = await api<{ serviceAccounts: RawServiceAccount[]; totalCount: number }>('/serviceaccounts/search', {
      query,
    });
    return {
      service_accounts: res.serviceAccounts.map(mapServiceAccount),
      total_count: res.totalCount,
    };
  },
});
