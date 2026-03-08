import { z } from 'zod';

// ---------------------------------------------------------------------------
// Conversation (chat) schema
// ---------------------------------------------------------------------------

export const conversationSchema = z.object({
  id: z.string().describe('Conversation/thread ID'),
  type: z.string().describe('Conversation type (e.g., "Conversation")'),
  thread_type: z.string().describe('Thread type (e.g., "chat", "topic")'),
  last_message_content: z.string().describe('Content of the last message'),
  last_message_type: z.string().describe('Message type of the last message'),
  last_message_time: z.string().describe('Timestamp of the last message'),
  version: z.number().describe('Conversation version'),
});

export type Conversation = z.infer<typeof conversationSchema>;

interface RawConversation {
  id?: string;
  type?: string;
  threadProperties?: Record<string, unknown>;
  lastMessage?: Record<string, unknown>;
  version?: number;
}

export const mapConversation = (c: RawConversation): Conversation => ({
  id: c.id ?? '',
  type: c.type ?? '',
  thread_type: String(c.threadProperties?.threadType ?? ''),
  last_message_content: String(c.lastMessage?.content ?? ''),
  last_message_type: String(c.lastMessage?.messagetype ?? ''),
  last_message_time: String(c.lastMessage?.composetime ?? ''),
  version: typeof c.version === 'number' ? c.version : 0,
});

// ---------------------------------------------------------------------------
// Message schema
// ---------------------------------------------------------------------------

export const messageSchema = z.object({
  id: z.string().describe('Message ID (timestamp-based)'),
  client_message_id: z.string().describe('Client-assigned message ID'),
  content: z.string().describe('Message content (may contain HTML)'),
  message_type: z.string().describe('Message type (e.g., "RichText/Html", "Text")'),
  from: z.string().describe('Sender MRI (e.g., "8:live:username")'),
  display_name: z.string().describe('Sender display name'),
  compose_time: z.string().describe('When the message was composed (ISO 8601)'),
  conversation_id: z.string().describe('ID of the conversation this message belongs to'),
});

export type Message = z.infer<typeof messageSchema>;

interface RawMessage {
  id?: string;
  clientmessageid?: string;
  content?: string;
  messagetype?: string;
  from?: string;
  imdisplayname?: string;
  composetime?: string;
  conversationid?: string;
}

/** Extract the MRI (e.g., "8:live:username") from a full contact URL. */
const extractMri = (from: string): string => {
  const match = /\/contacts\/(.+)$/.exec(from);
  return match?.[1] ?? from;
};

export const mapMessage = (m: RawMessage): Message => ({
  id: m.id ?? '',
  client_message_id: m.clientmessageid ?? '',
  content: m.content ?? '',
  message_type: m.messagetype ?? '',
  from: extractMri(m.from ?? ''),
  display_name: m.imdisplayname ?? '',
  compose_time: m.composetime ?? '',
  conversation_id: m.conversationid ?? '',
});
