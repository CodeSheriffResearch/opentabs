import { DisconnectedState, NoPluginsState, LoadingState } from './EmptyStates';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/EmptyStates',
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj;

const Disconnected: Story = { render: () => <DisconnectedState /> };
const NoPlugins: Story = { render: () => <NoPluginsState /> };
const Loading: Story = { render: () => <LoadingState /> };

export default meta;
export { Disconnected, NoPlugins, Loading };
