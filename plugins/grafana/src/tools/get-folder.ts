import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawFolder, folderSchema, mapFolder } from './schemas.js';

export const getFolder = defineTool({
  name: 'get_folder',
  displayName: 'Get Folder',
  description:
    'Get detailed information about a specific Grafana folder by its UID. Returns the folder title, UID, URL, and metadata.',
  summary: 'Get a folder by UID',
  icon: 'folder-open',
  group: 'Folders',
  input: z.object({
    uid: z.string().describe('Folder UID'),
  }),
  output: z.object({
    folder: folderSchema.describe('Folder details'),
  }),
  handle: async params => {
    const raw = await api<RawFolder>(`/folders/${params.uid}`);
    return { folder: mapFolder(raw) };
  },
});
