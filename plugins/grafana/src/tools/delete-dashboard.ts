import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const deleteDashboard = defineTool({
  name: 'delete_dashboard',
  displayName: 'Delete Dashboard',
  description: 'Permanently delete a dashboard by its UID. This action cannot be undone.',
  summary: 'Delete a dashboard',
  icon: 'trash-2',
  group: 'Dashboards',
  input: z.object({
    uid: z.string().describe('Dashboard UID to delete'),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  async handle(params) {
    await api(`/dashboards/uid/${params.uid}`, { method: 'DELETE' });
    return { success: true };
  },
});
