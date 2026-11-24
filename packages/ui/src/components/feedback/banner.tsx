'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const bannerVariants = cva(
  'relative z-banner flex items-center justify-between gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-muted/80 text-foreground border-b border-border',
        highlight:
          'bg-gradient-to-r from-highlight/20 via-primary/15 to-highlight/20 text-foreground border-b border-highlight/30',
        primary: 'bg-primary text-primary-foreground',
        warning: 'bg-warning/20 text-foreground border-b border-warning/30',
        info: 'bg-info/15 text-foreground border-b border-info/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  storageKey?: string;
  icon?: React.ElementType;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      variant,
      storageKey,
      icon: Icon = Sparkles,
      actionText,
      actionHref,
      onActionClick,
      onDismiss,
      dismissible = true,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (storageKey && typeof window !== 'undefined') {
        const dismissed = localStorage.getItem(`banner-dismissed-${storageKey}`);
        if (dismissed === 'true') {
          setIsVisible(false);
        }
      }
    }, [storageKey]);

    const handleDismiss = () => {
      setIsVisible(false);
      if (storageKey && typeof window !== 'undefined') {
        localStorage.setItem(`banner-dismissed-${storageKey}`, 'true');
      }
      onDismiss?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ variant, className }))}
        role="region"
        aria-label="Announcement"
        {...props}
      >
        <div className="mx-auto flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3 text-center">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-highlight" />}
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-3">
            <span className="min-w-0 max-w-full [overflow-wrap:anywhere]">{children}</span>
            {(actionText || actionHref) && (
              <a
                href={actionHref}
                onClick={onActionClick}
                className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-sm font-semibold underline underline-offset-2 hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="min-w-0 [overflow-wrap:anywhere]">{actionText || 'Learn more'}</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Banner.displayName = 'Banner';
