import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const appShellVariants = cva('relative flex w-full bg-background text-foreground', {
  variants: {
    layout: {
      default: 'min-h-screen flex-col',
      fixed: 'h-dvh overflow-hidden flex-col',
      sidebar: 'min-h-screen flex-row',
      'sidebar-fixed': 'h-dvh overflow-hidden flex-row',
    },
  },
  defaultVariants: {
    layout: 'default',
  },
});

export interface AppShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appShellVariants> {}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, layout, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(appShellVariants({ layout, className }))} {...props}>
        {children}
      </div>
    );
  }
);
AppShell.displayName = 'AppShell';

export const appShellHeaderVariants = cva(
  'z-sticky flex items-center border-b border-border bg-background/80 backdrop-blur-md transition-all',
  {
    variants: {
      sticky: {
        true: 'sticky top-0',
        false: 'relative',
      },
      height: {
        sm: 'h-12 px-4',
        default: 'h-14 sm:h-16 px-4 sm:px-6',
        lg: 'h-16 sm:h-20 px-6 sm:px-8',
      },
    },
    defaultVariants: {
      sticky: true,
      height: 'default',
    },
  }
);

export interface AppShellHeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof appShellHeaderVariants> {
  as?: React.ElementType;
}

export const AppShellHeader = React.forwardRef<HTMLElement, AppShellHeaderProps>(
  ({ className, sticky, height, as: Component = 'header', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(appShellHeaderVariants({ sticky, height, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
AppShellHeader.displayName = 'AppShellHeader';

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  fixed?: boolean;
}

export const AppShellMain = React.forwardRef<HTMLElement, AppShellMainProps>(
  ({ className, fixed = false, as: Component = 'main', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        id="main-content"
        className={cn(
          'flex-1 focus:outline-none',
          fixed ? 'overflow-y-auto min-h-0' : 'w-full',
          className
        )}
        tabIndex={-1}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
AppShellMain.displayName = 'AppShellMain';

export const appShellInsetVariants = cva('flex-1 w-full', {
  variants: {
    padding: {
      none: 'p-0',
      compact: 'p-3 sm:p-4',
      default: 'p-4 sm:p-6 lg:p-8',
      loose: 'p-6 sm:p-8 lg:p-12',
    },
    maxWidth: {
      sm: 'max-w-screen-sm mx-auto',
      md: 'max-w-screen-md mx-auto',
      lg: 'max-w-5xl mx-auto',
      xl: 'max-w-7xl mx-auto',
      '2xl': 'max-w-[1440px] mx-auto',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    padding: 'default',
    maxWidth: 'full',
  },
});

export interface AppShellInsetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appShellInsetVariants> {}

export const AppShellInset = React.forwardRef<HTMLDivElement, AppShellInsetProps>(
  ({ className, padding, maxWidth, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(appShellInsetVariants({ padding, maxWidth, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AppShellInset.displayName = 'AppShellInset';

export interface AppShellFooterProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export const AppShellFooter = React.forwardRef<HTMLElement, AppShellFooterProps>(
  ({ className, as: Component = 'footer', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('border-t border-border bg-background py-4 px-4 sm:px-6', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
AppShellFooter.displayName = 'AppShellFooter';
