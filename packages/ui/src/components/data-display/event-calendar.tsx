'use client';

import * as React from 'react';
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  type Locale,
} from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { DayProps } from 'react-day-picker';
import { cn } from '../../lib/utils';
import { Badge, badgeVariants } from '../base/badge';
import { Button } from '../base/button';
import { Skeleton } from '../base/skeleton';
import { Calendar } from '../form/date-picker';
import { SegmentedControl, SegmentedControlItem } from '../form/segmented-control';
import { Alert, AlertDescription, AlertTitle } from '../feedback/alert';
import { EmptyState } from '../feedback/empty-state';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../overlay/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../overlay/sheet';
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

export interface EventDropInfo {
  id: string;
  start: Date;
  end: Date;
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
  editable?: boolean;
  onEventDrop?: (info: EventDropInfo) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  onAction?: (action: 'edit' | 'delete', event: CalendarEvent) => void;
  renderEventActions?: (event: CalendarEvent) => React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
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
const MOVE_DAY_COUNT = 14;

const DOT_CLASSES: Record<EventCategory, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

const BLOCK_CLASSES: Record<EventCategory, string> = {
  primary: 'border-primary/60 bg-primary/15',
  success: 'border-success/60 bg-success/15',
  warning: 'border-warning/60 bg-warning/15',
  info: 'border-info/60 bg-info/15',
  destructive: 'border-destructive/60 bg-destructive/15',
};

function CalendarEmpty() {
  return (
    <EmptyState
      role="status"
      title="Tidak ada event di periode ini"
      description="Belum ada jadwal pada periode yang dipilih. Coba ganti view atau periode."
      actionLabel="Buat event"
    />
  );
}

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

function dateFromDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface EventSegment {
  event: CalendarEvent;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

interface DaySegment extends EventSegment {
  startMinute: number;
  endMinute: number;
  column: number;
  columns: number;
  conflictCount: number;
}

interface DragState {
  event: CalendarEvent;
  durationMinutes: number;
}

interface DragPreview {
  key: string;
  start: Date;
  end: Date;
}

/** Pecah event menjadi satu segmen per hari kalender dengan penanda lanjutan. */
function buildMonthSegments(events: CalendarEvent[]): Map<string, EventSegment[]> {
  const map = new Map<string, EventSegment[]>();
  for (const event of events) {
    const end = clampEnd(event);
    const lastMoment = end > event.start ? new Date(end.getTime() - 1) : event.start;
    const firstDay = startOfDay(event.start);
    const lastDay = startOfDay(lastMoment);
    let cursor = firstDay;
    while (cursor <= lastDay) {
      const key = dayKey(cursor);
      const list = map.get(key) ?? [];
      list.push({
        event,
        continuesBefore: cursor.getTime() > firstDay.getTime(),
        continuesAfter: cursor.getTime() < lastDay.getTime(),
      });
      map.set(key, list);
      cursor = addDays(cursor, 1);
    }
  }
  for (const [key, list] of map) {
    map.set(
      key,
      [...list].sort((a, b) => {
        if (Boolean(b.event.allDay) !== Boolean(a.event.allDay)) return b.event.allDay ? 1 : -1;
        return a.event.start.getTime() - b.event.start.getTime();
      })
    );
  }
  return map;
}

function buildAllDayByDay(events: CalendarEvent[], days: Date[]): Map<string, EventSegment[]> {
  const visible = new Set(days.map(dayKey));
  const map = new Map<string, EventSegment[]>();
  for (const event of events) {
    if (!isAllDayEvent(event)) continue;
    const end = clampEnd(event);
    const lastMoment = end > event.start ? new Date(end.getTime() - 1) : event.start;
    const firstDay = startOfDay(event.start);
    const lastDay = startOfDay(lastMoment);
    let cursor = firstDay;
    while (cursor <= lastDay) {
      const key = dayKey(cursor);
      if (visible.has(key)) {
        const list = map.get(key) ?? [];
        list.push({
          event,
          continuesBefore: cursor.getTime() > firstDay.getTime(),
          continuesAfter: cursor.getTime() < lastDay.getTime(),
        });
        map.set(key, list);
      }
      cursor = addDays(cursor, 1);
    }
  }
  for (const [key, list] of map) {
    map.set(
      key,
      [...list].sort((a, b) => a.event.start.getTime() - b.event.start.getTime())
    );
  }
  return map;
}

/**
 * Layout interval-column: cluster event yang saling tumpang lalu bagi kolom sama lebar
 * agar tidak ada event yang tertutup penuh.
 */
function layoutDaySegments(
  segments: Omit<DaySegment, 'column' | 'columns' | 'conflictCount'>[]
): DaySegment[] {
  const sorted = [...segments].sort(
    (a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute
  );
  const result: DaySegment[] = [];
  let cluster: typeof sorted = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    const columnEnds: number[] = [];
    const placed = cluster.map((segment) => {
      let column = columnEnds.findIndex((end) => end <= segment.startMinute);
      if (column === -1) {
        columnEnds.push(segment.endMinute);
        column = columnEnds.length - 1;
      } else {
        columnEnds[column] = segment.endMinute;
      }
      return { segment, column };
    });
    const columns = Math.max(1, columnEnds.length);
    for (const { segment, column } of placed) {
      result.push({ ...segment, column, columns, conflictCount: columns });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const segment of sorted) {
    if (cluster.length > 0 && segment.startMinute >= clusterEnd) flush();
    cluster.push(segment);
    clusterEnd = Math.max(clusterEnd, segment.endMinute);
  }
  flush();
  return result;
}

function buildDaySegments(events: CalendarEvent[], day: Date): DaySegment[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const segments: Omit<DaySegment, 'column' | 'columns' | 'conflictCount'>[] = [];
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
    segments.push({
      event,
      startMinute,
      endMinute,
      continuesBefore: event.start < dayStart,
      continuesAfter: end > dayEnd,
    });
  }
  return layoutDaySegments(segments);
}

function buildSegmentsBySlot(
  events: CalendarEvent[],
  days: Date[],
  interval: number
): Map<string, DaySegment[]> {
  const map = new Map<string, DaySegment[]>();
  for (const day of days) {
    const key = dayKey(startOfDay(day));
    for (const segment of buildDaySegments(events, day)) {
      const slotMinute = Math.floor(segment.startMinute / interval) * interval;
      const slotKey = `${key}|${slotMinute}`;
      const list = map.get(slotKey) ?? [];
      list.push(segment);
      map.set(slotKey, list);
    }
  }
  for (const [key, list] of map) {
    map.set(
      key,
      [...list].sort((a, b) => a.startMinute - b.startMinute || a.column - b.column)
    );
  }
  return map;
}

function continuationLabel(segment: EventSegment): string {
  const parts: string[] = [];
  if (segment.continuesBefore) parts.push('berlanjut dari hari sebelumnya');
  if (segment.continuesAfter) parts.push('berlanjut ke hari berikutnya');
  return parts.length > 0 ? `, ${parts.join(', ')}` : '';
}

function continuationAttr(segment: EventSegment): string | undefined {
  if (segment.continuesBefore && segment.continuesAfter) return 'both';
  if (segment.continuesBefore) return 'before';
  if (segment.continuesAfter) return 'after';
  return undefined;
}

function ContinuationMarker({ direction, compact = false }: { direction: 'before' | 'after'; compact?: boolean }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-0.5', compact ? 'text-[9px]' : 'text-[10px]')}>
      <span aria-hidden>{direction === 'before' ? '◂' : '▸'}</span>
      {!compact && <span className="font-medium">lanjutan</span>}
    </span>
  );
}

function formatDetailRange(event: CalendarEvent, locale?: Locale): string {
  if (isAllDayEvent(event)) {
    return `${format(event.start, 'EEE d MMM yyyy', { locale })} · All day`;
  }
  const end = clampEnd(event);
  if (isSameDay(event.start, end)) {
    return `${format(event.start, 'EEE d MMM yyyy, HH:mm', { locale })}–${format(end, 'HH:mm', { locale })}`;
  }
  return `${format(event.start, 'd MMM yyyy, HH:mm', { locale })}–${format(end, 'd MMM yyyy, HH:mm', { locale })}`;
}

function useIsMobileDetail(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 767px)');
    setIsMobile(query.matches);
    const listener = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return isMobile;
}

