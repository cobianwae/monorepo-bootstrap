import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const statementCardVariants = cva(
  'relative overflow-hidden rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        inverted:
          'bg-foreground text-background border border-foreground/20 shadow-xl [&_.statement-muted]:text-background/70 [&_.statement-border]:border-background/20',
        neon:
          'bg-card text-card-foreground border-2 border-highlight/40 shadow-lg shadow-highlight/5 hover:border-highlight hover:shadow-highlight/10',
        glass:
          'bg-card/70 backdrop-blur-xl border border-border/80 text-foreground shadow-sm hover:shadow-md',
        gradient:
          'bg-gradient-to-br from-card via-card to-highlight/10 border border-border text-foreground shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4 sm:p-5',
        default: 'p-6 sm:p-8',
        lg: 'p-8 sm:p-12',
      },
    },
    defaultVariants: {
      variant: 'gradient',
      padding: 'default',
    },
  }
);

export interface StatementCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statementCardVariants> {
  glow?: boolean;
}

export const StatementCard = React.forwardRef<HTMLDivElement, StatementCardProps>(
  ({ className, variant, padding, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statementCardVariants({ variant, padding, className }))}
        {...props}
      >
        {glow && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-highlight/20 blur-2xl"
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
StatementCard.displayName = 'StatementCard';
