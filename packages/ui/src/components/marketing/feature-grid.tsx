import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../base/badge';

export const featureGridVariants = cva('grid gap-6 sm:gap-8', {
  variants: {
    columns: {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

export interface FeatureGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureGridVariants> {}

export const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ className, columns, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(featureGridVariants({ columns, className }))}
      {...props}
    >
      {children}
    </div>
  )
);
FeatureGrid.displayName = 'FeatureGrid';

export const featureCardVariants = cva(
  'group relative flex flex-col justify-between rounded-xl border border-border p-6 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-xs hover:border-border/80 hover:shadow-md',
        highlight: 'bg-card text-card-foreground border-highlight/30 hover:border-highlight shadow-sm',
        subtle: 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border/50',
        gradient:
          'bg-gradient-to-br from-card via-card to-highlight/5 border-border hover:border-highlight/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureCardVariants> {
  icon?: React.ElementType;
  badge?: string;
  badgeVariant?: 'default' | 'highlight' | 'secondary' | 'outline' | 'success';
  title: string;
  description: string;
  href?: string;
  linkText?: string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      className,
      variant,
      icon: Icon,
      badge,
      badgeVariant = 'highlight',
      title,
      description,
      href,
      linkText = 'Learn more',
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(featureCardVariants({ variant, className }))}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground group-hover:text-highlight group-hover:border-highlight/40 shadow-xs transition-colors">
              <Icon className="h-5 w-5" />
            </div>
          )}
          {badge && (
            <Badge variant={badgeVariant} className="font-mono text-xs">
              {badge}
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-bold text-foreground font-display leading-snug">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {children}
      </div>

      {href && (
        <a
          href={href}
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-highlight hover:underline pt-2"
        >
          <span>{linkText}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      )}
    </div>
  )
);
FeatureCard.displayName = 'FeatureCard';
