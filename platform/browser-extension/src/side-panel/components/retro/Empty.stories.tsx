import { Empty } from './Empty';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Retro/Empty',
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj;

const Default: Story = {
  render: () => (
    <Empty>
      <Empty.Content>
        <Empty.Icon className="text-muted-foreground h-12 w-12" />
        <Empty.Title>Nothing Here</Empty.Title>
        <Empty.Separator />
        <Empty.Description>No items to display.</Empty.Description>
      </Empty.Content>
    </Empty>
  ),
};

export default meta;
export { Default };
