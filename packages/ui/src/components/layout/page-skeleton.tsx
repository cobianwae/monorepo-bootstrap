import type * as React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../base/skeleton';

export interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  cards?: number;
  columns?: string;
  showHeader?: boolean;
}

export function PageSkeleton({
  className,
  cards = 6,
  columns = 'sm:grid-cols-2 lg:grid-cols-3',
  showHeader = true,
  ...props
}: PageSkeletonProps) {
  return (
    <div className={cn('space-y-10 animate-in fade-in-50 duration-200', className)} {...props}>
      {showHeader && (
        <div className="space-y-4 border-b border-border/60 pb-6">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-72 rounded-lg sm:h-9" />
          <Skeleton className="h-4 w-full max-w-xl rounded-md" />
          <Skeleton className="h-4 w-2/3 max-w-md rounded-md" />
        </div>
      )}
      <div className={cn('grid grid-cols-1 gap-4', columns)}>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}