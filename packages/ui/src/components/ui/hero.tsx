import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Container } from './container';

export const heroVariants = cva('relative w-full overflow-hidden', {
  variants: {
    variant: {
      centered: 'py-20 sm:py-28 lg:py-36 text-center',
      split: 'py-16 sm:py-24 lg:py-32 text-left',
      simple: 'py-12 sm:py-20 text-left',
    },
  },
  defaultVariants: {
    variant: 'centered',
  },
});

export interface HeroProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof heroVariants> {
  containerSize?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ className, variant, containerSize = 'xl', children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(heroVariants({ variant, className }))}
        {...props}
      >
        <Container size={containerSize}>{children}</Container>
      </section>
    );
  }
);
Hero.displayName = 'Hero';

export const HeroEyebrow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ElementType }
>(({ className, icon: Icon, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3.5 py-1 text-xs sm:text-sm font-semibold text-highlight font-mono tracking-wide mb-6 shadow-xs',
      className
    )}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4 shrink-0" />}
    {children}
  </div>
));
HeroEyebrow.displayName = 'HeroEyebrow';

export const HeroTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }
>(({ className, gradient = false, children, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl font-display leading-[1.1] mb-6',
      gradient &&
        'bg-gradient-to-r from-foreground via-foreground to-highlight bg-clip-text text-transparent',
      className
    )}
    {...props}
  >
    {children}
  </h1>
));
HeroTitle.displayName = 'HeroTitle';

export const HeroDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-8',
      className
    )}
    {...props}
  >
    {children}
  </p>
));
HeroDescription.displayName = 'HeroDescription';

export const HeroActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-3 sm:gap-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
HeroActions.displayName = 'HeroActions';

export const HeroMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative mt-12 sm:mt-16 rounded-2xl border border-border bg-card/80 p-2 sm:p-4 shadow-xl backdrop-blur-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
HeroMedia.displayName = 'HeroMedia';
