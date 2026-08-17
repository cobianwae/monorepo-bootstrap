import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const skipLinkVariants = cva(
  'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        highlight: 'bg-highlight text-highlight-foreground',
        card: 'bg-card text-foreground border border-border shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkipLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof skipLinkVariants> {
  targetId?: string;
}

export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ className, variant, targetId = 'main-content', children = 'Skip to main content', ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={`#${targetId.replace(/^#/, '')}`}
        className={cn(skipLinkVariants({ variant, className }))}
        {...props}
      >
        {children}
      </a>
    );
  }
);
SkipLink.displayName = 'SkipLink';