function EventDetailBody({
  event,
  locale,
  interval,
  editable,
  onAction,
  renderEventActions,
  onEventDrop,
  onClose,
}: {
  event: CalendarEvent;
  locale?: Locale;
  interval: number;
  editable?: boolean;
  onAction?: (action: 'edit' | 'delete', event: CalendarEvent) => void;
  renderEventActions?: (event: CalendarEvent) => React.ReactNode;
  onEventDrop?: (info: EventDropInfo) => void;
  onClose: () => void;
}) {
  const category = event.category ?? 'primary';
  const durationMinutes = Math.max(interval, differenceInMinutes(clampEnd(event), event.start));
  const [moveDay, setMoveDay] = React.useState<Date>(() => startOfDay(event.start));
  const [moveMinute, setMoveMinute] = React.useState<number>(() =>
    differenceInMinutes(event.start, startOfDay(event.start))
  );

  const dayOptions = React.useMemo(
    () => Array.from({ length: MOVE_DAY_COUNT }, (_, index) => addDays(startOfDay(event.start), index)),
    [event.start]
  );
  const minuteOptions = React.useMemo(() => {
    const options: number[] = [];
    for (let minute = 0; minute < MINUTES_PER_DAY; minute += interval) options.push(minute);
    return options;
  }, [interval]);

  const canMove = Boolean(editable && onEventDrop);
  const showActions = Boolean(renderEventActions || (editable && onAction));

  const handleMove = () => {
    if (!onEventDrop) return;
    const start = addMinutes(startOfDay(moveDay), moveMinute);
    onEventDrop({ id: event.id, start, end: addMinutes(start, durationMinutes) });
    onClose();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          <p className="text-xs text-muted-foreground">{formatDetailRange(event, locale)}</p>
        </div>
        <Badge size="sm" variant={CATEGORY_VARIANTS[category]} data-category={category}>
          {CATEGORY_LABELS[category]}
        </Badge>
      </div>

      {event.location && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{event.location}</span>
        </p>
      )}

      {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}

      {showActions && (
        <div className="flex flex-wrap items-center gap-2">
          {editable && onAction && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => onAction('edit', event)}>
                Edit
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => onAction('delete', event)}>
                Delete
              </Button>
            </>
          )}
          {renderEventActions?.(event)}
        </div>
      )}

      {canMove && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-semibold text-foreground">Move event</p>
          <div role="group" aria-label="Move day" className="flex flex-wrap gap-1">
            {dayOptions.map((day) => {
              const selected = isSameDay(day, moveDay);
              return (
                <Button
                  key={dayKey(day)}
                  type="button"
                  size="sm"
                  variant={selected ? 'default' : 'outline'}
                  aria-pressed={selected}
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setMoveDay(day)}
                >
                  {format(day, 'EEE d', { locale })}
                </Button>
              );
            })}
          </div>
          <div
            role="group"
            aria-label="Move time"
            className="flex max-h-24 flex-wrap gap-1 overflow-y-auto pr-1"
          >
            {minuteOptions.map((minute) => {
              const selected = minute === moveMinute;
              return (
                <Button
                  key={minute}
                  type="button"
                  size="sm"
                  variant={selected ? 'default' : 'outline'}
                  aria-pressed={selected}
                  className="h-6 px-1.5 font-mono text-[10px]"
                  onClick={() => setMoveMinute(minute)}
                >
                  {format(addMinutes(startOfDay(event.start), minute), 'HH:mm')}
                </Button>
              );
            })}
          </div>
          <Button type="button" size="sm" onClick={handleMove}>
            Move to selected slot
          </Button>
        </div>
      )}
    </div>
  );
}

