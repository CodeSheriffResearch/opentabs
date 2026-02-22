import { ToolIcon } from './ToolIcon';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ToolIcon> = { title: 'Components/ToolIcon', component: ToolIcon };

type Story = StoryObj<typeof ToolIcon>;

const Default: Story = { args: {} };
const WithIcon: Story = { args: { icon: 'send' } };
const Mail: Story = { args: { icon: 'mail' } };
const Search: Story = { args: { icon: 'search' } };

const Gallery: Story = {
  render: () => {
    const icons = ['send', 'mail', 'search', 'settings', 'trash-2', 'plus', 'edit', 'eye', 'download', undefined];
    return (
      <div className="flex gap-2">
        {icons.map((icon, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <ToolIcon icon={icon} />
            <span className="text-muted-foreground font-mono text-[10px]">{icon ?? 'none'}</span>
          </div>
        ))}
      </div>
    );
  },
};

export default meta;
export { Default, WithIcon, Mail, Search, Gallery };
