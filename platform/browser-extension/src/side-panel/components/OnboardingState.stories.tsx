import { OnboardingState } from './OnboardingState';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof OnboardingState> = {
  title: 'Components/OnboardingState',
  component: OnboardingState,
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj<typeof OnboardingState>;

const Fresh: Story = { name: 'First Time', args: { connected: false, pluginCount: 0 } };
const ServerRunning: Story = { name: 'Server Running', args: { connected: true, pluginCount: 0 } };
const Complete: Story = { name: 'All Done', args: { connected: true, pluginCount: 2 } };

export default meta;
export { Fresh, ServerRunning, Complete };
