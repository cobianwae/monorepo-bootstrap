'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputOtpVariants = cva(
  'h-12 rounded-lg border border-input bg-background text-center text-lg font-bold font-mono shadow-xs focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-12 w-9 sm:w-11',
        sm: 'h-10 w-8 sm:w-9',
        lg: 'h-14 w-11 sm:w-13',
      },
      error: {
        true: 'border-destructive focus:border-destructive focus:ring-destructive',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface InputOTPProps
  extends VariantProps<typeof inputOtpVariants> {
  value?: string;
  onChange?: (value: string) => void;
  length?: number;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  inputClassName?: string;
  inputMode?: 'numeric' | 'text';
  autoComplete?: string;
}

function createLocalValue(value: string, length: number): string {
  const clean = value.replace(/\D/g, '');
  return (clean + ' '.repeat(length)).slice(0, length);
}

function cleanValue(value: string): string {
  return value.replace(/ +$/, '').replace(/\D/g, '');
}

export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      value = '',
      onChange,
      length = 6,
      label = 'Verification code',
      disabled,
      error,
      size,
      className,
      inputClassName,
      inputMode = 'numeric',
      autoComplete = 'one-time-code',
    },
    ref
  ) => {
    const digits = React.useMemo(
      () => createLocalValue(value, length).split(''),
      [value, length]
    );
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const focusInput = (index: number) => {
      inputRefs.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
    };

    const handleChange = (index: number, raw: string) => {
      const cleaned = raw.replace(/\D/g, '');
      if (cleaned.length === 0) {
        onChange?.(cleanValue(writeAt(index, '')));
        return;
      }
      // Fill all remaining chars when pasting/typing multiple at once
      const next = [...createLocalValue(value, length)];
      for (let i = 0; i < cleaned.length; i++) {
        const pos = index + i;
        if (pos >= length) break;
        next[pos] = cleaned[i];
      }
      onChange?.(cleanValue(next.join('')));
      const nextFocus = index + cleaned.length;
      if (nextFocus < length) focusInput(nextFocus);
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === 'Backspace') {
        const current = digits[index]?.trim();
        if (!current && index > 0) {
          e.preventDefault();
          onChange?.(cleanValue(writeAt(index - 1, '')));
          focusInput(index - 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusInput(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
      if (!pasted) return;
      const next = [...createLocalValue(value, length)];
      for (let i = 0; i < pasted.length && i < length; i++) {
        next[i] = pasted[i];
      }
      onChange?.(cleanValue(next.join('')));
      focusInput(Math.min(pasted.length, length - 1));
    };

    function writeAt(index: number, char: string): string {
      const next = [...createLocalValue(value, length)];
      next[index] = char;
      return next.join('');
    }

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={cn('flex gap-2', className)}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode={inputMode}
            autoComplete={autoComplete}
            maxLength={length}
            disabled={disabled}
            aria-label={`${label} digit ${index + 1} of ${length}`}
            value={digit.trim()}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(inputOtpVariants({ size, error }), inputClassName)}
          />
        ))}
      </div>
    );
  }
);
InputOTP.displayName = 'InputOTP';

export { inputOtpVariants };