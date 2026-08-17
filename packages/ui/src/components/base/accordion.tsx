'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'divide-y divide-border',
      separated: 'space-y-3',
      bordered: 'border border-border rounded-xl divide-y divide-border overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b border-border last:border-b-0',
      separated:
        'border border-border rounded-xl bg-card shadow-xs transition-colors hover:border-border/80 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm',
      bordered: 'bg-card px-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type AccordionProps = (
  | AccordionPrimitive.AccordionSingleProps
  | AccordionPrimitive.AccordionMultipleProps
) &
  VariantProps<typeof accordionVariants> & {
    className?: string;
  };

const AccordionContext = React.createContext<{
  variant?: 'default' | 'separated' | 'bordered';
}>({ variant: 'default' });

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ className, variant = 'default', ...props }, ref) => (
  <AccordionContext.Provider value={{ variant: variant || 'default' }}>
    <AccordionPrimitive.Root
      ref={ref}
      className={cn(accordionVariants({ variant }), className)}
      {...(props as React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>)}
    />
  </AccordionContext.Provider>
));
Accordion.displayName = 'Accordion';

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  );
});
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 text-left text-sm',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down pb-4 pt-0 text-muted-foreground',
      className
    )}
    {...props}
  >
    <div className="pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
