import { Switch } from './Switch';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Switch> = { title: 'Retro/Switch', component: Switch };

type Story = StoryObj<typeof Switch>;

const Default: Story = { args: { defaultChecked: false } };
const Checked: Story = { args: { defaultChecked: true } };
const Disabled: Story = { args: { disabled: true } };

const InteractiveDemo = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <span className="text-foreground font-sans text-sm">{checked ? 'On' : 'Off'}</span>
    </div>
  );
};

const Interactive: Story = { render: () => <InteractiveDemo /> };

export default meta;
export { Default, Checked, Disabled, Interactive };
