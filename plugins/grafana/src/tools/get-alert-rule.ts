import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';
import { type RawAlertRule, alertRuleSchema, mapAlertRule } from './schemas.js';

export const getAlertRule = defineTool({
  name: 'get_alert_rule',
  displayName: 'Get Alert Rule',
  description:
    'Get detailed information about a specific alert rule by its UID. Returns the rule title, condition, evaluation interval, folder, labels, and notification settings.',
  summary: 'Get an alert rule by UID',
  icon: 'bell',
  group: 'Alerting',
  input: z.object({
    uid: z.string().describe('Alert rule UID'),
  }),
  output: z.object({
    rule: alertRuleSchema.describe('Alert rule details'),
  }),
  handle: async params => {
    const raw = await api<RawAlertRule>(`/v1/provisioning/alert-rules/${params.uid}`);
    return { rule: mapAlertRule(raw) };
  },
});
