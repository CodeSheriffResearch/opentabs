import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawOrgMember, mapOrgMember, orgMemberSchema } from './schemas.js';

export const listOrgUsers = defineTool({
  name: 'list_org_users',
  displayName: 'List Org Users',
  description:
    'List all users in the current Grafana organization with their roles, email, and last seen time. Supports pagination.',
  summary: 'List organization members',
  icon: 'users',
  group: 'Organization',
  input: z.object({
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
    per_page: z.number().int().min(1).max(1000).optional().describe('Results per page (default 1000)'),
  }),
  output: z.object({ users: z.array(orgMemberSchema) }),
  handle: async params => {
    const data = await api<RawOrgMember[]>('/org/users', {
      query: { page: params.page, perpage: params.per_page },
    });
    return { users: data.map(mapOrgMember) };
  },
});
