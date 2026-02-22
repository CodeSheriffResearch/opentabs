import { Accordion } from './Accordion';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Retro/Accordion',
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj;

const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="space-y-2">
      <Accordion.Item value="a">
        <Accordion.Header>Section A</Accordion.Header>
        <Accordion.Content className="p-3">Content A</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>Section B</Accordion.Header>
        <Accordion.Content className="p-3">Content B</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['a']} className="space-y-2">
      <Accordion.Item value="a">
        <Accordion.Header>Open by default</Accordion.Header>
        <Accordion.Content className="p-3">This starts open.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>Collapsed</Accordion.Header>
        <Accordion.Content className="p-3">Click to expand.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export default meta;
export { Single, Multiple };
