import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, startAdornment, endAdornment, ...props }, ref) => {
    if (startAdornment || endAdornment) {
      return (
        <div
          className={cn(
            'flex h-9 w-full items-center rounded-md border border-input bg-background px-3 shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
            error && 'border-destructive focus-within:ring-destructive',
            className
          )}
        >
          {startAdornment && (
            <span className="mr-2 flex items-center text-muted-foreground [&_svg]:size-4">
              {startAdornment}
            </span>
          )}
          <input
            type={type}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <span className="ml-2 flex items-center text-muted-foreground [&_svg]:size-4">
              {endAdornment}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
