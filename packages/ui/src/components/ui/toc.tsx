'use client';

import * as React from 'react';
import type { TocHeading } from '@shared/types';
import { cn } from '../../lib/utils';

export type { TocHeading };

export function useActiveToc(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver === 'undefined' ||
      itemIds.length === 0
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0% 0% -75% 0%',
        threshold: 0.1,
      }
    );

    itemIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itemIds]);

  return activeId;
}

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLDivElement> {
  headings: TocHeading[];
  title?: string;
  activeId?: string;
}

export function TableOfContents({
  headings,
  title = 'On This Page',
  activeId: controlledActiveId,
  className,
  ...props
}: TableOfContentsProps) {
  const itemIds = React.useMemo(() => headings.map((h) => h.id), [headings]);
  const autoActiveId = useActiveToc(itemIds);
  const currentActiveId = controlledActiveId ?? autoActiveId;

  if (headings.length === 0) return null;

  return (
    <div className={cn('space-y-3 text-sm', className)} {...props}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
        {title}
      </p>
      <ul className="space-y-2 border-l border-border pl-3">
        {headings.map((heading) => {
          const isActive = currentActiveId === heading.id;
          return (
            <li
              key={heading.id}
              className={cn(
                'transition-colors',
                heading.level === 3 && 'pl-3 text-xs'
              )}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  'block truncate py-0.5 transition-colors hover:text-foreground',
                  isActive
                    ? 'font-medium text-highlight'
                    : 'text-muted-foreground'
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
