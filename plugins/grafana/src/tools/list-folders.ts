import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawFolder, folderSchema, mapFolder } from './schemas.js';

export const listFolders = defineTool({
  name: 'list_folders',
  displayName: 'List Folders',
  description:
    'List all folders in the Grafana instance. Folders organize dashboards into logical groups. Supports pagination via limit and page parameters.',
  summary: 'List all folders',
  icon: 'folder',
  group: 'Folders',
  input: z.object({
    limit: z.number().optional().describe('Maximum number of folders to return per page'),
    page: z.number().optional().describe('Page number for pagination (1-based)'),
  }),
  output: z.object({
    folders: z.array(folderSchema).describe('List of folders'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.page !== undefined) query.page = params.page;

    const raw = await api<RawFolder[]>('/folders', { query });
    return { folders: raw.map(mapFolder) };
  },
});
