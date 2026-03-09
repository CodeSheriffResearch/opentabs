import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawFolder, folderSchema, mapFolder } from './schemas.js';

export const createFolder = defineTool({
  name: 'create_folder',
  displayName: 'Create Folder',
  description:
    'Create a new folder in Grafana to organize dashboards. Requires a title. Optionally specify a custom UID — if omitted, Grafana auto-generates one.',
  summary: 'Create a new folder',
  icon: 'folder-plus',
  group: 'Folders',
  input: z.object({
    title: z.string().describe('Folder title'),
    uid: z.string().optional().describe('Custom UID for the folder — auto-generated if omitted'),
  }),
  output: z.object({
    folder: folderSchema.describe('Created folder'),
  }),
  handle: async params => {
    const body: Record<string, string> = { title: params.title };
    if (params.uid !== undefined) body.uid = params.uid;

    const raw = await api<RawFolder>('/folders', { method: 'POST', body });
    return { folder: mapFolder(raw) };
  },
});
