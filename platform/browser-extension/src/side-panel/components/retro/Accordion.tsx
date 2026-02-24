import { cn } from '../../lib/cn';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as React from 'react';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'bg-background text-foreground overflow-hidden rounded border-2 shadow-md transition-all hover:shadow-sm data-[state=open]:shadow-sm',
      className,
    )}
    {...props}
  />
));
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up bg-card text-card-foreground overflow-hidden font-sans"
    {...props}>
    <div className={cn(className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const AccordionComponent = Object.assign(Accordion, {
  Item: AccordionItem,
  Content: AccordionContent,
});

export { AccordionComponent as Accordion };
