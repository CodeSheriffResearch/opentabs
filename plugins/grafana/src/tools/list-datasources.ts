import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawDatasource, datasourceSchema, mapDatasource } from './schemas.js';

export const listDatasources = defineTool({
  name: 'list_datasources',
  displayName: 'List Data Sources',
  description:
    'List all configured data sources in the Grafana instance. Data sources define connections to backends like Prometheus, InfluxDB, Elasticsearch, PostgreSQL, and more.',
  summary: 'List all data sources',
  icon: 'database',
  group: 'Data Sources',
  input: z.object({}),
  output: z.object({
    datasources: z.array(datasourceSchema).describe('List of data sources'),
  }),
  handle: async () => {
    const raw = await api<RawDatasource[]>('/datasources');
    return { datasources: raw.map(mapDatasource) };
  },
});
