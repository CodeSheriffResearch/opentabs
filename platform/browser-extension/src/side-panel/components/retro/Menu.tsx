import { cn } from '../../lib/cn';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

const Menu = DropdownMenu.Root;

const MenuTrigger = DropdownMenu.Trigger;

const MenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('border-border bg-card z-50 min-w-32 rounded border-2 shadow-md', className)}
      {...props}
    />
  </DropdownMenu.Portal>
));
MenuContent.displayName = DropdownMenu.Content.displayName;

const MenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    className={cn(
      'hover:bg-accent data-[highlighted]:bg-accent cursor-pointer px-3 py-2 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  />
));
MenuItem.displayName = DropdownMenu.Item.displayName;

const MenuComponent = Object.assign(Menu, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
});

export { MenuComponent as Menu };
