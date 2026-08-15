import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from './card';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-200 hover:shadow-md',
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </span>

            {delta && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                  delta.trend === 'up' &&
                    'bg-success/15 text-success',
                  delta.trend === 'down' &&
                    'bg-destructive/15 text-destructive',
                  delta.trend === 'neutral' &&
                    'bg-muted text-muted-foreground'
                )}
              >
                {delta.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {delta.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {delta.value}
              </span>
            )}
          </div>

          {(delta?.label || description) && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {delta?.label || description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);
StatCard.displayName = 'StatCard';
