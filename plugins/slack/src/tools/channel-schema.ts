import { z } from 'zod';

/**
 * Shared Zod schema for a Slack channel object — used by list-channels, get-channel-info,
 * and any other tool that returns channel data.
 */
export const channelSchema = z.object({
  id: z.string().describe('Channel ID (e.g., C01234567)'),
  name: z.string().describe('Channel name without the # prefix'),
  is_channel: z.boolean().describe('Whether this is a public channel'),
  is_private: z.boolean().describe('Whether this is a private channel'),
  num_members: z.number().describe('Number of members in the channel'),
  topic: z
    .object({
      value: z.string().describe('Channel topic text'),
    })
    .describe('Channel topic'),
  purpose: z
    .object({
      value: z.string().describe('Channel purpose text'),
    })
    .describe('Channel purpose'),
});

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  num_members: number;
  topic: { value: string };
  purpose: { value: string };
}

/**
 * Map a raw Slack channel object to a defensively-typed channel shape.
 */
export const mapChannel = (c: Partial<SlackChannel>): z.infer<typeof channelSchema> => ({
  id: c.id ?? '',
  name: c.name ?? '',
  is_channel: c.is_channel ?? false,
  is_private: c.is_private ?? false,
  num_members: c.num_members ?? 0,
  topic: { value: c.topic?.value ?? '' },
  purpose: { value: c.purpose?.value ?? '' },
});
