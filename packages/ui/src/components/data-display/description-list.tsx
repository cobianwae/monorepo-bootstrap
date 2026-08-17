'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface DescriptionListItem {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

export interface DescriptionListProps
  extends React.HTMLAttributes<HTMLDListElement> {
  items: DescriptionListItem[];
  columns?: 1 | 2 | 3;
  labelWidth?: string;
  dividers?: boolean;
}

const COLUMN_CLASS: Record<NonNullable<DescriptionListProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, items, columns = 1, dividers = false, ...props }, ref) => {
    return (
      <dl
        ref={ref}
        className={cn('grid gap-x-6', COLUMN_CLASS[columns], className)}
        {...props}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'py-3',
              dividers && 'border-b border-border last:border-b-0'
            )}
          >
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{item.value}</dd>
            {item.hint && <dd className="mt-0.5 text-xs text-muted-foreground">{item.hint}</dd>}
          </div>
        ))}
      </dl>
    );
  }
);
DescriptionList.displayName = 'DescriptionList';