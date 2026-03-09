import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawAlertRule, alertRuleSchema, mapAlertRule } from './schemas.js';

export const listAlertRules = defineTool({
  name: 'list_alert_rules',
  displayName: 'List Alert Rules',
  description:
    'List all provisioned alert rules in the Grafana instance. Alert rules define conditions that trigger alerts when metrics cross thresholds or match expressions.',
  summary: 'List all alert rules',
  icon: 'bell',
  group: 'Alerting',
  input: z.object({}),
  output: z.object({
    rules: z.array(alertRuleSchema).describe('List of alert rules'),
  }),
  handle: async () => {
    const raw = await api<RawAlertRule[]>('/v1/provisioning/alert-rules');
    return { rules: raw.map(mapAlertRule) };
  },
});
