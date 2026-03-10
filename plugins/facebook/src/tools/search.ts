import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { graphql } from '../facebook-api.js';
import { type RawSearchSuggestionEdge, mapSearchSuggestion, searchSuggestionSchema } from './schemas.js';

interface SearchBootstrapResponse {
  viewer?: {
    bootstrap_keywords?: {
      edges?: RawSearchSuggestionEdge[];
    };
  };
}

export const search = defineTool({
  name: 'search',
  displayName: 'Search Facebook',
  description:
    'Search Facebook for people, pages, groups, and other entities. Returns suggestions with entity ID, type, title, and link URL. Useful for finding user IDs to use with other tools.',
  summary: 'Search Facebook entities',
  icon: 'search',
  group: 'Search',
  input: z.object({
    query: z.string().describe('Search query text'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum results to return (default 20, max 100)'),
  }),
  output: z.object({
    results: z.array(searchSuggestionSchema),
  }),
  handle: async params => {
    const data = await graphql<SearchBootstrapResponse>('CometSearchBootstrapKeywordsDataSourceQuery', {
      first: params.limit ?? 20,
    });

    const edges = data.viewer?.bootstrap_keywords?.edges ?? [];

    // Filter edges where keyword matches the query (case-insensitive)
    const queryLower = params.query.toLowerCase();
    const filtered = edges.filter(e => (e.node?.keyword_text ?? '').toLowerCase().includes(queryLower));

    // If no filter match (e.g., query doesn't match suggestions), return all
    const results = (filtered.length > 0 ? filtered : edges).map(mapSearchSuggestion);

    return { results };
  },
});
