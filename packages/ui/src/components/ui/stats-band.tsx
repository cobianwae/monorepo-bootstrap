import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Container } from './container';

export const statsBandVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'py-12 sm:py-16',
      card: 'p-8 sm:p-12 rounded-2xl border border-border bg-card shadow-xs',
      bordered: 'py-12 border-y border-border bg-muted/20',
    },
    columns: {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    columns: 4,
  },
});

export interface StatsBandProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsBandVariants> {
  containerSize?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const StatsBand = React.forwardRef<HTMLDivElement, StatsBandProps>(
  ({ className, variant, columns, containerSize = 'xl', children, ...props }, ref) => {
    const isCard = variant === 'card';
    const content = (
      <div
        ref={ref}
        className={cn('grid gap-8 text-center', statsBandVariants({ variant, columns, className }))}
        {...props}
      >
        {children}
      </div>
    );

    if (isCard) {
      return <Container size={containerSize}>{content}</Container>;
    }

    return (
      <section className={cn(statsBandVariants({ variant, columns: undefined }))}>
        <Container size={containerSize}>
          <div className={cn('grid gap-8 text-center', statsBandVariants({ columns, className }))}>
            {children}
          </div>
        </Container>
      </section>
    );
  }
);
StatsBand.displayName = 'StatsBand';

export interface StatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export const StatItem = React.forwardRef<HTMLDivElement, StatItemProps>(
  ({ className, value, label, description, prefix, suffix, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col items-center space-y-1', className)} {...props}>
        <div className="flex items-baseline justify-center gap-0.5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground font-display tracking-tight">
          {prefix && <span className="text-2xl sm:text-3xl font-bold text-highlight">{prefix}</span>}
          <span>{value}</span>
          {suffix && <span className="text-2xl sm:text-3xl font-bold text-highlight">{suffix}</span>}
        </div>
        <p className="font-semibold text-sm sm:text-base text-foreground font-display">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            {description}
          </p>
        )}
        {children}
      </div>
    );
  }
);
StatItem.displayName = 'StatItem';
