import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const kbdVariants = cva(
  'pointer-events-none inline-flex select-none items-center gap-1 rounded border border-border bg-muted font-mono font-medium text-muted-foreground shadow-2xs',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground border-border/80',
        outline: 'bg-transparent border-border text-foreground',
        subtle: 'bg-muted/50 border-transparent text-muted-foreground',
      },
      size: {
        sm: 'h-5 min-w-[20px] px-1 text-[10px]',
        default: 'h-6 min-w-[24px] px-1.5 text-xs',
        lg: 'h-7 min-w-[28px] px-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  children?: React.ReactNode;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(kbdVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = 'Kbd';
