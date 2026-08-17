'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const numberInputVariants = cva(
  'flex w-full items-center rounded-md border border-input bg-background shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-9',
        sm: 'h-8',
        lg: 'h-10',
      },
      error: {
        true: 'border-destructive focus-within:ring-destructive',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface NumberInputProps
  extends VariantProps<typeof numberInputVariants>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange' | 'defaultValue'> {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  showControls?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  clampOnBlur?: boolean;
  label?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onValueChange,
      min,
      max,
      step = 1,
      error,
      size,
      showControls = true,
      prefix,
      suffix,
      className,
      clampOnBlur = true,
      disabled,
      placeholder,
      'aria-label': ariaLabel,
      label,
      ...props
    },
    ref
  ) => {
    const [text, setText] = React.useState<string>(() =>
      value === undefined ? '' : String(value)
    );

    const syncFromValue = (next: number) => {
      setText(next === undefined ? '' : String(next));
    };

    React.useEffect(() => {
      if (value !== undefined && value !== parseFloat(text)) {
        setText(String(value));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const clamp = (n: number) => {
      let result = n;
      if (min !== undefined) result = Math.max(min, result);
      if (max !== undefined) result = Math.min(max, result);
      return result;
    };

    const commit = (raw: string) => {
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        const clamped = clamp(parsed);
        syncFromValue(clamped);
        onValueChange?.(clamped);
      } else if (raw === '') {
        setText('');
        if (min !== undefined) onValueChange?.(min);
      }
    };

    const stepValue = (dir: 1 | -1) => {
      const current = value ?? min ?? 0;
      const next = clamp(current + dir * step);
      syncFromValue(next);
      onValueChange?.(next);
    };

    const handleBlur = () => {
      if (clampOnBlur && text !== '') commit(text);
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
        )}
        <div
          className={cn(numberInputVariants({ size, error }))}
        >
        {prefix && (
          <span className="pl-3 text-sm text-muted-foreground">{prefix}</span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel ?? 'Number input'}
          aria-invalid={!!error}
          onChange={(e) => {
            setText(e.target.value);
            const parsed = parseFloat(e.target.value);
            if (!Number.isNaN(parsed)) onValueChange?.(parsed);
          }}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              stepValue(1);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              stepValue(-1);
            } else if (e.key === 'Enter') {
              commit(text);
            }
          }}
          className="h-full w-full bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {suffix && (
          <span className="pr-3 text-sm text-muted-foreground">{suffix}</span>
        )}
        {showControls && (
          <div className="flex shrink-0 flex-col border-l border-border">
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled || (max !== undefined && (value ?? min ?? 0) >= max)}
              onClick={() => stepValue(1)}
              className="flex h-1/2 w-7 items-center justify-center border-b border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              aria-label="Increment"
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled || (min !== undefined && (value ?? max ?? 0) <= min)}
              onClick={() => stepValue(-1)}
              className="flex h-1/2 w-7 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              aria-label="Decrement"
            >
              <Minus className="h-3 w-3" />
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { numberInputVariants };