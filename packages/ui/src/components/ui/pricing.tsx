'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { Button } from './button';

export const pricingCardVariants = cva(
  'relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all duration-200',
  {
    variants: {
      popular: {
        true: 'border-highlight bg-card shadow-lg ring-1 ring-highlight',
        false: 'border-border bg-card text-card-foreground shadow-xs hover:border-border/80',
      },
    },
    defaultVariants: {
      popular: false,
    },
  }
);

export interface PricingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pricingCardVariants> {
  name: string;
  description: string;
  price: string | number;
  period?: string;
  badge?: string;
  popular?: boolean;
  ctaText?: string;
  ctaVariant?: 'default' | 'highlight' | 'outline' | 'secondary';
  onCtaClick?: () => void;
  features: Array<{ text: string; included?: boolean; note?: string }>;
}

export const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      name,
      description,
      price,
      period = '/month',
      badge,
      popular = false,
      ctaText = 'Get Started',
      ctaVariant = popular ? 'highlight' : 'outline',
      onCtaClick,
      features,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(pricingCardVariants({ popular, className }))}
        {...props}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-xl font-bold text-foreground font-display">{name}</h3>
            {(badge || popular) && (
              <Badge variant="highlight" className="font-mono text-xs font-bold">
                {badge || 'Most Popular'}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl sm:text-5xl font-extrabold text-foreground font-display tracking-tight">
              {typeof price === 'number' ? `$${price}` : price}
            </span>
            {period && <span className="text-sm text-muted-foreground">{period}</span>}
          </div>

          <Button
            variant={ctaVariant}
            className="w-full mb-8 shadow-xs"
            onClick={onCtaClick}
          >
            {ctaText}
          </Button>

          <div className="space-y-3 pt-6 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Includes
            </p>
            <ul className="space-y-2.5 text-sm">
              {features.map((feature, idx) => {
                const included = feature.included ?? true;
                return (
                  <li
                    key={idx}
                    className={cn(
                      'flex items-start gap-2.5',
                      !included && 'text-muted-foreground/60'
                    )}
                  >
                    {included ? (
                      <Check className="h-4 w-4 shrink-0 text-success mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-0.5" />
                    )}
                    <span className="flex-1 leading-tight">
                      {feature.text}
                      {feature.note && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({feature.note})
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {children}
        </div>
      </div>
    );
  }
);
PricingCard.displayName = 'PricingCard';

export const PricingGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { columns?: 2 | 3 | 4 }
>(({ className, columns = 3, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid gap-6 lg:gap-8 items-stretch',
      columns === 2 && 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
PricingGrid.displayName = 'PricingGrid';
