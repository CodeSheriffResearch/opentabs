import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawContactPoint, contactPointSchema, mapContactPoint } from './schemas.js';

export const listContactPoints = defineTool({
  name: 'list_contact_points',
  displayName: 'List Contact Points',
  description:
    'List all provisioned contact points in the Grafana alerting system. Contact points define notification channels (email, Slack, PagerDuty, webhook, etc.) where alerts are sent.',
  summary: 'List all contact points',
  icon: 'phone',
  group: 'Alerting',
  input: z.object({}),
  output: z.object({
    contact_points: z.array(contactPointSchema).describe('List of contact points'),
  }),
  handle: async () => {
    const raw = await api<RawContactPoint[]>('/v1/provisioning/contact-points');
    return { contact_points: raw.map(mapContactPoint) };
  },
});
