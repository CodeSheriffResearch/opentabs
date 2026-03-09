import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const createAnnotation = defineTool({
  name: 'create_annotation',
  displayName: 'Create Annotation',
  description:
    'Create a new annotation in Grafana. Annotations mark points or time ranges on dashboard graphs — useful for recording deployments, incidents, configuration changes, or any event you want to correlate with metrics. Optionally associate with a specific dashboard and panel.',
  summary: 'Create a new annotation',
  icon: 'message-square-plus',
  group: 'Annotations',
  input: z.object({
    text: z.string().describe('Annotation text content'),
    dashboard_uid: z.string().optional().describe('Dashboard UID to associate the annotation with'),
    panel_id: z.number().optional().describe('Panel ID to associate the annotation with'),
    tags: z.array(z.string()).optional().describe('Tags to attach to the annotation'),
    time: z.number().optional().describe('Start time as epoch milliseconds — defaults to now'),
    time_end: z.number().optional().describe('End time as epoch milliseconds — creates a region annotation if set'),
  }),
  output: z.object({
    id: z.number().describe('ID of the created annotation'),
    message: z.string().describe('Response message from Grafana'),
  }),
  handle: async params => {
    const body: Record<string, unknown> = { text: params.text };
    if (params.dashboard_uid !== undefined) body.dashboardUID = params.dashboard_uid;
    if (params.panel_id !== undefined) body.panelId = params.panel_id;
    if (params.tags !== undefined) body.tags = params.tags;
    if (params.time !== undefined) body.time = params.time;
    if (params.time_end !== undefined) body.timeEnd = params.time_end;

    const res = await api<{ id: number; message: string }>('/annotations', { method: 'POST', body });
    return { id: res.id, message: res.message };
  },
});
