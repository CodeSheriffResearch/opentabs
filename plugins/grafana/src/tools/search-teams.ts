import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawTeam, teamSchema, mapTeam } from './schemas.js';

export const searchTeams = defineTool({
  name: 'search_teams',
  displayName: 'Search Teams',
  description:
    'Search for teams in the Grafana instance. Teams group users together for shared dashboard and folder permissions. Supports text search and pagination.',
  summary: 'Search teams by name',
  icon: 'users',
  group: 'Teams',
  input: z.object({
    query: z.string().optional().describe('Search query to filter teams by name'),
    page: z.number().optional().describe('Page number for pagination (1-based)'),
    per_page: z.number().optional().describe('Number of results per page'),
  }),
  output: z.object({
    teams: z.array(teamSchema).describe('List of matching teams'),
    total_count: z.number().describe('Total number of teams matching the query'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.query !== undefined) query.query = params.query;
    if (params.page !== undefined) query.page = params.page;
    if (params.per_page !== undefined) query.perPage = params.per_page;

    const res = await api<{ teams: RawTeam[]; totalCount: number }>('/teams/search', { query });
    return {
      teams: res.teams.map(mapTeam),
      total_count: res.totalCount,
    };
  },
});
