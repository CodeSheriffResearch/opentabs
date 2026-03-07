import { ToolError, defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';

export const generateTypes = defineTool({
  name: 'generate_types',
  displayName: 'Generate TypeScript Types',
  description:
    'Generate TypeScript type definitions from a Supabase project database schema. ' +
    'Returns the full TypeScript types for all tables, views, and functions.',
  summary: 'Generate TypeScript types from the DB schema',
  icon: 'file-code',
  group: 'Database',
  input: z.object({
    ref: z.string().min(1).describe('Project reference ID'),
  }),
  output: z.object({
    types: z.string().describe('Generated TypeScript type definitions'),
  }),
  handle: async params => {
    const auth = (() => {
      try {
        const raw = localStorage.getItem('supabase.dashboard.auth.token');
        if (!raw) return null;
        return (JSON.parse(raw) as { access_token?: string }).access_token ?? null;
      } catch {
        return null;
      }
    })();
    if (!auth) throw ToolError.auth('Not authenticated');

    const resp = await fetch(`https://api.supabase.com/v1/projects/${params.ref}/types/typescript`, {
      headers: { Authorization: `Bearer ${auth}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (!resp.ok) {
      const errorBody = (await resp.text().catch(() => '')).substring(0, 512);
      throw ToolError.internal(`Failed to generate types: ${errorBody}`);
    }
    const data = (await resp.json()) as { types?: string };
    return { types: data.types ?? '' };
  },
});
