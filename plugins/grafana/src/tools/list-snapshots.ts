import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawSnapshot, snapshotSchema, mapSnapshot } from './schemas.js';

export const listSnapshots = defineTool({
  name: 'list_snapshots',
  displayName: 'List Snapshots',
  description:
    'List all dashboard snapshots in the Grafana instance. Snapshots are point-in-time captures of dashboard data that can be shared externally without requiring Grafana access.',
  summary: 'List all dashboard snapshots',
  icon: 'camera',
  group: 'Snapshots',
  input: z.object({}),
  output: z.object({
    snapshots: z.array(snapshotSchema).describe('List of dashboard snapshots'),
  }),
  handle: async () => {
    const raw = await api<RawSnapshot[]>('/dashboard/snapshots');
    return { snapshots: raw.map(mapSnapshot) };
  },
});
