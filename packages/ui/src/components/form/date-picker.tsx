'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, isValid, type Locale } from 'date-fns';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';
import { Button } from '../base/button';
import { Separator } from '../base/separator';

export type DatePreset = {
  label: string;
  from: Date;
  to?: Date;
};

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        button_previous: cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring absolute left-1'
        ),
        button_next: cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring absolute right-1'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: cn(
          'text-center text-sm p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent'
        ),
        day_button: cn(
          'h-9 w-9 p-0 font-normal text-sm aria-selected:opacity-100 rounded-md inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        ),
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export interface DatePickerProps {
  value?: Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: Date[];
  fromYear?: number;
  toYear?: number;
  fromDate?: Date;
  toDate?: Date;
  locale?: Locale;
  formatDate?: (date: Date) => string;
  className?: string;
  triggerClassName?: string;
  clearable?: boolean;
  presets?: DatePreset[];
  label?: string;
  error?: boolean;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  disabled,
  disabledDays,
  fromDate,
  toDate,
  locale,
  formatDate,
  className,
  triggerClassName,
  clearable = true,
  presets,
  label,
  error,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value && isValid(value) ? value : undefined;

  const display = formatDate
    ? selected
      ? formatDate(selected)
      : ''
    : selected
      ? format(selected, 'PPP', { locale })
      : '';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start gap-2 px-3 font-normal',
              !selected && 'text-muted-foreground',
              error && 'border-destructive focus-visible:ring-destructive',
              triggerClassName
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">{selected ? display : placeholder}</span>
            {clearable && selected && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange?.(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onValueChange?.(null);
                  }
                }}
                className="rounded-sm p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {presets && presets.length > 0 && (
            <div className="flex gap-1 border-b border-border p-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    onValueChange?.(preset.from);
                    setOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onValueChange?.(date ?? null);
              setOpen(false);
            }}
            disabled={[
              ...(disabledDays ?? []),
              ...(fromDate ? [{ before: fromDate }] : []),
              ...(toDate ? [{ after: toDate }] : []),
            ]}
            locale={locale}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
DatePicker.displayName = 'DatePicker';

export interface DateRangePickerProps {
  value?: { from?: Date; to?: Date } | null;
  onValueChange?: (range: { from?: Date; to?: Date } | null) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: Date[];
  locale?: Locale;
  formatDate?: (date: Date) => string;
  className?: string;
  triggerClassName?: string;
  clearable?: boolean;
  presets?: DatePreset[];
  label?: string;
  error?: boolean;
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date range',
  disabled,
  disabledDays,
  locale,
  formatDate,
  className,
  triggerClassName,
  clearable = true,
  presets,
  label,
  error,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const range = value && value.from ? value : null;

  const displayRange = (() => {
    if (!range) return null;
    const fmt = (d: Date) =>
      formatDate ? formatDate(d) : format(d, 'PP', { locale });
    if (range.from && range.to) {
      return `${fmt(range.from)} – ${fmt(range.to)}`;
    }
    return range.from ? fmt(range.from) : null;
  })();

  const hasSelection = Boolean(displayRange);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start gap-2 px-3 font-normal',
              !hasSelection && 'text-muted-foreground',
              error && 'border-destructive focus-visible:ring-destructive',
              triggerClassName
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">
              {hasSelection ? displayRange : placeholder}
            </span>
            {clearable && hasSelection && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange?.(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onValueChange?.(null);
                  }
                }}
                className="rounded-sm p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Clear date range"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1 border-b border-border p-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    onValueChange?.({ from: preset.from, to: preset.to ?? preset.from });
                    setOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar
            mode="range"
            selected={
              range?.from
                ? ({ from: range.from, to: range.to } as DateRange)
                : undefined
            }
            onSelect={(r) => {
              if (!r) {
                onValueChange?.(null);
                return;
              }
              if (r.from && r.to) setOpen(false);
              onValueChange?.(r);
            }}
            disabled={disabledDays}
            locale={locale}
            numberOfMonths={2}
            autoFocus
          />
          <div className="flex items-center gap-2 border-t border-border p-3">
            <div className="flex-1 text-sm">
              {range?.from ? format(range.from, 'PP', { locale }) : '—'}
            </div>
            <Separator className="h-4" orientation="vertical" />
            <div className="flex-1 text-sm">
              {range?.to ? format(range.to, 'PP', { locale }) : '—'}
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!range?.from || !range?.to}
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
DateRangePicker.displayName = 'DateRangePicker';

export function isDateRangeComplete(range: DateRange | null | undefined): range is DateRange {
  return Boolean(range && range.from && range.to);
}