import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { GridPattern } from './grid-pattern';
import { GlowOrb } from './glow-orb';

export const heroBandVariants = cva(
  'relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-card shadow-sm',
  {
    variants: {
      accent: {
        highlight: '',
        primary: '',
      },
    },
    defaultVariants: {
      accent: 'highlight',
    },
  }
);

export interface HeroBandProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof heroBandVariants> {
  eyebrow?: React.ReactNode;
  eyebrowIcon?: React.ElementType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
  showGrid?: boolean;
}

export const HeroBand = React.forwardRef<HTMLDivElement, HeroBandProps>(
  (
    {
      className,
      accent,
      eyebrow,
      eyebrowIcon: EyebrowIcon,
      title,
      description,
      actions,
      maxWidth = 'max-w-3xl',
      showGrid = true,
      children,
      ...props
    },
    ref
  ) => {
    const eyebrowActive = accent === 'primary' ? 'primary' : 'highlight';
    return (
      <div
        ref={ref}
        className={cn(heroBandVariants({ accent, className }))}
        {...props}
      >
        {showGrid && (
          <GridPattern
            width={44}
            height={44}
            fade="radial"
            className="opacity-40 dark:opacity-30"
          />
        )}
        <GlowOrb
          color={eyebrowActive}
          size="xl"
          position="top-right"
        />
        <GlowOrb color="primary" size="lg" position="bottom-left" />

        <div className={cn('relative z-10 space-y-5 p-8 sm:p-12', maxWidth)}>
          {eyebrow && (
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold font-mono',
                eyebrowActive === 'primary'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-highlight/30 bg-highlight/10 text-foreground'
              )}
            >
              {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 shrink-0" />}
              {typeof eyebrow === 'string' ? <span>{eyebrow}</span> : eyebrow}
            </div>
          )}

          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-display leading-[1.1]">
              {title}
            </h1>
          )}

          {description && (
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}

          {actions && (
            <div className="flex flex-wrap items-center gap-3 pt-3">{actions}</div>
          )}

          {children}
        </div>
      </div>
    );
  }
);
HeroBand.displayName = 'HeroBand';
