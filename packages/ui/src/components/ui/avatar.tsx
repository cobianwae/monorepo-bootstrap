'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full border border-border/50',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export const avatarStatusVariants = cva(
  'absolute bottom-0 right-0 rounded-full border-2 border-background ring-1 ring-background',
  {
    variants: {
      status: {
        online: 'bg-success',
        away: 'bg-warning',
        busy: 'bg-destructive',
        offline: 'bg-muted-foreground',
      },
      size: {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        default: 'h-2.5 w-2.5',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4 w-4',
      },
    },
    defaultVariants: {
      status: 'online',
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = 'default', status, children, ...props }, ref) => (
  <div className="relative inline-block shrink-0">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
    {status && (
      <span
        aria-label={`Status: ${status}`}
        className={cn(avatarStatusVariants({ status, size }))}
      />
    )}
  </div>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  spacing?: 'tight' | 'default' | 'loose';
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, size = 'default', children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleCount = max ? Math.min(childArray.length, max) : childArray.length;
    const excess = max && childArray.length > max ? childArray.length - max : 0;

    const spacingClasses = {
      tight: '-space-x-3',
      default: '-space-x-2',
      loose: '-space-x-1',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingClasses.default, className)}
        {...props}
      >
        {childArray.slice(0, visibleCount).map((child, i) => (
          <div key={i} className="ring-2 ring-background rounded-full">
            {child}
          </div>
        ))}
        {excess > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background'
            )}
          >
            +{excess}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';
