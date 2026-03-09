import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const deleteAnnotation = defineTool({
  name: 'delete_annotation',
  displayName: 'Delete Annotation',
  description:
    'Permanently delete an annotation by its numeric ID. This removes the annotation marker from all dashboard graphs. This action cannot be undone.',
  summary: 'Delete an annotation by ID',
  icon: 'message-square-x',
  group: 'Annotations',
  input: z.object({
    id: z.number().describe('Annotation ID'),
  }),
  output: z.object({
    success: z.boolean().describe('Whether the annotation was successfully deleted'),
  }),
  handle: async params => {
    await api(`/annotations/${params.id}`, { method: 'DELETE' });
    return { success: true };
  },
});
