'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../base/badge';

export type TimelineItemStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: string;
  icon?: LucideIcon;
  status?: TimelineItemStatus;
  badges?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }[];
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
  align?: 'left' | 'alternate';
  lineClassName?: string;
}

const STATUS_STYLES: Record<TimelineItemStatus, string> = {
  default: 'bg-border text-muted-foreground',
  success: 'bg-success/20 text-success',
  warning: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  error: 'bg-destructive/20 text-destructive',
  info: 'bg-primary/20 text-primary',
};

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, items, align = 'left', lineClassName, ...props }, ref) => {
    return (
      <ol ref={ref} className={cn('space-y-0', className)} {...props}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.id}
              className={cn(
                'relative flex gap-4 pb-8',
                isLast && 'pb-0',
                align === 'alternate' && index % 2 === 1 && 'flex-row-reverse'
              )}
            >
              {/* Connector line */}
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-[15px] top-8 bottom-0 w-px bg-border',
                    align === 'alternate' && 'left-auto right-[15px]',
                    lineClassName
                  )}
                />
              )}
              {/* Icon / dot */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full',
                    STATUS_STYLES[item.status ?? 'default']
                  )}
                >
                  {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </span>
              </div>
              {/* Content */}
              <div
                className={cn(
                  'flex-1 pt-1',
                  align === 'alternate' && index % 2 === 1 && 'text-right'
                )}
              >
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-2',
                    align === 'alternate' && index % 2 === 1 && 'justify-end'
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.timestamp && (
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                  )}
                  {item.badges?.map((b) => (
                    <Badge key={b.label} variant={b.variant ?? 'outline'} className="text-[10px]">
                      {b.label}
                    </Badge>
                  ))}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }
);
Timeline.displayName = 'Timeline';