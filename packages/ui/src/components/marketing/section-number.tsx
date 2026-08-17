import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SectionNumberProps extends React.HTMLAttributes<HTMLDivElement> {
  number: string | number;
  label?: string;
}

export const SectionNumber = React.forwardRef<HTMLDivElement, SectionNumberProps>(
  ({ number, label, className, ...props }, ref) => {
    const formatted = typeof number === 'number' ? String(number).padStart(2, '0') : number;

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-2 font-mono text-xs text-muted-foreground', className)}
        {...props}
      >
        <span className="flex h-5 items-center rounded border border-highlight/30 bg-highlight/10 px-1.5 font-bold text-highlight text-[11px]">
          {formatted}
        </span>
        {label && <span className="uppercase tracking-wider text-[10px] font-semibold">{label}</span>}
      </div>
    );
  }
);
SectionNumber.displayName = 'SectionNumber';
