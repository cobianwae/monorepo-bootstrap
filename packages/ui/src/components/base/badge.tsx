import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-xs',
        highlight: 'border-transparent bg-highlight text-highlight-foreground shadow-xs',
        'highlight-outline': 'border-highlight/30 bg-highlight/10 text-highlight',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-success text-success-foreground shadow-xs',
        'success-outline': 'border-success/30 bg-success/10 text-success',
        warning: 'border-transparent bg-warning text-warning-foreground shadow-xs',
        'warning-outline': 'border-warning/30 bg-warning/10 text-warning-text',
        info: 'border-info bg-info text-info-foreground shadow-xs',
        'info-outline': 'border-info/30 bg-info/10 text-info',
        'destructive-outline': 'border-destructive/30 bg-destructive/10 text-destructive-text',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] leading-tight',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
