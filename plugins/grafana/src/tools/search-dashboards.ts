import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawDashboardSearch, dashboardSearchSchema, mapDashboardSearch } from './schemas.js';

export const searchDashboards = defineTool({
  name: 'search_dashboards',
  displayName: 'Search Dashboards',
  description:
    'Search for dashboards and folders by query, tag, type, or starred status. Returns matching items with metadata.',
  summary: 'Search dashboards and folders',
  icon: 'search',
  group: 'Dashboards',
  input: z.object({
    query: z.string().optional().describe('Search query'),
    tag: z.string().optional().describe('Filter by tag'),
    type: z.enum(['dash-db', 'dash-folder']).optional().describe('Filter by type'),
    starred: z.boolean().optional().describe('Only return starred dashboards'),
    folder_uids: z.string().optional().describe('Comma-separated folder UIDs to filter by'),
    limit: z.number().int().min(1).max(5000).optional().describe('Maximum number of results (default 50, max 5000)'),
    page: z.number().optional().describe('Page number for pagination'),
  }),
  output: z.object({
    dashboards: z.array(dashboardSearchSchema),
  }),
  async handle(params) {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.query) query.query = params.query;
    if (params.tag) query.tag = params.tag;
    if (params.type) query.type = params.type;
    if (params.starred !== undefined) query.starred = params.starred;
    if (params.folder_uids) query.folderUIDs = params.folder_uids;
    if (params.limit) query.limit = params.limit;
    if (params.page) query.page = params.page;

    const results = await api<RawDashboardSearch[]>('/search', { query });

    return { dashboards: results.map(mapDashboardSearch) };
  },
});
