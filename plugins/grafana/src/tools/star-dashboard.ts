import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const starDashboard = defineTool({
  name: 'star_dashboard',
  displayName: 'Star Dashboard',
  description: 'Star (favorite) a dashboard by its UID. Starred dashboards appear in the starred section.',
  summary: 'Star a dashboard',
  icon: 'star',
  group: 'Dashboards',
  input: z.object({
    uid: z.string().describe('Dashboard UID'),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  async handle(params) {
    await api(`/user/stars/dashboard/uid/${params.uid}`, { method: 'POST' });
    return { success: true };
  },
});
