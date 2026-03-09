import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

export const deleteAlertRule = defineTool({
  name: 'delete_alert_rule',
  displayName: 'Delete Alert Rule',
  description:
    'Permanently delete a provisioned alert rule by its UID. This stops the rule from evaluating and removes it from the alerting system. This action cannot be undone.',
  summary: 'Delete an alert rule by UID',
  icon: 'bell-off',
  group: 'Alerting',
  input: z.object({
    uid: z.string().describe('UID of the alert rule to delete'),
  }),
  output: z.object({
    success: z.boolean().describe('Whether the alert rule was successfully deleted'),
  }),
  handle: async params => {
    await api(`/v1/provisioning/alert-rules/${params.uid}`, { method: 'DELETE' });
    return { success: true };
  },
});
