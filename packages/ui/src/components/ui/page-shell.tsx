import * as React from 'react';
import { cn } from '../../lib/utils';
import { PageHeader, type PageHeaderProps } from './page-header';

export interface PageShellProps extends PageHeaderProps {
  children: React.ReactNode;
  contentClassName?: string;
}

export function PageShell({
  className,
  contentClassName,
  children,
  ...headerProps
}: PageShellProps) {
  return (
    <div className={cn('space-y-10 animate-in fade-in-50 duration-200', className)}>
      <PageHeader {...headerProps} />
      <div className={cn('space-y-10', contentClassName)}>{children}</div>
    </div>
  );
}