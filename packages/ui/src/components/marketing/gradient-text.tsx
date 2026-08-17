import * as React from 'react';
import { cn } from '../../lib/utils';

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: React.ElementType;
}

export const GradientText = React.forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, as: Comp = 'span', children, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(
          'bg-gradient-to-br from-primary to-highlight bg-clip-text text-transparent',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
GradientText.displayName = 'GradientText';
