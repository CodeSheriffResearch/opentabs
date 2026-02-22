import { ReturningUserEmptyState } from './ReturningUserEmptyState';
import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ReturningUserEmptyState> = {
  title: 'Components/ReturningUserEmptyState',
  component: ReturningUserEmptyState,
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj<typeof ReturningUserEmptyState>;

const Default: Story = { args: { onResetOnboarding: fn() } };

export default meta;
export { Default };
