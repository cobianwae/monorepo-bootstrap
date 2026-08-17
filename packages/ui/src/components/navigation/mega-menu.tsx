'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../base/badge';
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from './navigation-menu';

export const megaMenuGridVariants = cva('grid gap-4 p-6', {
  variants: {
    columns: {
      2: 'w-[500px] sm:w-[600px] grid-cols-2',
      3: 'w-[650px] sm:w-[750px] lg:w-[850px] grid-cols-3',
      4: 'w-[750px] sm:w-[850px] lg:w-[980px] grid-cols-4',
      split: 'w-[600px] sm:w-[750px] lg:w-[850px] grid-cols-12',
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

export interface MegaMenuGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof megaMenuGridVariants> {}

export const MegaMenuGrid = React.forwardRef<HTMLDivElement, MegaMenuGridProps>(
  ({ className, columns, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(megaMenuGridVariants({ columns, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MegaMenuGrid.displayName = 'MegaMenuGrid';

export const MegaMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3', className)} {...props}>
    {children}
  </div>
));
MegaMenuGroup.displayName = 'MegaMenuGroup';

export const MegaMenuGroupLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono px-3',
      className
    )}
    {...props}
  >
    {children}
  </p>
));
MegaMenuGroupLabel.displayName = 'MegaMenuGroupLabel';

export interface MegaMenuItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ElementType;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'highlight' | 'secondary' | 'outline' | 'success';
}

export const MegaMenuItem = React.forwardRef<HTMLAnchorElement, MegaMenuItemProps>(
  (
    {
      className,
      icon: Icon,
      title,
      description,
      badge,
      badgeVariant = 'highlight',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        className={cn(
          'group flex items-start gap-3 rounded-lg p-3 text-sm transition-all hover:bg-accent/60 hover:text-accent-foreground focus:bg-accent/60 focus:outline-none cursor-pointer',
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors group-hover:border-highlight/50 group-hover:text-highlight shadow-xs">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground leading-none group-hover:text-highlight transition-colors">
              {title}
            </span>
            {badge && (
              <Badge variant={badgeVariant} className="px-1.5 py-0 text-[10px] font-mono">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-highlight" />
      </a>
    );
  }
);
MegaMenuItem.displayName = 'MegaMenuItem';

export interface MegaMenuFeaturedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  description: string;
  href?: string;
  ctaText?: string;
  gradient?: boolean;
}

export const MegaMenuFeaturedCard = React.forwardRef<
  HTMLDivElement,
  MegaMenuFeaturedCardProps
>(
  (
    {
      className,
      badge = 'Featured',
      title,
      description,
      href,
      ctaText = 'Explore now',
      gradient = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border p-5 text-card-foreground shadow-xs',
          gradient
            ? 'bg-gradient-to-br from-highlight/15 via-primary/5 to-transparent border-highlight/30'
            : 'bg-card',
          className
        )}
        {...props}
      >
        <div className="space-y-3">
          {badge && (
            <Badge variant="highlight" className="font-mono text-[11px] font-bold">
              {badge}
            </Badge>
          )}
          <h4 className="text-base font-bold text-foreground font-display leading-snug">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
          {children}
        </div>

        {href && (
          <a
            href={href}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-highlight hover:underline pt-2 border-t border-border/50"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    );
  }
);
MegaMenuFeaturedCard.displayName = 'MegaMenuFeaturedCard';

export const MegaMenuContent = NavigationMenuContent;

export interface MegaMenuProps {
  label: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  columns?: VariantProps<typeof megaMenuGridVariants>['columns'];
  gridClassName?: string;
  children: React.ReactNode;
}

export const MegaMenu = React.forwardRef<
  HTMLDivElement,
  MegaMenuProps
>(({ label, triggerClassName, contentClassName, columns = 3, gridClassName, children }, ref) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={triggerClassName}>{label}</NavigationMenuTrigger>
      <NavigationMenuContent className={cn('p-0 border-0 bg-transparent shadow-none', contentClassName)}>
        <MegaMenuGrid ref={ref} columns={columns} className={gridClassName}>
          {children}
        </MegaMenuGrid>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
});
MegaMenu.displayName = 'MegaMenu';
