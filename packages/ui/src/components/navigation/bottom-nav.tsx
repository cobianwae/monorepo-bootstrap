'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Badge } from '../base/badge';

export const bottomNavVariants = cva(
  'fixed bottom-0 left-0 right-0 z-sticky md:hidden flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-lg px-2 py-1 shadow-lg pb-[max(0.25rem,env(safe-area-inset-bottom))] transition-all',
  {
    variants: {
      variant: {
        default: 'bg-background/95 border-border',
        card: 'bg-card border-border shadow-xl',
        floating:
          'm-3 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BottomNavProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof bottomNavVariants> {
  as?: React.ElementType;
}

export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ className, variant, as: Component = 'nav', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(bottomNavVariants({ variant, className }))}
        aria-label="Mobile Navigation"
        {...props}
      >
        {children}
      </Component>
    );
  }
);
BottomNav.displayName = 'BottomNav';

export interface BottomNavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string | number;
}

export const BottomNavItem = React.forwardRef<HTMLAnchorElement, BottomNavItemProps>(
  ({ className, icon: Icon, label, active, badge, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'relative flex flex-1 flex-col items-center justify-center gap-1 py-1 px-2 text-[11px] font-medium transition-colors cursor-pointer',
          active
            ? 'text-highlight font-semibold'
            : 'text-muted-foreground hover:text-foreground',
          className
        )}
        aria-current={active ? 'page' : undefined}
        {...props}
      >
        <div className="relative">
          <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
          {badge !== undefined && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 py-0 text-[10px] flex items-center justify-center font-mono font-bold"
            >
              {badge}
            </Badge>
          )}
        </div>
        <span className="truncate max-w-[64px]">{label}</span>
      </a>
    );
  }
);
BottomNavItem.displayName = 'BottomNavItem';
