'use client';

import * as React from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  type Locale,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayProps } from 'react-day-picker';
import { cn } from '../../lib/utils';
import { Badge, type badgeVariants } from '../base/badge';
import { Button } from '../base/button';
import { Calendar } from '../form/date-picker';
import { SegmentedControl, SegmentedControlItem } from '../form/segmented-control';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';
import type { VariantProps } from 'class-variance-authority';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';
export type EventCategory = 'primary' | 'success' | 'warning' | 'info' | 'destructive';
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: EventCategory;
  location?: string;
  description?: string;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  currentDate?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  ariaLabel?: string;
  className?: string;
}

const CATEGORY_VARIANTS: Record<EventCategory, BadgeVariant> = {
  primary: 'default',
  success: 'success',
  warning: 'warning',
  info: 'info',
  destructive: 'destructive',
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  primary: 'Primary',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
  destructive: 'Critical',
};

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
};

const MAX_VISIBLE = 3;

function clampEnd(event: CalendarEvent): Date {
  return event.end >= event.start ? event.end : event.start;
}

function eventTimeRange(event: CalendarEvent, locale?: Locale): string {
  if (event.allDay) return 'All day';
  const end = clampEnd(event);
  return `${format(event.start, 'HH:mm', { locale })}–${format(end, 'HH:mm', { locale })}`;
}

const DOT_CLASSES: Record<EventCategory, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

function EventChip({ event, locale }: { event: CalendarEvent; locale?: Locale }) {
  const category = event.category ?? 'primary';
  const detail = `${event.title}, ${eventTimeRange(event, locale)}`;
  return (
    <Badge
      size="sm"
      variant={CATEGORY_VARIANTS[category]}
      data-category={category}
      title={detail}
      className="block w-full max-w-full min-w-0 justify-start gap-1.5 overflow-hidden rounded px-1.5 py-0.5 text-left"
    >
      <span className="shrink-0 font-mono text-[10px] opacity-90">{eventTimeRange(event, locale)}</span>
      <span className="min-w-0 flex-1 truncate">{event.title}</span>
    </Badge>
  );
}

