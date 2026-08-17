import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const glowOrbVariants = cva(
  'pointer-events-none absolute -z-10 rounded-full blur-3xl transition-all duration-700 opacity-35 dark:opacity-25',
  {
    variants: {
      color: {
        highlight: 'bg-highlight',
        primary: 'bg-primary',
        gradient: 'bg-gradient-to-tr from-primary via-highlight to-transparent',
        amber: 'bg-warning',
      },
      size: {
        sm: 'h-40 w-40',
        md: 'h-64 w-64',
        lg: 'h-96 w-96',
        xl: 'h-[32rem] w-[32rem]',
      },
      position: {
        'top-right': '-top-20 -right-20',
        'top-left': '-top-20 -left-20',
        'top-center': '-top-32 left-1/2 -translate-x-1/2',
        center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'bottom-right': '-bottom-20 -right-20',
        'bottom-left': '-bottom-20 -left-20',
      },
    },
    defaultVariants: {
      color: 'gradient',
      size: 'lg',
      position: 'top-right',
    },
  }
);

export interface GlowOrbProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof glowOrbVariants> {}

export const GlowOrb = React.forwardRef<HTMLDivElement, GlowOrbProps>(
  ({ className, color, size, position, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(glowOrbVariants({ color, size, position, className }))}
        {...props}
      />
    );
  }
);
GlowOrb.displayName = 'GlowOrb';
