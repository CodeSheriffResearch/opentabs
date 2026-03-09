import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawTeamMember, teamMemberSchema, mapTeamMember } from './schemas.js';

export const listTeamMembers = defineTool({
  name: 'list_team_members',
  displayName: 'List Team Members',
  description:
    'List all members of a specific team by team ID. Returns each member with their user ID, login, email, and avatar URL.',
  summary: 'List members of a team',
  icon: 'users',
  group: 'Teams',
  input: z.object({
    team_id: z.number().describe('Team ID'),
  }),
  output: z.object({
    members: z.array(teamMemberSchema).describe('List of team members'),
  }),
  handle: async params => {
    const raw = await api<RawTeamMember[]>(`/teams/${params.team_id}/members`);
    return { members: raw.map(mapTeamMember) };
  },
});
