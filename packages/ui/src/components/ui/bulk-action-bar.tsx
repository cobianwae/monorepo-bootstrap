'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Separator } from './separator';

export interface BulkAction {
  id: string;
  label: React.ReactNode;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface BulkActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  count: number;
  actions: BulkAction[];
  onClearSelection?: () => void;
  label?: (count: number) => string;
  sticky?: boolean;
}

export const BulkActionBar = React.forwardRef<HTMLDivElement, BulkActionBarProps>(
  (
    {
      open,
      count,
      actions,
      onClearSelection,
      label = (n) => `${n} selected`,
      sticky = true,
      className,
      ...props
    },
    ref
  ) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-150',
          sticky && 'sticky bottom-4 z-20',
          className
        )}
        role="toolbar"
        aria-label="Bulk actions"
        {...props}
      >
        <span className="text-sm font-medium text-foreground">{label(count)}</span>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex flex-wrap items-center gap-1.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                type="button"
                size="sm"
                variant={action.variant ?? 'default'}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
        <div className="ml-auto">
          {onClearSelection && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    );
  }
);
BulkActionBar.displayName = 'BulkActionBar';