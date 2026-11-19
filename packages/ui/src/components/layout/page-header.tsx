import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { GridPattern } from '../marketing/grid-pattern';
import { GlowOrb } from '../marketing/glow-orb';

export const pageHeaderVariants = cva('flex flex-col gap-4 pb-6', {
  variants: {
    variant: {
      default: 'border-b border-border/60 sm:flex-row sm:items-start sm:justify-between',
      compact: 'border-b border-border/60 sm:flex-row sm:items-center sm:justify-between pb-4',
      centered: 'items-center text-center mx-auto max-w-3xl border-b-0 pb-8',
      card: 'bg-card border border-border p-6 rounded-xl',
      feature:
        'relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-card p-8 sm:p-12 shadow-sm sm:flex-row sm:items-start sm:justify-between',
    },
    size: {
      default: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof pageHeaderVariants> {
  eyebrow?: React.ReactNode;
  eyebrowIcon?: React.ElementType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

const pageHeaderTitleClasses = {
  default: 'text-3xl sm:text-4xl',
  lg: 'text-4xl sm:text-5xl',
  feature: 'text-3xl sm:text-5xl',
} as const;

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      variant,
      size,
      eyebrow,
      eyebrowIcon: EyebrowIcon,
      title,
      description,
      actions,
      breadcrumbs,
      children,
      ...props
    },
    ref
  ) => {
    const isFeature = variant === 'feature';
    return (
      <div
        ref={ref}
        className={cn(pageHeaderVariants({ variant, size, className }))}
        {...props}
      >
        {isFeature && (
          <>
            <GridPattern
              width={44}
              height={44}
              fade="radial"
              className="opacity-40 dark:opacity-30"
            />
            <GlowOrb color="highlight" size="lg" position="top-right" />
            <GlowOrb color="primary" size="md" position="bottom-left" />
          </>
        )}

        <div
          className={cn('space-y-2', isFeature ? 'relative z-10' : '', variant !== 'centered' && 'max-w-3xl')}
        >
          {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}

          {eyebrow && (
            <div
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-0.5 text-xs font-semibold text-highlight font-mono tracking-wide',
                variant === 'centered' && 'mx-auto'
              )}
            >
              {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 shrink-0" />}
              {typeof eyebrow === 'string' ? <span>{eyebrow}</span> : eyebrow}
            </div>
          )}

          {title && (
            <h1
              className={cn(
                'font-bold tracking-tight text-foreground font-display',
                pageHeaderTitleClasses[isFeature ? 'feature' : size ?? 'default']
              )}
            >
              {title}
            </h1>
          )}

          {description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}

          {children}
        </div>

        {actions && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-2.5 pt-1 shrink-0',
              isFeature && 'relative z-10',
              variant === 'centered' ? 'justify-center' : 'sm:self-start'
            )}
          >
            {actions}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export const PageHeaderHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-display',
      className
    )}
    {...props}
  />
));
PageHeaderHeading.displayName = 'PageHeaderHeading';

export const PageHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm sm:text-base text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
PageHeaderDescription.displayName = 'PageHeaderDescription';

export const PageHeaderActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-wrap items-center gap-2.5 shrink-0', className)}
    {...props}
  />
));
PageHeaderActions.displayName = 'PageHeaderActions';
