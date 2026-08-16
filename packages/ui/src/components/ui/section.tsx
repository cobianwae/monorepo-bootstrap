import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const sectionVariants = cva('relative w-full overflow-hidden', {
  variants: {
    spacing: {
      none: 'py-0',
      xs: 'py-6 sm:py-8',
      sm: 'py-10 sm:py-12',
      default: 'py-16 sm:py-24',
      lg: 'py-20 sm:py-32',
      xl: 'py-24 sm:py-40',
    },
    surface: {
      default: 'bg-background text-foreground',
      muted: 'bg-muted/40 text-foreground border-y border-border/50',
      card: 'bg-card text-card-foreground',
      subtle: 'bg-accent/30 text-foreground',
      dark: 'bg-zinc-950 text-zinc-50 dark:bg-zinc-900',
      primary: 'bg-primary text-primary-foreground',
      highlight: 'bg-highlight/10 text-foreground border-y border-highlight/20',
      transparent: 'bg-transparent text-foreground',
    },
  },
  defaultVariants: {
    spacing: 'default',
    surface: 'default',
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, surface, as: Component = 'section', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(sectionVariants({ spacing, surface, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Section.displayName = 'Section';

export const sectionHeaderVariants = cva('space-y-3', {
  variants: {
    align: {
      left: 'text-left items-start',
      center: 'text-center items-center mx-auto',
      right: 'text-right items-end ml-auto',
    },
    size: {
      sm: 'max-w-xl',
      default: 'max-w-2xl',
      lg: 'max-w-3xl',
      xl: 'max-w-4xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    align: 'left',
    size: 'default',
  },
});

export interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof sectionHeaderVariants> {
  eyebrow?: React.ReactNode;
  eyebrowIcon?: React.ElementType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      className,
      align,
      size,
      eyebrow,
      eyebrowIcon: EyebrowIcon,
      title,
      description,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(sectionHeaderVariants({ align, size, className }))}
        {...props}
      >
        {eyebrow && (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-0.5 text-xs font-semibold text-highlight font-mono tracking-wide',
              align === 'center' && 'mx-auto'
            )}
          >
            {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 shrink-0" />}
            {typeof eyebrow === 'string' ? <span>{eyebrow}</span> : eyebrow}
          </div>
        )}

        {title && (
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-display">
            {title}
          </h2>
        )}

        {description && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {children}

        {actions && (
          <div
            className={cn(
              'pt-2 flex flex-wrap items-center gap-3',
              align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
            )}
          >
            {actions}
          </div>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';
