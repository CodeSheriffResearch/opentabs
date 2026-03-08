import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { isTeamsAuthenticated, waitForTeamsAuth } from './teams-api.js';
import { createChat } from './tools/create-chat.js';
import { deleteMessage } from './tools/delete-message.js';
import { editMessage } from './tools/edit-message.js';
import { listConversations } from './tools/list-conversations.js';
import { readMessages } from './tools/read-messages.js';
import { sendMessage } from './tools/send-message.js';

class TeamsPlugin extends OpenTabsPlugin {
  readonly name = 'teams';
  readonly description = 'OpenTabs plugin for Microsoft Teams';
  override readonly displayName = 'Microsoft Teams';
  readonly urlPatterns = ['*://teams.live.com/*', '*://teams.microsoft.com/*'];
  override readonly homepage = 'https://teams.live.com/v2/';
  readonly tools: ToolDefinition[] = [
    // Chats
    listConversations,
    createChat,
    // Messages
    sendMessage,
    readMessages,
    editMessage,
    deleteMessage,
  ];

  async isReady(): Promise<boolean> {
    if (isTeamsAuthenticated()) return true;
    return waitForTeamsAuth();
  }
}

export default new TeamsPlugin();
