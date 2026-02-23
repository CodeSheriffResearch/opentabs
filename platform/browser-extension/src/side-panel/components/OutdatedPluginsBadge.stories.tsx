import { OutdatedPluginsBadge } from './OutdatedPluginsBadge';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof OutdatedPluginsBadge> = {
  title: 'Components/OutdatedPluginsBadge',
  component: OutdatedPluginsBadge,
  decorators: [Story => <div className="w-80 pt-48">{Story()}</div>],
};

type Story = StoryObj<typeof OutdatedPluginsBadge>;

const SinglePlugin: Story = {
  args: {
    outdatedPlugins: [
      {
        name: 'opentabs-plugin-slack',
        currentVersion: '0.1.0',
        latestVersion: '0.2.0',
        updateCommand: 'npm install -g opentabs-plugin-slack@latest',
      },
    ],
  },
};

const MultiplePlugins: Story = {
  args: {
    outdatedPlugins: [
      {
        name: 'opentabs-plugin-slack',
        currentVersion: '0.1.0',
        latestVersion: '0.2.0',
        updateCommand: 'npm install -g opentabs-plugin-slack@latest',
      },
      {
        name: 'opentabs-plugin-github',
        currentVersion: '1.0.0',
        latestVersion: '1.3.0',
        updateCommand: 'npm install -g opentabs-plugin-github@latest',
      },
      {
        name: '@myorg/opentabs-plugin-jira',
        currentVersion: '2.1.0',
        latestVersion: '3.0.0',
        updateCommand: 'npm install -g @myorg/opentabs-plugin-jira@latest',
      },
    ],
  },
};

const Empty: Story = {
  args: {
    outdatedPlugins: [],
  },
};

export default meta;
export { SinglePlugin, MultiplePlugins, Empty };
