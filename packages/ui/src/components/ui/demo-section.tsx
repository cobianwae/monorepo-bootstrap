import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const demoSectionVariants = cva('rounded-xl border bg-card', {
  variants: {
    variant: {
      default: 'border-border',
      transparent: 'border-border/80 bg-transparent',
      dashed: 'border-dashed border-border/80 bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface DemoSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof demoSectionVariants> {
  label?: React.ReactNode;
  icon?: React.ElementType;
  badge?: React.ReactNode;
  description?: React.ReactNode;
  frameClassName?: string;
}

export function DemoSection({
  className,
  variant,
  frameClassName,
  label,
  icon: Icon,
  badge,
  description,
  children,
  ...props
}: DemoSectionProps) {
  return (
    <section className={cn('space-y-4', className)} {...props}>
      {(label || badge || description) && (
        <div className="flex flex-wrap items-center gap-2">
          {Icon && (
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-highlight/30 bg-highlight/10">
              <Icon className="h-3.5 w-3.5 text-highlight" />
            </span>
          )}
          {label && (
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              {label}
            </h2>
          )}
          {badge && <span className="ml-auto flex items-center">{badge}</span>}
          {description && (
            <p className="w-full text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(demoSectionVariants({ variant }), frameClassName)}>{children}</div>
    </section>
  );
}