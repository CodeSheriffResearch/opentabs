import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawAnnotation, annotationSchema, mapAnnotation } from './schemas.js';

export const listAnnotations = defineTool({
  name: 'list_annotations',
  displayName: 'List Annotations',
  description:
    'List annotations in Grafana. Annotations mark points in time on dashboard graphs — useful for correlating deployments, incidents, or other events with metric changes. Filter by dashboard, panel, tags, or time range.',
  summary: 'List annotations with optional filters',
  icon: 'message-square',
  group: 'Annotations',
  input: z.object({
    dashboard_uid: z.string().optional().describe('Filter by dashboard UID'),
    panel_id: z.number().optional().describe('Filter by panel ID'),
    limit: z.number().optional().describe('Maximum number of annotations to return (default 100)'),
    tags: z.string().optional().describe('Comma-separated list of tags to filter by'),
    from: z.number().optional().describe('Start of time range as epoch milliseconds'),
    to: z.number().optional().describe('End of time range as epoch milliseconds'),
  }),
  output: z.object({
    annotations: z.array(annotationSchema).describe('List of annotations'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.dashboard_uid !== undefined) query.dashboardUID = params.dashboard_uid;
    if (params.panel_id !== undefined) query.panelId = params.panel_id;
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.tags !== undefined) query.tags = params.tags;
    if (params.from !== undefined) query.from = params.from;
    if (params.to !== undefined) query.to = params.to;

    const raw = await api<RawAnnotation[]>('/annotations', { query });
    return { annotations: raw.map(mapAnnotation) };
  },
});
