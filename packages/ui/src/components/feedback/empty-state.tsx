import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';

export const emptyStateVariants = cva(
  'flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50',
  {
    variants: {
      variant: {
        default: 'border-border bg-card/50',
        error: 'border-destructive/40 bg-destructive/5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon: Icon,
      title,
      description,
      actionLabel,
      onAction,
      secondaryActionLabel,
      onSecondaryAction,
      variant,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant }), className)}
        {...props}
      >
        {Icon && (
          <div
            className={cn(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
              variant === 'error'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
        )}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>

        {(actionLabel || secondaryActionLabel || children) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actionLabel && (
              <Button onClick={onAction} size="sm">
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}
            {children}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';
