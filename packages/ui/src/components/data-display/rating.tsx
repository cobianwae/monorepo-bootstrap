'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const ratingVariants = cva('inline-flex items-center gap-1', {
  variants: {
    size: {
      sm: '[&_svg]:size-3.5 gap-0.5 text-xs',
      default: '[&_svg]:size-5 gap-1 text-sm',
      lg: '[&_svg]:size-6 gap-1.5 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof ratingVariants> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  allowHalf?: boolean;
  showValueText?: boolean;
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue = 0,
      onChange,
      max = 5,
      readOnly = false,
      disabled = false,
      allowHalf = false,
      showValueText = false,
      size = 'default',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : activeValue;

    const handleRatingClick = (val: number) => {
      if (readOnly || disabled) return;
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly || disabled) return;
      const step = allowHalf ? 0.5 : 1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.min(max, activeValue + step);
        handleRatingClick(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.max(0, activeValue - step);
        handleRatingClick(next);
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleRatingClick(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        handleRatingClick(max);
      }
    };

    return (
      <div
        ref={ref}
        role="slider"
        aria-label="Rating"
        aria-valuenow={activeValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-readonly={readOnly}
        aria-disabled={disabled}
        tabIndex={readOnly || disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={cn(
          ratingVariants({ size }),
          disabled && 'opacity-50 pointer-events-none',
          !readOnly && !disabled && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: max }, (_, index) => {
            const starValue = index + 1;
            const isFull = displayValue >= starValue;
            const isHalf =
              allowHalf &&
              displayValue >= starValue - 0.5 &&
              displayValue < starValue;

            return (
              <span
                key={index}
                className="relative inline-block transition-transform duration-100 hover:scale-110"
                onMouseEnter={() => !readOnly && !disabled && setHoverValue(starValue)}
                onMouseLeave={() => !readOnly && !disabled && setHoverValue(null)}
                onClick={() => handleRatingClick(starValue)}
              >
                {/* Empty base star */}
                <Star className="text-muted-foreground/30" />

                {/* Filled overlay */}
                {(isFull || isHalf) && (
                  <span
                    className="absolute inset-0 overflow-hidden text-highlight fill-highlight"
                    style={{ width: isFull ? '100%' : '50%' }}
                  >
                    <Star className="text-highlight fill-highlight" />
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {showValueText && (
          <span className="ml-1.5 font-medium text-foreground">
            {activeValue.toFixed(allowHalf ? 1 : 0)}
          </span>
        )}
      </div>
    );
  }
);
Rating.displayName = 'Rating';
