import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-5xl',
      xl: 'max-w-7xl',
      '2xl': 'max-w-[1440px]',
      full: 'max-w-full',
      prose: 'max-w-prose',
    },
    padding: {
      none: 'px-0 sm:px-0 lg:px-0',
      compact: 'px-3 sm:px-4 lg:px-6',
      normal: 'px-4 sm:px-6 lg:px-8',
      loose: 'px-6 sm:px-8 lg:px-12',
    },
  },
  defaultVariants: {
    size: 'xl',
    padding: 'normal',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, padding, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Container.displayName = 'Container';
