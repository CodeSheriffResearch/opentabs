import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../grafana-api.js';

const preferencesSchema = z.object({
  theme: z.string().describe('UI theme preference (empty = default, "dark", "light")'),
  home_dashboard_uid: z.string().describe('Home dashboard UID (empty = default)'),
  timezone: z.string().describe('Timezone preference (empty = browser default)'),
  language: z.string().describe('Language preference'),
});

interface RawPreferences {
  theme?: string;
  homeDashboardUID?: string;
  timezone?: string;
  language?: string;
}

export const getUserPreferences = defineTool({
  name: 'get_user_preferences',
  displayName: 'Get User Preferences',
  description: "Get the current user's Grafana preferences including theme, home dashboard, timezone, and language.",
  summary: 'Get your Grafana preferences',
  icon: 'settings',
  group: 'Account',
  input: z.object({}),
  output: z.object({ preferences: preferencesSchema }),
  handle: async () => {
    const data = await api<RawPreferences>('/user/preferences');
    return {
      preferences: {
        theme: data.theme ?? '',
        home_dashboard_uid: data.homeDashboardUID ?? '',
        timezone: data.timezone ?? '',
        language: data.language ?? '',
      },
    };
  },
});
