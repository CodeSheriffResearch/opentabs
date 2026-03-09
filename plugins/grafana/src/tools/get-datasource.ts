import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawDatasource, datasourceSchema, mapDatasource } from './schemas.js';

export const getDatasource = defineTool({
  name: 'get_datasource',
  displayName: 'Get Data Source',
  description:
    'Get detailed information about a specific data source by its UID. Returns the data source name, type, URL, database, access mode, and configuration.',
  summary: 'Get a data source by UID',
  icon: 'database',
  group: 'Data Sources',
  input: z.object({
    uid: z.string().describe('Data source UID'),
  }),
  output: z.object({
    datasource: datasourceSchema.describe('Data source details'),
  }),
  handle: async params => {
    const raw = await api<RawDatasource>(`/datasources/uid/${params.uid}`);
    return { datasource: mapDatasource(raw) };
  },
});
