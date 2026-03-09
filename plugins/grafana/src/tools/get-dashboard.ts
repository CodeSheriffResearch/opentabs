import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawDashboardResponse, dashboardSchema, mapDashboard } from './schemas.js';

export const getDashboard = defineTool({
  name: 'get_dashboard',
  displayName: 'Get Dashboard',
  description:
    'Get a dashboard by its UID. Returns full dashboard metadata including panels, permissions, folder, and version.',
  summary: 'Get dashboard by UID',
  icon: 'layout-dashboard',
  group: 'Dashboards',
  input: z.object({
    uid: z.string().describe('Dashboard UID'),
  }),
  output: z.object({
    dashboard: dashboardSchema,
  }),
  async handle(params) {
    const raw = await api<RawDashboardResponse>(`/dashboards/uid/${params.uid}`);

    return { dashboard: mapDashboard(raw) };
  },
});
