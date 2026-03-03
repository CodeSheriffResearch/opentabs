import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ToolRow } from './ToolRow';

const meta: Meta<typeof ToolRow> = {
  title: 'Components/ToolRow',
  component: ToolRow,
  decorators: [Story => <div className="w-80 rounded border-2 border-border">{Story()}</div>],
};

type Story = StoryObj<typeof ToolRow>;

const Enabled: Story = {
  args: {
    name: 'send_message',
    displayName: 'Send Message',
    description: 'Send a message to a channel or direct message conversation',
    icon: 'send',
    enabled: true,
    active: false,
    onToggle: () => {},
  },
};

const Disabled: Story = {
  args: {
    ...Enabled.args,
    enabled: false,
  },
};

const Active: Story = { args: { ...Enabled.args, active: true } };

const LongDescription: Story = {
  args: {
    ...Enabled.args,
    name: 'create_pull_request',
    displayName: 'Create Pull Request',
    description:
      'Create a new pull request from a head branch to a base branch with title, body, reviewers, and labels. Supports draft mode and auto-merge configuration.',
    icon: 'git-pull-request',
  },
};

const InteractiveDemo = () => {
  const [enabled, setEnabled] = useState(true);
  return (
    <ToolRow
      name="send_message"
      displayName="Send Message"
      description="Send a message to a channel or direct message conversation"
      icon="send"
      enabled={enabled}
      active={false}
      onToggle={() => setEnabled(v => !v)}
    />
  );
};

const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

const ToolList: Story = {
  render: () => {
    const tools = [
      {
        name: 'send_message',
        displayName: 'Send Message',
        description: 'Send a message to a channel or direct message conversation',
        icon: 'send',
      },
      {
        name: 'list_channels',
        displayName: 'List Channels',
        description: 'List all public and private channels in the workspace with membership info',
        icon: 'list',
      },
      {
        name: 'search_messages',
        displayName: 'Search Messages',
        description: 'Search messages across channels using keywords, filters, and date ranges',
        icon: 'search',
        active: true,
      },
      {
        name: 'get_user_profile',
        displayName: 'Get User Profile',
        description: 'Retrieve a user profile including display name, email, timezone, and status',
        icon: 'user',
      },
      {
        name: 'upload_file',
        displayName: 'Upload File',
        description: 'Upload a file to a channel or direct message with an optional comment',
        icon: 'upload',
      },
    ];
    return (
      <div>
        {tools.map(t => (
          <ToolRow
            key={t.name}
            name={t.name}
            displayName={t.displayName}
            description={t.description}
            icon={t.icon}
            enabled={true}
            active={'active' in t}
            onToggle={() => {}}
          />
        ))}
      </div>
    );
  },
};

export default meta;
export { Enabled, Disabled, Active, LongDescription, Interactive, ToolList };
