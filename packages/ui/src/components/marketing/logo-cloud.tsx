import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const logoCloudVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'py-8 sm:py-12',
      bordered: 'py-8 sm:py-12 border-y border-border bg-muted/20',
      card: 'p-8 sm:p-12 rounded-2xl border border-border bg-card shadow-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface LogoCloudProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoCloudVariants> {
  title?: string;
}

export const LogoCloud = React.forwardRef<HTMLDivElement, LogoCloudProps>(
  ({ className, variant, title = 'Trusted by engineering teams worldwide', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(logoCloudVariants({ variant, className }))}
        {...props}
      >
        {title && (
          <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-8">
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {children}
        </div>
      </div>
    );
  }
);
LogoCloud.displayName = 'LogoCloud';

export interface LogoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  logo?: React.ReactNode;
}

export const LogoItem = React.forwardRef<HTMLDivElement, LogoItemProps>(
  ({ className, name, logo, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0',
        className
      )}
      title={name}
      {...props}
    >
      {logo || children || (
        <span className="text-lg font-bold font-mono tracking-tight text-foreground">
          {name}
        </span>
      )}
    </div>
  )
);
LogoItem.displayName = 'LogoItem';