function EventChip({
  segment,
  locale,
  renderEvent,
  onOpen,
}: {
  segment: EventSegment;
  locale?: Locale;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  onOpen: (event: CalendarEvent, anchor: HTMLElement | null) => void;
}) {
  const { event } = segment;
  const category = event.category ?? 'primary';
  const detail = `${event.title}, ${eventTimeRange(event, locale)}${continuationLabel(segment)}`;
  return (
    <button
      type="button"
      data-event-id={event.id}
      data-category={category}
      data-continuation={continuationAttr(segment)}
      title={detail}
      aria-label={detail}
      onClick={(domEvent) => onOpen(event, domEvent.currentTarget)}
      className={cn(
        badgeVariants({ variant: CATEGORY_VARIANTS[category], size: 'sm' }),
        'flex w-full max-w-full min-w-0 items-center justify-start gap-1 overflow-hidden rounded px-1.5 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {segment.continuesBefore && <ContinuationMarker direction="before" compact />}
      {renderEvent ? (
        <span className="min-w-0 flex-1">{renderEvent(event)}</span>
      ) : (
        <>
          <span className="shrink-0 font-mono text-[10px] opacity-90">{eventTimeRange(event, locale)}</span>
          <span className="min-w-0 flex-1 truncate">{event.title}</span>
        </>
      )}
      {segment.continuesAfter && <ContinuationMarker direction="after" compact />}
    </button>
  );
}

function DayOverflow({
  segments,
  day,
  locale,
  onOpen,
}: {
  segments: EventSegment[];
  day: Date;
  locale?: Locale;
  onOpen: (event: CalendarEvent, anchor: HTMLElement | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const extra = segments.length - MAX_VISIBLE;
  if (extra <= 0) return null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          {segments.map((segment) => (
            <li key={segment.event.id} className="text-xs">
              <button
                type="button"
                className="inline-flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(domEvent) => {
                  setOpen(false);
                  onOpen(segment.event, domEvent.currentTarget);
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    'inline-block h-2 w-2 shrink-0 rounded-full',
                    DOT_CLASSES[segment.event.category ?? 'primary']
                  )}
                />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {eventTimeRange(segment.event, locale)}
                </span>{' '}
                <span className="text-foreground">{segment.event.title}</span>
                {segment.continuesAfter && <ContinuationMarker direction="after" compact />}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function AllDayChip({
  segment,
  renderEvent,
  onOpen,
}: {
  segment: EventSegment;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  onOpen: (event: CalendarEvent, anchor: HTMLElement | null) => void;
}) {
  const { event } = segment;
  const category = event.category ?? 'primary';
  const label = `${event.title}, all day${continuationLabel(segment)}`;
  return (
    <button
      type="button"
      data-event-id={event.id}
      data-category={category}
      data-continuation={continuationAttr(segment)}
      title={label}
      aria-label={label}
      onClick={(domEvent) => onOpen(event, domEvent.currentTarget)}
      className={cn(
        badgeVariants({ variant: CATEGORY_VARIANTS[category], size: 'sm' }),
        'flex w-full max-w-full min-w-0 items-center justify-start gap-1 overflow-hidden rounded px-1.5 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {segment.continuesBefore && <ContinuationMarker direction="before" compact />}
      {renderEvent ? (
        <span className="min-w-0 flex-1">{renderEvent(event)}</span>
      ) : (
        <span className="truncate">{event.title}</span>
      )}
      {segment.continuesAfter && <ContinuationMarker direction="after" compact />}
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
  onOpen,
  renderEvent,
  editable,
  dragPreview,
  onEventPointerDown,
  ariaLabel,
}: {
  days: Date[];
  locale?: Locale;
  workingStart: number;
  workingEnd: number;
  interval: number;
  allDayByDay: Map<string, EventSegment[]>;
  segmentsBySlot: Map<string, DaySegment[]>;
  onSelectSlot?: (slot: CalendarSlot) => void;
  onOpen: (event: CalendarEvent, anchor: HTMLElement | null) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  editable?: boolean;
  dragPreview: DragPreview | null;
  onEventPointerDown: (event: CalendarEvent, domEvent: React.PointerEvent<HTMLElement>) => void;
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
              {dayAllDay.map((segment) => (
                <AllDayChip
                  key={segment.event.id}
                  segment={segment}
                  renderEvent={renderEvent}
                  onOpen={onOpen}
                />
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
                  const conflictCount = segments.reduce((max, segment) => Math.max(max, segment.conflictCount), 1);
                  const preview = dragPreview?.key === `${key}|${minute}` ? dragPreview : null;
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
                      onKeyDown={(domEvent) => {
                        if (domEvent.key === 'Enter' || domEvent.key === ' ') {
                          domEvent.preventDefault();
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
                      {conflictCount > 1 && (
                        <span
                          data-conflict-count={conflictCount}
                          className="pointer-events-none absolute right-1 top-0.5 z-20 rounded bg-background/90 px-1 text-[9px] font-medium text-muted-foreground"
                        >
                          {conflictCount} bentrok
                        </span>
                      )}
                      {segments.map((segment) => {
                        const category = segment.event.category ?? 'primary';
                        const top = (segment.startMinute - minute) * pixelsPerMinute;
                        const height = Math.max(24, (segment.endMinute - segment.startMinute) * pixelsPerMinute);
                        const widthPercent = 100 / segment.columns;
                        const leftPercent = segment.column * widthPercent;
                        const label = `${segment.event.title}, ${eventTimeRange(segment.event, locale)}${
                          segment.conflictCount > 1 ? `, ${segment.conflictCount} bentrok` : ''
                        }${continuationLabel(segment)}`;
                        return (
                          <button
                            key={`${segment.event.id}-${segment.startMinute}`}
                            type="button"
                            data-event-id={segment.event.id}
                            data-category={category}
                            data-continuation={continuationAttr(segment)}
                            data-conflict-count={segment.conflictCount > 1 ? segment.conflictCount : undefined}
                            aria-label={label}
                            title={label}
                            onPointerDown={(domEvent) => onEventPointerDown(segment.event, domEvent)}
                            onClick={(domEvent) => {
                              domEvent.stopPropagation();
                              onOpen(segment.event, domEvent.currentTarget);
                            }}
                            style={{
                              top,
                              height,
                              left: `calc(${leftPercent}% + 2px)`,
                              width: `calc(${widthPercent}% - 4px)`,
                            }}
                            className={cn(
                              'absolute z-10 overflow-hidden rounded border border-l-4 px-1 py-0.5 text-left text-[10px] leading-tight text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              editable && 'cursor-grab touch-none active:cursor-grabbing',
                              BLOCK_CLASSES[category]
                            )}
                          >
                            {segment.continuesBefore && <ContinuationMarker direction="before" />}
                            {renderEvent ? (
                              <span className="block min-w-0">{renderEvent(segment.event)}</span>
                            ) : (
                              <>
                                <span className="block truncate font-medium">{segment.event.title}</span>
                                <span className="block truncate font-mono text-muted-foreground">
                                  {eventTimeRange(segment.event, locale)}
                                </span>
                              </>
                            )}
                            {segment.continuesAfter && <ContinuationMarker direction="after" />}
                          </button>
                        );
                      })}
                      {preview && (
                        <div
                          data-drag-preview
                          aria-hidden
                          style={{
                            top: (differenceInMinutes(preview.start, dayStart) - minute) * pixelsPerMinute,
                            height: Math.max(24, differenceInMinutes(preview.end, preview.start) * pixelsPerMinute),
                          }}
                          className="pointer-events-none absolute inset-x-1 z-20 rounded border-2 border-dashed border-primary bg-primary/20 px-1 py-0.5 font-mono text-[10px] text-primary"
                        >
                          {format(preview.start, 'HH:mm')}–{format(preview.end, 'HH:mm')}
                        </div>
                      )}
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

function periodLabel(
  view: CalendarView,
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  locale?: Locale
): string {
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
  editable = false,
  onEventDrop,
  renderEvent,
  onAction,
  renderEventActions,
  loading = false,
  error = null,
  onRetry,
  ariaLabel = 'Event calendar',
  className,
}: EventCalendarProps) {
  const isViewControlled = view !== undefined;
  const [internalView, setInternalView] = React.useState<CalendarView>(defaultView ?? 'month');
  const activeView = view ?? internalView;

  const isDateControlled = currentDate !== undefined;
  const [internalDate, setInternalDate] = React.useState<Date>(defaultDate ?? new Date());
  const activeDate = currentDate ?? internalDate;

  const monthSegments = React.useMemo(() => buildMonthSegments(events), [events]);
  const isMobile = useIsMobileDetail();

  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const anchorRef = React.useRef<HTMLElement | null>(null);

  const [dragState, setDragState] = React.useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = React.useState<DragPreview | null>(null);
  const dragPreviewRef = React.useRef<DragPreview | null>(null);
  const suppressClickRef = React.useRef(false);

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

  const closeDetail = React.useCallback(() => {
    const anchor = anchorRef.current;
    setSelectedEvent(null);
    setAnchorEl(null);
    if (anchor) window.setTimeout(() => anchor.focus(), 0);
  }, []);

  const openDetail = React.useCallback(
    (event: CalendarEvent, anchor: HTMLElement | null) => {
      anchorRef.current = anchor;
      setAnchorEl(anchor);
      setSelectedEvent(event);
      onSelectEvent?.(event);
    },
    [onSelectEvent]
  );

  const handleEventClick = React.useCallback(
    (event: CalendarEvent, anchor: HTMLElement | null) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      openDetail(event, anchor);
    },
    [openDetail]
  );

  const interval = React.useMemo(() => resolveSlotInterval(slotIntervalMinutes), [slotIntervalMinutes]);

  const handleEventPointerDown = React.useCallback(
    (event: CalendarEvent, domEvent: React.PointerEvent<HTMLElement>) => {
      if (!editable || !onEventDrop || domEvent.button !== 0) return;
      suppressClickRef.current = false;
      const durationMinutes = Math.max(
        interval,
        differenceInMinutes(clampEnd(event), event.start)
      );
      setDragState({ event, durationMinutes });
      dragPreviewRef.current = null;
      setDragPreview(null);
    },
    [editable, onEventDrop, interval]
  );

  React.useEffect(() => {
    if (!dragState) return;
    const previewFor = (target: EventTarget | null): DragPreview | null => {
      const element = target instanceof Element ? target : null;
      const cell = element?.closest<HTMLElement>('[data-slot-minute][data-date]') ?? null;
      if (!cell) return null;
      const dateAttr = cell.getAttribute('data-date');
      const minuteAttr = Number(cell.getAttribute('data-slot-minute'));
      if (!dateAttr || !Number.isFinite(minuteAttr)) return null;
      const start = addMinutes(dateFromDayKey(dateAttr), minuteAttr);
      return {
        key: `${dateAttr}|${minuteAttr}`,
        start,
        end: addMinutes(start, dragState.durationMinutes),
      };
    };

    const handlePointerMove = (domEvent: PointerEvent) => {
      const preview = previewFor(domEvent.target);
      dragPreviewRef.current = preview;
      setDragPreview(preview);
    };

    const finishDrag = () => {
      const preview = dragPreviewRef.current;
      if (preview && onEventDrop) {
        suppressClickRef.current = true;
        onEventDrop({ id: dragState.event.id, start: preview.start, end: preview.end });
      }
      dragPreviewRef.current = null;
      setDragPreview(null);
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [dragState, onEventDrop]);

  const MonthDayCell = React.useCallback(
    (props: DayProps) => {
      const { day, modifiers, children, className: cellClassName, ...rest } = props;
      const dateKeyValue = format(day.date, 'yyyy-MM-dd');
      const daySegments = monthSegments.get(dateKeyValue) ?? [];
      const visible = daySegments.slice(0, MAX_VISIBLE);
      const isToday = isSameDay(day.date, new Date());
      return (
        <td
          {...rest}
          data-date={dateKeyValue}
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
              <DayOverflow segments={daySegments} day={day.date} locale={locale} onOpen={handleEventClick} />
            </div>
            <div className="flex flex-col gap-1">
              {visible.map((segment) => (
                <EventChip
                  key={segment.event.id}
                  segment={segment}
                  locale={locale}
                  renderEvent={renderEvent}
                  onOpen={handleEventClick}
                />
              ))}
            </div>
          </div>
        </td>
      );
    },
    [monthSegments, locale, renderEvent, handleEventClick]
  );

  const monthComponents = React.useMemo(() => ({ Day: MonthDayCell }), [MonthDayCell]);

  const { start: workingStart, end: workingEnd } = React.useMemo(
    () => resolveWorkingMinutes(workingHours),
    [workingHours]
  );

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

  /** Agenda: filter event yang menyentuh periode aktif (bulan activeDate), urut start, grup per hari. */
  const agendaGroups = React.useMemo(() => {
    const monthStart = startOfMonth(activeDate);
    const monthEnd = endOfMonth(activeDate);
    const groups = new Map<string, { dayKey: string; dayLabel: string; events: CalendarEvent[] }>();
    for (const event of events) {
      const eventEnd = clampEnd(event);
      let cursor = startOfDay(event.start);
      const lastDay = startOfDay(eventEnd);
      while (cursor <= lastDay && cursor <= monthEnd) {
        if (cursor >= monthStart) {
          const key = dayKey(cursor);
          let group = groups.get(key);
          if (!group) {
            group = {
              dayKey: key,
              dayLabel: format(cursor, 'EEEE, d MMMM yyyy', { locale }),
              events: [],
            };
            groups.set(key, group);
          }
          group.events.push(event);
        }
        cursor = addDays(cursor, 1);
      }
    }
    return Array.from(groups.values())
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
      .map((g) => ({
        ...g,
        events: g.events.sort((a, b) => a.start.getTime() - b.start.getTime()),
      }));
  }, [events, activeDate, locale]);

  const virtualAnchor = React.useMemo<React.RefObject<HTMLElement | null>>(
    () => ({ current: anchorEl }),
    [anchorEl]
  );

  return (
    <section aria-label={ariaLabel} className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={loading}
            aria-label="Previous period"
            onClick={() => changeDate(shiftDate(activeView, activeDate, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => changeDate(new Date())}>
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={loading}
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
            disabled={loading}
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

      {loading ? (
        <div
          role="grid"
          aria-busy="true"
          aria-label={ariaLabel}
          data-skeleton-view={activeView}
          className="rounded-lg border border-border bg-card p-4"
        >
          {activeView === 'month' && (
            <div className="grid w-full grid-cols-7 gap-px overflow-hidden rounded-md border border-border/50" aria-hidden>
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-none" />
              ))}
            </div>
          )}
          {activeView === 'week' && (
            <div className="grid w-full grid-cols-7 gap-2" aria-hidden>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          )}
          {activeView === 'day' && (
            <div className="grid w-full gap-2" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {activeView === 'agenda' && (
            <div className="w-full space-y-2" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">Memuat event…</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" role="alert" className="rounded-lg border border-border">
          <AlertTitle>Gagal memuat event</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          {onRetry && (
            <Button type="button" size="sm" onClick={onRetry} className="mt-3">
              Coba lagi
            </Button>
          )}
        </Alert>
      ) : activeView === 'agenda' ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">{format(activeDate, 'LLLL yyyy', { locale })}</p>
          {agendaGroups.length === 0 ? (
            <div className="mt-1">
              <CalendarEmpty />
            </div>
          ) : (
            <div className="mt-4 space-y-4" role="list">
              {agendaGroups.map((group) => (
                <section key={group.dayKey} role="listitem" className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{group.dayLabel}</h3>
                  <div className="space-y-1.5">
                    {group.events.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        disabled={loading}
                        onClick={() => onSelectEvent?.(event)}
                        className="flex items-center justify-between gap-2 rounded border border-border/50 bg-background px-3 py-2 text-left text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent/40"
                        aria-label={formatDetailRange(event, locale)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {eventTimeRange(event, locale)}
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {event.category ?? 'primary'}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : events.length === 0 ? (
        <CalendarEmpty />
      ) : (
        <>
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
              onOpen={handleEventClick}
              renderEvent={renderEvent}
              editable={editable}
              dragPreview={dragPreview}
              onEventPointerDown={handleEventPointerDown}
              ariaLabel={periodLabel(activeView, activeDate, weekStartsOn, locale)}
            />
          )}


        </>
      )}

      {selectedEvent && !isMobile && (
        <Popover open onOpenChange={(next) => { if (!next) closeDetail(); }}>
          <PopoverAnchor virtualRef={virtualAnchor} />
          <PopoverContent
            role="dialog"
            aria-label={`Event detail: ${selectedEvent.title}`}
            align="start"
            className="w-80 space-y-3"
          >
            <EventDetailBody
              key={selectedEvent.id}
              event={selectedEvent}
              locale={locale}
              interval={interval}
              editable={editable}
              onAction={onAction}
              renderEventActions={renderEventActions}
              onEventDrop={onEventDrop}
              onClose={closeDetail}
            />
          </PopoverContent>
        </Popover>
      )}

      {selectedEvent && isMobile && (
        <Sheet open onOpenChange={(next) => { if (!next) closeDetail(); }}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Event detail</SheetTitle>
              <SheetDescription>{selectedEvent.title}</SheetDescription>
            </SheetHeader>
            <EventDetailBody
              key={selectedEvent.id}
              event={selectedEvent}
              locale={locale}
              interval={interval}
              editable={editable}
              onAction={onAction}
              renderEventActions={renderEventActions}
              onEventDrop={onEventDrop}
              onClose={closeDetail}
            />
          </SheetContent>
        </Sheet>
      )}
    </section>
  );
}
