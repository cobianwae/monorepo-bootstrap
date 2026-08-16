import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Container } from './container';

export const footerVariants = cva('w-full border-t border-border transition-colors', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      muted: 'bg-muted/30 text-foreground',
      card: 'bg-card text-card-foreground',
      dark: 'bg-zinc-950 text-zinc-100 border-zinc-800',
    },
    spacing: {
      compact: 'py-8 sm:py-12',
      default: 'py-12 sm:py-16 lg:py-20',
      spacious: 'py-16 sm:py-24',
    },
  },
  defaultVariants: {
    variant: 'default',
    spacing: 'default',
  },
});

export interface FooterProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof footerVariants> {
  as?: React.ElementType;
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, variant, spacing, as: Component = 'footer', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(footerVariants({ variant, spacing, className }))}
        {...props}
      >
        <Container size="xl">{children}</Container>
      </Component>
    );
  }
);
Footer.displayName = 'Footer';

export const footerGridVariants = cva('grid gap-8 sm:gap-10', {
  variants: {
    columns: {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
      'brand-columns': 'grid-cols-1 lg:grid-cols-12',
    },
  },
  defaultVariants: {
    columns: 4,
  },
});

export interface FooterGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof footerGridVariants> {}

export const FooterGrid = React.forwardRef<HTMLDivElement, FooterGridProps>(
  ({ className, columns, children, ...props }, ref) => (
    <div ref={ref} className={cn(footerGridVariants({ columns, className }))} {...props}>
      {children}
    </div>
  )
);
FooterGrid.displayName = 'FooterGrid';

export const FooterColumn = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string }
>(({ className, title, children, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3', className)} {...props}>
    {title && (
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
        {title}
      </p>
    )}
    <ul className="space-y-2 text-sm">{children}</ul>
  </div>
));
FooterColumn.displayName = 'FooterColumn';

export interface FooterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  badge?: string;
}

export const FooterLink = React.forwardRef<HTMLAnchorElement, FooterLinkProps>(
  ({ className, external, badge, children, ...props }, ref) => (
    <li>
      <a
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
          className
        )}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
        {...props}
      >
        <span>{children}</span>
        {external && <ArrowUpRight className="h-3 w-3 opacity-70" />}
        {badge && (
          <span className="rounded-full bg-highlight/15 px-1.5 py-0.2 text-[10px] font-mono font-bold text-highlight">
            {badge}
          </span>
        )}
      </a>
    </li>
  )
);
FooterLink.displayName = 'FooterLink';

export const FooterBottom = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mt-12 sm:mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
FooterBottom.displayName = 'FooterBottom';
