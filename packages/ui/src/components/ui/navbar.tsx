'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';

export const navbarVariants = cva(
  'z-sticky w-full transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-b border-border bg-background/85 backdrop-blur-md',
        floating:
          'max-w-7xl mx-auto my-3 rounded-2xl border border-border/80 bg-background/90 backdrop-blur-lg shadow-md px-4 sm:px-6',
        transparent: 'bg-transparent border-transparent text-foreground',
        glass:
          'border-b border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-xl',
        solid: 'border-b border-border bg-card text-card-foreground',
      },
      sticky: {
        true: 'sticky top-0',
        false: 'relative',
      },
      size: {
        sm: 'h-14',
        default: 'h-16',
        lg: 'h-20',
      },
    },
    defaultVariants: {
      variant: 'default',
      sticky: true,
      size: 'default',
    },
  }
);

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  as?: React.ElementType;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, variant, sticky, size, as: Component = 'header', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(navbarVariants({ variant, sticky, size, className }))}
        {...props}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </Component>
    );
  }
);
Navbar.displayName = 'Navbar';

export const NavbarBrand = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, href = '/', ...props }, ref) => (
  <a
    ref={ref}
    href={href}
    className={cn(
      'flex items-center gap-2.5 font-bold text-foreground font-display text-lg tracking-tight hover:opacity-90 transition-opacity',
      className
    )}
    {...props}
  >
    {children}
  </a>
));
NavbarBrand.displayName = 'NavbarBrand';

export const NavbarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn('hidden md:flex items-center gap-1 lg:gap-2', className)}
    {...props}
  >
    {children}
  </nav>
));
NavbarNav.displayName = 'NavbarNav';

export interface NavbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

export const NavbarLink = React.forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  ({ className, active, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent',
        active
          ? 'bg-accent/70 text-foreground font-semibold text-highlight'
          : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
);
NavbarLink.displayName = 'NavbarLink';

export const NavbarActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2 sm:gap-3', className)}
    {...props}
  >
    {children}
  </div>
));
NavbarActions.displayName = 'NavbarActions';

export interface NavbarMobileProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}

export function NavbarMobile({
  trigger,
  children,
  title = 'Navigation',
}: NavbarMobileProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 overflow-y-auto">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="text-lg font-bold font-display">{title}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4" onClick={() => setOpen(false)}>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
