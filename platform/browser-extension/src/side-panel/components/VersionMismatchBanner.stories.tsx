import { VersionMismatchBanner } from './VersionMismatchBanner';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof VersionMismatchBanner> = {
  title: 'Components/VersionMismatchBanner',
  component: VersionMismatchBanner,
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj<typeof VersionMismatchBanner>;

const Default: Story = {};

export default meta;
export { Default };
