import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

interface RawDashboardFull {
  dashboard: Record<string, unknown>;
  meta: {
    version: number;
    folderUid?: string;
  };
}

interface SaveDashboardResponse {
  uid: string;
  url: string;
  version: number;
  status: string;
}

export const updateDashboard = defineTool({
  name: 'update_dashboard',
  displayName: 'Update Dashboard',
  description:
    'Update an existing dashboard. Fetches the current version, applies changes (title, tags), and saves with the correct version to avoid conflicts.',
  summary: 'Update a dashboard',
  icon: 'pencil',
  group: 'Dashboards',
  input: z.object({
    uid: z.string().describe('Dashboard UID to update'),
    title: z.string().optional().describe('New dashboard title'),
    tags: z.array(z.string()).optional().describe('New dashboard tags'),
  }),
  output: z.object({
    uid: z.string().describe('Dashboard UID'),
    url: z.string().describe('Dashboard URL path'),
    version: z.number().describe('Dashboard version number'),
    status: z.string().describe('Save status'),
  }),
  async handle(params) {
    const current = await api<RawDashboardFull>(`/dashboards/uid/${params.uid}`);

    const dashboard = { ...current.dashboard };
    if (params.title !== undefined) dashboard.title = params.title;
    if (params.tags !== undefined) dashboard.tags = params.tags;
    dashboard.version = current.meta.version;

    const result = await api<SaveDashboardResponse>('/dashboards/db', {
      method: 'POST',
      body: {
        dashboard,
        folderUid: current.meta.folderUid,
        overwrite: false,
      },
    });

    return {
      uid: result.uid,
      url: result.url,
      version: result.version,
      status: result.status,
    };
  },
});
