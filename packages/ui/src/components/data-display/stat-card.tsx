import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../base/card';

export const statCardVariants = cva(
  'h-full overflow-hidden transition-all duration-200 relative',
  {
    variants: {
      variant: {
        default:
          'border-border bg-card/90 backdrop-blur-xs shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-border-strong',
        highlight:
          'border-highlight/30 bg-gradient-to-br from-highlight/[0.08] via-card to-card shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-highlight/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  delta?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: LucideIcon;
  description?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      delta,
      icon: Icon,
      description,
      variant,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(statCardVariants({ variant, className }))}
        {...props}
      >
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              {Icon && (
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                    variant === 'highlight'
                      ? 'bg-highlight/15 text-highlight border border-highlight/20'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-display sm:text-3xl tabular-nums">
                {value}
              </span>

              {delta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    delta.trend === 'up' &&
                      'bg-success/15 text-success dark:bg-success/20',
                    delta.trend === 'down' &&
                      'bg-destructive/15 text-destructive dark:bg-destructive/20',
                    delta.trend === 'neutral' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {delta.trend === 'up' && <TrendingUp className="h-3 w-3 shrink-0" />}
                  {delta.trend === 'down' && <TrendingDown className="h-3 w-3 shrink-0" />}
                  <span>{delta.value}</span>
                </span>
              )}
            </div>
          </div>

          <div className="min-h-5 mt-1.5">
            {(delta?.label || description) ? (
              <p className="text-xs text-muted-foreground truncate">
                {delta?.label || description}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }
);
StatCard.displayName = 'StatCard';
