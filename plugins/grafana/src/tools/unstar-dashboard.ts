import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const unstarDashboard = defineTool({
  name: 'unstar_dashboard',
  displayName: 'Unstar Dashboard',
  description: 'Remove a star from a dashboard by its UID.',
  summary: 'Unstar a dashboard',
  icon: 'star-off',
  group: 'Dashboards',
  input: z.object({
    uid: z.string().describe('Dashboard UID'),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  async handle(params) {
    await api(`/user/stars/dashboard/uid/${params.uid}`, {
      method: 'DELETE',
    });
    return { success: true };
  },
});
