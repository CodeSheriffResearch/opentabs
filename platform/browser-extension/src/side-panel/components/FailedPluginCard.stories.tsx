import { FailedPluginCard } from './FailedPluginCard';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FailedPluginCard> = {
  title: 'Components/FailedPluginCard',
  component: FailedPluginCard,
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj<typeof FailedPluginCard>;

const Default: Story = {
  args: { plugin: { specifier: '/Users/dev/plugins/broken', error: 'Missing dist/tools.json' } },
};

export default meta;
export { Default };