function DayOverflow({ events, day, locale }: { events: CalendarEvent[]; day: Date; locale?: Locale }) {
  const extra = events.length - MAX_VISIBLE;
  if (extra <= 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-5 w-fit shrink-0 px-1 text-[10px] text-muted-foreground"
          aria-label={`${extra} more events on ${format(day, 'EEEE, d MMMM yyyy', { locale })}`}
        >
          +{extra}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-64 overflow-y-auto p-3">
        <p className="mb-2 text-xs font-semibold text-foreground">
          {format(day, 'EEEE, d MMMM yyyy', { locale })}
        </p>
        <ul className="space-y-1.5">
          {events.map((e) => (
            <li key={e.id} className="text-xs">
              <span className={cn('mr-1.5 inline-block h-2 w-2 rounded-full align-middle', DOT_CLASSES[e.category ?? 'primary'])} />
              <span className="font-mono text-[10px] text-muted-foreground">{eventTimeRange(e, locale)}</span>{' '}
              <span className="text-foreground">{e.title}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function buildEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const end = clampEnd(event);
    const lastMoment = end > event.start ? new Date(end.getTime() - 1) : event.start;
    let cursor = startOfDay(event.start);
    const lastDay = startOfDay(lastMoment);
    while (cursor <= lastDay) {
      const key = format(cursor, 'yyyy-MM-dd');
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
      cursor = addDays(cursor, 1);
    }
  }
  for (const [key, list] of map) {
    map.set(key, [...list].sort((a, b) => {
      if (Boolean(b.allDay) !== Boolean(a.allDay)) return b.allDay ? 1 : -1;
      return a.start.getTime() - b.start.getTime();
    }));
  }
  return map;
}

function periodLabel(view: CalendarView, date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6, locale?: Locale): string {
  if (view === 'month' || view === 'agenda') return format(date, 'LLLL yyyy', { locale });
  if (view === 'week') {
    const start = startOfWeek(date, { weekStartsOn });
    const end = endOfWeek(date, { weekStartsOn });
    return `${format(start, 'd MMM', { locale })} – ${format(end, 'd MMM yyyy', { locale })}`;
  }
  return format(date, 'EEEE, d MMM yyyy', { locale });
}

function shiftDate(view: CalendarView, date: Date, direction: 1 | -1): Date {
  if (view === 'month' || view === 'agenda') return direction === 1 ? addMonths(date, 1) : subMonths(date, 1);
  if (view === 'week') return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
  return direction === 1 ? addDays(date, 1) : subDays(date, 1);
}

export function EventCalendar({
  events,
  view,
  defaultView,
  onViewChange,
  currentDate,
  defaultDate,
  onDateChange,
  locale,
  weekStartsOn = 1,
  ariaLabel = 'Event calendar',
  className,
}: EventCalendarProps) {
  const isViewControlled = view !== undefined;
  const [internalView, setInternalView] = React.useState<CalendarView>(defaultView ?? 'month');
  const activeView = view ?? internalView;

  const isDateControlled = currentDate !== undefined;
  const [internalDate, setInternalDate] = React.useState<Date>(defaultDate ?? new Date());
  const activeDate = currentDate ?? internalDate;

  const eventsByDay = React.useMemo(() => buildEventsByDay(events), [events]);

  const changeView = React.useCallback(
    (next: CalendarView) => {
      if (!isViewControlled) setInternalView(next);
      onViewChange?.(next);
    },
    [isViewControlled, onViewChange]
  );

  const changeDate = React.useCallback(
    (next: Date) => {
      if (!isDateControlled) setInternalDate(next);
      onDateChange?.(next);
    },
    [isDateControlled, onDateChange]
  );

  const MonthDayCell = React.useCallback(
    (props: DayProps) => {
      const { day, modifiers, children, className: cellClassName, ...rest } = props;
      const dateKey = format(day.date, 'yyyy-MM-dd');
      const dayEvents = eventsByDay.get(dateKey) ?? [];
      const visible = dayEvents.slice(0, MAX_VISIBLE);
      const isToday = isSameDay(day.date, new Date());
      return (
        <td
          {...rest}
          data-date={dateKey}
          className={cn(
            'min-h-24 min-w-0 flex-1 border-r border-t border-border/50 p-1 align-top last:border-r-0',
            modifiers.outside && 'bg-muted/20',
            isToday && 'bg-accent/40',
            cellClassName
          )}
        >
          <div className="flex min-h-24 flex-col gap-1">
            <div className="flex items-start justify-between gap-1">
              <span className={cn('inline-flex', modifiers.outside && 'opacity-50')}>{children}</span>
              <DayOverflow events={dayEvents} day={day.date} locale={locale} />
            </div>
            <div className="flex flex-col gap-1">
              {visible.map((e) => (
                <EventChip key={e.id} event={e} locale={locale} />
              ))}
            </div>
          </div>
        </td>
      );
    },
    [eventsByDay, locale]
  );

  const monthComponents = React.useMemo(() => ({ Day: MonthDayCell }), [MonthDayCell]);

  const weekStart = startOfWeek(activeDate, { weekStartsOn });
  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  return (
    <section aria-label={ariaLabel} className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous period"
            onClick={() => changeDate(shiftDate(activeView, activeDate, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeDate(new Date())}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next period"
            onClick={() => changeDate(shiftDate(activeView, activeDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 aria-live="polite" className="text-base font-semibold text-foreground">
            {periodLabel(activeView, activeDate, weekStartsOn, locale)}
          </h2>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <ul className="flex flex-wrap items-center gap-2" aria-label="Category legend">
            {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((key) => (
              <li key={key}>
                <Badge size="sm" variant={CATEGORY_VARIANTS[key]}>
                  {CATEGORY_LABELS[key]}
                </Badge>
              </li>
            ))}
          </ul>
          <SegmentedControl
            type="single"
            value={activeView}
            onValueChange={(value) => {
              if (value) changeView(value as CalendarView);
            }}
            aria-label="Calendar view"
          >
            {(Object.keys(VIEW_LABELS) as CalendarView[]).map((v) => (
              <SegmentedControlItem key={v} value={v}>
                {VIEW_LABELS[v]}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
      </div>

      {activeView === 'month' && (
        <Calendar
          mode="single"
          month={activeDate}
          onMonthChange={(m) => changeDate(m)}
          hideNavigation
          fixedWeeks
          showOutsideDays
          weekStartsOn={weekStartsOn}
          locale={locale}
          className="w-full p-0"
          classNames={{
            months: 'w-full',
            month: 'w-full space-y-0',
            month_caption: 'hidden',
            month_grid: 'w-full border-collapse rounded-lg border border-border bg-card',
            weekdays: 'flex w-full border-b border-border bg-muted/30',
            weekday: 'flex-1 py-2 text-center text-[0.8rem] font-medium text-muted-foreground',
            week: 'flex w-full',
            day: 'flex-1 border-r border-t border-border/50 p-0 align-top last:border-r-0',
            day_button: 'h-6 w-6 rounded-md text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            today: 'bg-accent font-semibold ring-1 ring-primary',
            outside: 'text-muted-foreground opacity-50',
          }}
          components={monthComponents}
        />
      )}

      {activeView === 'week' && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <div className="grid min-w-[640px] grid-cols-7">
            {weekDays.map((day) => {
              const dayEvents = eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? [];
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  data-date={format(day, 'yyyy-MM-dd')}
                  className={cn(
                    'min-h-48 border-r border-border/50 p-2 last:border-r-0',
                    isToday && 'bg-accent/40'
                  )}
                >
                  <p className={cn('mb-2 text-xs font-medium text-muted-foreground', isToday && 'font-semibold text-primary')}>
                    {format(day, 'EEE d', { locale })}
                  </p>
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, MAX_VISIBLE).map((e) => (
                      <EventChip key={e.id} event={e} locale={locale} />
                    ))}
                    <DayOverflow events={dayEvents} day={day} locale={locale} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(activeView === 'day' || activeView === 'agenda') && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            {activeView === 'day'
              ? format(activeDate, 'EEEE, d MMMM yyyy', { locale })
              : format(activeDate, 'LLLL yyyy', { locale })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeView === 'day'
              ? 'Time grid layout follows in the next iteration.'
              : 'Agenda list layout follows in the next iteration.'}
          </p>
        </div>
      )}
    </section>
  );
}
