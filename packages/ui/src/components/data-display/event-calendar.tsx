'use client';

import * as React from 'react';
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  differenceInMinutes,
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
import { Badge, badgeVariants } from '../base/badge';
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

export interface CalendarSlot {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface WorkingHours {
  start: string;
  end: string;
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
  workingHours?: WorkingHours;
  slotIntervalMinutes?: number;
  onSelectSlot?: (slot: CalendarSlot) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
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
const MINUTES_PER_DAY = 24 * 60;
const MIN_SLOT_HEIGHT = 24;
const HOUR_COLUMN_WIDTH = '3.5rem';
const DEFAULT_WORKING_HOURS: WorkingHours = { start: '08:00', end: '18:00' };
const DEFAULT_SLOT_INTERVAL = 30;
const MIN_SLOT_INTERVAL = 5;
const MAX_SLOT_INTERVAL = 120;

const DOT_CLASSES: Record<EventCategory, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

const BLOCK_CLASSES: Record<EventCategory, string> = {
  primary: 'border-primary/50 bg-primary/10',
  success: 'border-success/50 bg-success/10',
  warning: 'border-warning/50 bg-warning/10',
  info: 'border-info/50 bg-info/10',
  destructive: 'border-destructive/50 bg-destructive/10',
};

function clampEnd(event: CalendarEvent): Date {
  return event.end >= event.start ? event.end : event.start;
}

function eventTimeRange(event: CalendarEvent, locale?: Locale): string {
  if (isAllDayEvent(event)) return 'All day';
  const end = clampEnd(event);
  return `${format(event.start, 'HH:mm', { locale })}–${format(end, 'HH:mm', { locale })}`;
}

function isAllDayEvent(event: CalendarEvent): boolean {
  if (event.allDay) return true;
  const end = clampEnd(event);
  return differenceInMinutes(end, event.start) >= MINUTES_PER_DAY;
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function resolveWorkingMinutes(workingHours?: WorkingHours): { start: number; end: number } {
  const start = parseTimeToMinutes(workingHours?.start ?? '') ?? parseTimeToMinutes(DEFAULT_WORKING_HOURS.start)!;
  let end = parseTimeToMinutes(workingHours?.end ?? '') ?? parseTimeToMinutes(DEFAULT_WORKING_HOURS.end)!;
  if (end <= start) end = Math.min(MINUTES_PER_DAY, start + 60);
  return { start, end };
}

function resolveSlotInterval(slotIntervalMinutes?: number): number {
  if (slotIntervalMinutes === undefined || !Number.isFinite(slotIntervalMinutes)) {
    return DEFAULT_SLOT_INTERVAL;
  }
  return Math.min(MAX_SLOT_INTERVAL, Math.max(MIN_SLOT_INTERVAL, Math.round(slotIntervalMinutes)));
}

function dayKey(day: Date): string {
  return format(day, 'yyyy-MM-dd');
}

interface DaySegment {
  event: CalendarEvent;
  startMinute: number;
  endMinute: number;
}

function buildAllDayByDay(events: CalendarEvent[], days: Date[]): Map<string, CalendarEvent[]> {
  const visible = new Set(days.map(dayKey));
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    if (!isAllDayEvent(event)) continue;
    const end = clampEnd(event);
    const lastMoment = end > event.start ? new Date(end.getTime() - 1) : event.start;
    let cursor = startOfDay(event.start);
    const lastDay = startOfDay(lastMoment);
    while (cursor <= lastDay) {
      const key = dayKey(cursor);
      if (visible.has(key)) {
        const list = map.get(key) ?? [];
        list.push(event);
        map.set(key, list);
      }
      cursor = addDays(cursor, 1);
    }
  }
  for (const [key, list] of map) {
    map.set(
      key,
      [...list].sort((a, b) => a.start.getTime() - b.start.getTime())
    );
  }
  return map;
}

function buildSegmentsBySlot(
  events: CalendarEvent[],
  days: Date[],
  interval: number
): Map<string, DaySegment[]> {
  const map = new Map<string, DaySegment[]>();
  for (const day of days) {
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    const key = dayKey(dayStart);
    for (const event of events) {
      if (isAllDayEvent(event)) continue;
      const end = clampEnd(event);
      if (end <= event.start) continue;
      const clippedStart = event.start < dayStart ? dayStart : event.start;
      const clippedEnd = end > dayEnd ? dayEnd : end;
      if (clippedEnd <= clippedStart) continue;
      const startMinute = Math.max(0, differenceInMinutes(clippedStart, dayStart));
      const endMinute = Math.min(MINUTES_PER_DAY, differenceInMinutes(clippedEnd, dayStart));
      if (endMinute <= startMinute) continue;
      const slotMinute = Math.floor(startMinute / interval) * interval;
      const slotKey = `${key}|${slotMinute}`;
      const list = map.get(slotKey) ?? [];
      list.push({ event, startMinute, endMinute });
      map.set(slotKey, list);
    }
  }
  for (const [key, list] of map) {
    map.set(
      key,
      [...list].sort((a, b) => a.startMinute - b.startMinute)
    );
  }
  return map;
}

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

function AllDayChip({ event, onSelect }: { event: CalendarEvent; onSelect?: (event: CalendarEvent) => void }) {
  const category = event.category ?? 'primary';
  return (
    <button
      type="button"
      data-event-id={event.id}
      data-category={category}
      title={`${event.title}, All day`}
      aria-label={`${event.title}, all day`}
      onClick={() => onSelect?.(event)}
      className={cn(
        badgeVariants({ variant: CATEGORY_VARIANTS[category], size: 'sm' }),
        'flex w-full max-w-full min-w-0 justify-start overflow-hidden rounded px-1.5 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <span className="truncate">{event.title}</span>
    </button>
  );
}

function TimeGrid({
  days,
  locale,
  workingStart,
  workingEnd,
  interval,
  allDayByDay,
  segmentsBySlot,
  onSelectSlot,
  onSelectEvent,
  ariaLabel,
}: {
  days: Date[];
  locale?: Locale;
  workingStart: number;
  workingEnd: number;
  interval: number;
  allDayByDay: Map<string, CalendarEvent[]>;
  segmentsBySlot: Map<string, DaySegment[]>;
  onSelectSlot?: (slot: CalendarSlot) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  ariaLabel: string;
}) {
  const slotHeight = Math.max(MIN_SLOT_HEIGHT, interval);
  const pixelsPerMinute = slotHeight / interval;
  const columnTemplate = React.useMemo(
    () => `${HOUR_COLUMN_WIDTH} repeat(${days.length}, minmax(0, 1fr))`,
    [days.length]
  );
  const slotStarts = React.useMemo(() => {
    const starts: number[] = [];
    for (let minute = 0; minute < MINUTES_PER_DAY; minute += interval) starts.push(minute);
    return starts;
  }, [interval]);
  const focusMinute = Math.min(
    MINUTES_PER_DAY - interval,
    Math.ceil(workingStart / interval) * interval
  );
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = workingStart * pixelsPerMinute;
  }, [workingStart, pixelsPerMinute]);

  const selectSlot = React.useCallback(
    (day: Date, minute: number) => {
      const start = addMinutes(startOfDay(day), minute);
      const end = addMinutes(start, interval);
      onSelectSlot?.({ start, end, allDay: false });
    },
    [interval, onSelectSlot]
  );

  const today = new Date();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="grid border-b border-border bg-muted/30"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div aria-hidden className="border-r border-border/50" />
        {days.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={dayKey(day)}
              data-weekday={dayKey(day)}
              className={cn(
                'border-border/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground',
                index > 0 && 'border-l',
                isToday && 'font-semibold text-primary'
              )}
            >
              {format(day, 'EEE d', { locale })}
            </div>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="All day"
        className="grid border-b border-border"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div className="flex items-start justify-end border-r border-border/50 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          All day
        </div>
        {days.map((day, index) => {
          const key = dayKey(day);
          const dayAllDay = allDayByDay.get(key) ?? [];
          return (
            <div
              key={key}
              data-allday-date={key}
              className={cn(
                'min-h-10 space-y-1 border-border/50 p-1',
                index > 0 && 'border-l',
                isSameDay(day, today) && 'bg-accent/20'
              )}
            >
              {dayAllDay.map((event) => (
                <AllDayChip key={event.id} event={event} onSelect={onSelectEvent} />
              ))}
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="max-h-[32rem] overflow-y-auto overscroll-contain">
        <div role="grid" aria-label={ariaLabel} data-time-grid className="w-full">
          {slotStarts.map((minute) => {
            const isHour = minute % 60 === 0;
            const isWorking = minute >= workingStart && minute < workingEnd;
            const label = format(addMinutes(startOfDay(days[0]), minute), 'HH:mm');
            return (
              <div
                key={minute}
                role="row"
                data-row-minute={minute}
                className="grid"
                style={{ gridTemplateColumns: columnTemplate }}
              >
                <div
                  role="rowheader"
                  className={cn(
                    'relative border-r border-border/50 pr-2 text-right font-mono text-[10px] text-muted-foreground',
                    !isWorking && 'opacity-60'
                  )}
                  style={{ height: slotHeight }}
                >
                  {isHour && (
                    <span
                      data-hour-label={label}
                      className="absolute right-2 top-0 -translate-y-1/2 bg-card px-0.5"
                    >
                      {label}
                    </span>
                  )}
                </div>
                {days.map((day, index) => {
                  const key = dayKey(day);
                  const segments = segmentsBySlot.get(`${key}|${minute}`) ?? [];
                  const dayStart = startOfDay(day);
                  const slotStart = addMinutes(dayStart, minute);
                  const slotEnd = addMinutes(dayStart, Math.min(MINUTES_PER_DAY, minute + interval));
                  const slotLabel = `${format(day, 'EEEE', { locale })} ${format(slotStart, 'HH:mm')}–${format(slotEnd, 'HH:mm')}`;
                  return (
                    <div
                      key={key}
                      role="gridcell"
                      tabIndex={minute === focusMinute && index === 0 ? 0 : -1}
                      aria-label={slotLabel}
                      data-date={key}
                      data-slot-minute={minute}
                      data-working={isWorking ? 'true' : 'false'}
                      style={{ height: slotHeight }}
                      onClick={() => selectSlot(day, minute)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          selectSlot(day, minute);
                        }
                      }}
                      className={cn(
                        'relative cursor-pointer border-border/50 border-t',
                        index > 0 && 'border-l',
                        !isWorking && 'bg-muted/40',
                        'hover:bg-accent/40 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
                      )}
                    >
                      {segments.map((segment) => {
                        const category = segment.event.category ?? 'primary';
                        const top = (segment.startMinute - minute) * pixelsPerMinute;
                        const height = Math.max(18, (segment.endMinute - segment.startMinute) * pixelsPerMinute);
                        return (
                          <button
                            key={`${segment.event.id}-${segment.startMinute}`}
                            type="button"
                            data-event-id={segment.event.id}
                            data-category={category}
                            aria-label={`${segment.event.title}, ${eventTimeRange(segment.event, locale)}`}
                            title={`${segment.event.title}, ${eventTimeRange(segment.event, locale)}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectEvent?.(segment.event);
                            }}
                            style={{ top, height }}
                            className={cn(
                              'absolute left-0.5 right-0.5 z-10 overflow-hidden rounded border border-l-2 px-1 py-0.5 text-left text-[10px] leading-tight text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              BLOCK_CLASSES[category]
                            )}
                          >
                            <span className="block truncate font-medium">{segment.event.title}</span>
                            <span className="block truncate font-mono text-muted-foreground">
                              {eventTimeRange(segment.event, locale)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
  workingHours,
  slotIntervalMinutes,
  onSelectSlot,
  onSelectEvent,
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

  const { start: workingStart, end: workingEnd } = React.useMemo(
    () => resolveWorkingMinutes(workingHours),
    [workingHours]
  );
  const interval = React.useMemo(() => resolveSlotInterval(slotIntervalMinutes), [slotIntervalMinutes]);

  const days = React.useMemo(() => {
    if (activeView === 'day') return [startOfDay(activeDate)];
    const weekStart = startOfWeek(activeDate, { weekStartsOn });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [activeView, activeDate, weekStartsOn]);

  const allDayByDay = React.useMemo(() => buildAllDayByDay(events, days), [events, days]);
  const segmentsBySlot = React.useMemo(
    () => buildSegmentsBySlot(events, days, interval),
    [events, days, interval]
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

      {(activeView === 'week' || activeView === 'day') && (
        <TimeGrid
          days={days}
          locale={locale}
          workingStart={workingStart}
          workingEnd={workingEnd}
          interval={interval}
          allDayByDay={allDayByDay}
          segmentsBySlot={segmentsBySlot}
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          ariaLabel={`${VIEW_LABELS[activeView]} time grid`}
        />
      )}

      {activeView === 'agenda' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">{format(activeDate, 'LLLL yyyy', { locale })}</p>
          <p className="mt-1 text-sm text-muted-foreground">Agenda list layout follows in the next iteration.</p>
        </div>
      )}
    </section>
  );
}
