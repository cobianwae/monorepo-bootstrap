'use client';

import * as React from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const timePickerVariants = cva(
  'flex h-9 w-full items-center rounded-md border border-input bg-background shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
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

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

function toTimeValue(value: string | TimeValue | null | undefined): TimeValue | null {
  if (!value) return null;
  if (typeof value === 'object') return value;
  const parts = value.split(':').map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return null;
  return {
    hours: parts[0] % 24,
    minutes: parts[1] % 60,
    seconds: parts[2] !== undefined ? parts[2] % 60 : undefined,
  };
}

export interface TimePickerProps
  extends VariantProps<typeof timePickerVariants> {
  value?: string | TimeValue | null;
  onValueChange?: (value: string) => void;
  format?: '24h' | '12h';
  withSeconds?: boolean;
  minTime?: string;
  maxTime?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  className?: string;
  placeholder?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value,
      onValueChange,
      format = '24h',
      withSeconds = false,
      minTime,
      maxTime,
      disabled,
      error,
      size,
      label,
      className,
      placeholder = 'HH:MM',
    },
    ref
  ) => {
    const time = React.useMemo(() => toTimeValue(value), [value]);

    const emit = (next: TimeValue | null) => {
      if (!next) {
        onValueChange?.('');
        return;
      }
      const parts = [pad(next.hours), pad(next.minutes)];
      if (withSeconds && next.seconds !== undefined) parts.push(pad(next.seconds));
      onValueChange?.(parts.join(':'));
    };

    const clamp = (n: number, min: number, max: number) =>
      Math.min(Math.max(n, min), max);

    const inBounds = (t: TimeValue): boolean => {
      const total = t.hours * 3600 + (t.minutes ?? 0) * 60 + (t.seconds ?? 0);
      const minTotal = minTime
        ? toTimeValue(minTime)!.hours * 3600 + toTimeValue(minTime)!.minutes * 60
        : 0;
      const maxTotal = maxTime
        ? toTimeValue(maxTime)!.hours * 3600 + toTimeValue(maxTime)!.minutes * 60
        : 24 * 3600 - 1;
      return total >= minTotal && total <= maxTotal;
    };

    const nudge = (
      field: 'hours' | 'minutes' | 'seconds',
      dir: 1 | -1,
      current: TimeValue | null
    ) => {
      const base: Required<TimeValue> = current
        ? { hours: current.hours, minutes: current.minutes, seconds: current.seconds ?? 0 }
        : { hours: 12, minutes: 0, seconds: 0 };
      const ranges = { hours: [0, 23], minutes: [0, 59], seconds: [0, 59] } as const;
      const [minR, maxR] = ranges[field];
      const next: TimeValue = {
        ...base,
        [field]: clamp(base[field] + dir, minR, maxR),
      };
      if (inBounds(next)) emit(next);
    };

    return (
      <div className={cn('w-full', className)} ref={ref}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
        )}
        <div className={cn(timePickerVariants({ size, error }))}>
          <Clock className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 items-center">
            <TimeSegment
              value={time ? pad(time.hours) : '--'}
              ariaLabel="Hours"
              disabled={disabled}
              onUp={() => nudge('hours', 1, time)}
              onDown={() => nudge('hours', -1, time)}
            />
            <span className="text-muted-foreground">:</span>
            <TimeSegment
              value={time ? pad(time.minutes) : '--'}
              ariaLabel="Minutes"
              disabled={disabled}
              onUp={() => nudge('minutes', 1, time)}
              onDown={() => nudge('minutes', -1, time)}
            />
            {withSeconds && (
              <>
                <span className="text-muted-foreground">:</span>
                <TimeSegment
                  value={time ? pad(time.seconds ?? 0) : '--'}
                  ariaLabel="Seconds"
                  disabled={disabled}
                  onUp={() => nudge('seconds', 1, time)}
                  onDown={() => nudge('seconds', -1, time)}
                />
              </>
            )}
            {format === '12h' && (
              <>
                <span className="mx-1 text-muted-foreground">:</span>
                <span className="text-sm font-medium text-foreground">
                  {time ? (time.hours >= 12 ? 'PM' : 'AM') : '--'}
                </span>
              </>
            )}
          </div>
          {!time && <span className="pr-2 text-sm text-muted-foreground">{placeholder}</span>}
        </div>
      </div>
    );
  }
);
TimePicker.displayName = 'TimePicker';

interface TimeSegmentProps {
  value: string;
  ariaLabel: string;
  disabled?: boolean;
  onUp: () => void;
  onDown: () => void;
}

function TimeSegment({ value, ariaLabel, disabled, onUp, onDown }: TimeSegmentProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={onUp}
        className="px-0.5 py-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm disabled:opacity-40"
        aria-label={`${ariaLabel} up`}
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <span
        className="text-sm font-medium tabular-nums text-foreground"
        aria-label={ariaLabel}
      >
        {value}
      </span>
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={onDown}
        className="px-0.5 py-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm disabled:opacity-40"
        aria-label={`${ariaLabel} down`}
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export { timePickerVariants };
export { toTimeValue as parseTimeValue };