import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const deleteFolder = defineTool({
  name: 'delete_folder',
  displayName: 'Delete Folder',
  description:
    'Permanently delete a Grafana folder by its UID. This also deletes all dashboards contained within the folder. This action cannot be undone.',
  summary: 'Delete a folder by UID',
  icon: 'folder-x',
  group: 'Folders',
  input: z.object({
    uid: z.string().describe('UID of the folder to delete'),
  }),
  output: z.object({
    success: z.boolean().describe('Whether the folder was successfully deleted'),
  }),
  handle: async params => {
    await api(`/folders/${params.uid}`, { method: 'DELETE' });
    return { success: true };
  },
});
