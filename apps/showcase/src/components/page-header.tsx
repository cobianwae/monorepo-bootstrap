import * as React from 'react';
import { cn } from '@ds/ui';

export interface PageHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: React.ElementType;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-6',
        className
      )}
    >
      <div className="space-y-2 max-w-3xl">
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-0.5 text-xs font-semibold text-highlight font-mono tracking-wide">
            {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 shrink-0" />}
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-display">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:self-start pt-1 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
