import { Button } from './Button';
import { Menu } from './Menu';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Retro/Menu',
  decorators: [Story => <div className="p-16">{Story()}</div>],
};

type Story = StoryObj;

const Default: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <Button size="sm">Open Menu</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Edit</Menu.Item>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

const MultipleItems: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <Button size="sm">Actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Cut</Menu.Item>
        <Menu.Item>Copy</Menu.Item>
        <Menu.Item>Paste</Menu.Item>
        <Menu.Item>Select All</Menu.Item>
        <Menu.Item>Find &amp; Replace</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

const DisabledItem: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger asChild>
        <Button size="sm">File</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>New</Menu.Item>
        <Menu.Item>Open</Menu.Item>
        <Menu.Item disabled>Save (read-only)</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
};

export default meta;
export { Default, MultipleItems, DisabledItem };
