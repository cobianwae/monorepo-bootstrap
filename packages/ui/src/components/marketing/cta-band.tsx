import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Container } from '../layout/container';

export const ctaBandVariants = cva(
  'relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 transition-all',
  {
    variants: {
      variant: {
        glow: 'border border-highlight/40 bg-gradient-to-br from-highlight/15 via-primary/10 to-transparent shadow-xl',
        card: 'border border-border bg-card text-card-foreground shadow-md',
        dark: 'border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl',
        highlight: 'bg-highlight text-highlight-foreground shadow-lg',
      },
      align: {
        center: 'text-center items-center',
        split: 'text-left lg:flex lg:items-center lg:justify-between',
      },
    },
    defaultVariants: {
      variant: 'glow',
      align: 'center',
    },
  }
);

export interface CtaBandProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof ctaBandVariants> {
  badge?: string;
  badgeIcon?: React.ElementType;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const CtaBand = React.forwardRef<HTMLDivElement, CtaBandProps>(
  (
    {
      className,
      variant,
      align,
      badge,
      badgeIcon: BadgeIcon = Sparkles,
      title,
      description,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Container size="xl">
        <div
          ref={ref}
          className={cn(ctaBandVariants({ variant, align, className }))}
          {...props}
        >
          <div className={cn('space-y-4', align === 'split' ? 'max-w-2xl' : 'max-w-3xl mx-auto')}>
            {badge && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-semibold text-highlight font-mono tracking-wide">
                <BadgeIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{badge}</span>
              </div>
            )}

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-display leading-tight text-foreground">
              {title}
            </h2>

            {description && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {children}
          </div>

          {actions && (
            <div
              className={cn(
                'flex flex-wrap items-center gap-3 pt-6 sm:pt-8',
                align === 'split' ? 'lg:pt-0 shrink-0' : 'justify-center'
              )}
            >
              {actions}
            </div>
          )}
        </div>
      </Container>
    );
  }
);
CtaBand.displayName = 'CtaBand';
