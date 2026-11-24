'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, FileText, MousePointerClick, UserRound } from 'lucide-react';
import { PageHeader, Button, Card, CardContent, Switch, SegmentedControl, SegmentedControlItem } from '@ds/ui';
import {
  EventCalendar,
  type CalendarEvent,
  type CalendarSlot,
  type CalendarView,
  type EventDropInfo,
  type WorkingHours,
} from '@ds/ui';
import { format } from 'date-fns';
import { enUS as en, id } from 'date-fns/locale';

const DEMO_DATE = new Date(2026, 10, 21);

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'conf',
    title: 'Design Conference',
    start: new Date(2026, 10, 19, 9),
    end: new Date(2026, 10, 21, 17),
    category: 'primary',
    location: 'Jakarta Convention Center',
  },
  {
    id: 'keynote',
    title: 'Keynote',
    start: new Date(2026, 10, 21, 9),
    end: new Date(2026, 10, 21, 10),
    category: 'success',
    location: 'Hall A',
  },
  {
    id: 'workshop',
    title: 'OKLCH Workshop',
    start: new Date(2026, 10, 21, 10),
    end: new Date(2026, 10, 21, 11),
    category: 'info',
  },
  {
    id: 'ops-sync',
    title: 'Ops Sync',
    start: new Date(2026, 10, 21, 10, 30),
    end: new Date(2026, 10, 21, 11, 30),
    category: 'warning',
    location: 'Room 2',
  },
  {
    id: 'panel',
    title: 'Panel Talk',
    start: new Date(2026, 10, 21, 13),
    end: new Date(2026, 10, 21, 14),
    category: 'warning',
    location: 'Hall B',
  },
  {
    id: 'meetup',
    title: 'Community Meetup',
    start: new Date(2026, 10, 24, 16),
    end: new Date(2026, 10, 24, 17),
    category: 'destructive',
    location: 'Rooftop Lounge',
  },
  {
    id: 'off',
    title: 'Company Offsite',
    start: new Date(2026, 10, 20),
    end: new Date(2026, 10, 20, 17),
    allDay: true,
    category: 'primary',
  },
  {
    id: 'retreat',
    title: 'Team Retreat',
    start: new Date(2026, 10, 22, 0, 0),
    end: new Date(2026, 10, 23, 0, 0),
    category: 'info',
    location: 'Bogor',
  },
];

const WORKING_HOUR_OPTIONS: Array<{ label: string; value: WorkingHours }> = [
  { label: '08–18', value: { start: '08:00', end: '18:00' } },
  { label: '09–17', value: { start: '09:00', end: '17:00' } },
];

const LOCALE_OPTIONS: Array<{ label: string; value: typeof en | typeof id }> = [
  { label: 'English', value: en },
  { label: 'Bahasa Indonesia', value: id },
];

export default function CalendarPage() {
  const [view, setView] = React.useState<CalendarView>('month');
  const [date, setDate] = React.useState<Date>(DEMO_DATE);
  const [workingHours, setWorkingHours] = React.useState<WorkingHours>(WORKING_HOUR_OPTIONS[0].value);
  const [slotInterval, setSlotInterval] = React.useState(30);
  const [events, setEvents] = React.useState<CalendarEvent[]>(DEMO_EVENTS);
  const [editable, setEditable] = React.useState(true);
  const [locale, setLocale] = React.useState<typeof en | typeof id>(en);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSlot, setLastSlot] = React.useState<string | null>(null);
  const [lastEvent, setLastEvent] = React.useState<string | null>(null);
  const [lastDrop, setLastDrop] = React.useState<string | null>(null);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleSelectSlot = (slot: CalendarSlot) => {
    setLastSlot(`${format(slot.start, 'EEE d MMM HH:mm')}–${format(slot.end, 'HH:mm')}`);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setLastEvent(event.title);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(false);
    setEvents(DEMO_EVENTS);
  };

  const handleEventDrop = ({ id, start, end }: EventDropInfo) => {
    setEvents((previous) =>
      previous.map((event) => (event.id === id ? { ...event, start, end } : event))
    );
    setLastDrop(`${id} → ${format(start, 'EEE d MMM HH:mm')}–${format(end, 'HH:mm')}`);
  };

  const handleAction = (action: 'edit' | 'delete', event: CalendarEvent) => {
    setLastAction(`${action}: ${event.title}`);
    if (action === 'delete') {
      setEvents((previous) => previous.filter((item) => item.id !== event.id));
      setLastEvent(null);
    }
  };

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={CalendarDays}
        title="Calendar & Event Scheduling"
        description="Declarative EventCalendar with toolbar navigation, month view, multi-day continuation segments, overlap columns, event detail (M-006), and pointer-based drag-and-drop. Data is supplied by the scenario; the component never fetches on its own."
      />

      <section className="space-y-3">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <fieldset className="space-y-3 rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-foreground">View &amp; period</legend>
            <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" aria-label="Demo previous" onClick={() => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setDate(DEMO_DATE)}>
                Demo Today
              </Button>
              <Button type="button" variant="outline" size="icon" aria-label="Demo next" onClick={() => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <SegmentedControl
              type="single"
              value={view}
              onValueChange={(v) => {
                if (v) setView(v as CalendarView);
              }}
              aria-label="Calendar view"
            >
              {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((v) => (
                <SegmentedControlItem key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>

            </div>
            </fieldset>
            <fieldset className="space-y-3 rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-foreground">Schedule</legend>
            <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Working hours</span>
              {WORKING_HOUR_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={workingHours.start === option.value.start ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWorkingHours(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Locale</span>
              {LOCALE_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={locale === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocale(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            </div>
            </fieldset>
            <fieldset className="space-y-3 rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-foreground">Data &amp; state</legend>
            <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Slot interval</span>
              {[30, 60].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={slotInterval === minutes ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSlotInterval(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="calendar-editable"
                checked={editable}
                onCheckedChange={setEditable}
                aria-describedby="calendar-editable-hint"
              />
              <label htmlFor="calendar-editable" className="text-xs font-medium text-muted-foreground">
                Editable
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="calendar-loading"
                checked={loading}
                onCheckedChange={setLoading}
                aria-describedby="calendar-loading-hint"
              />
              <label htmlFor="calendar-loading" className="text-xs font-medium text-muted-foreground">
                Loading
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="calendar-error"
                checked={!!error}
                onCheckedChange={(v) => setError(v ? 'Failed to load data from server' : null)}
                aria-describedby="calendar-error-hint"
              />
              <label htmlFor="calendar-error" className="text-xs font-medium text-muted-foreground">
                Error
              </label>
            </div>

            <p className="w-full text-sm text-muted-foreground">
              Demo state — view: {view} · date: {format(date, 'EEEE, d MMMM yyyy')} · working hours:{' '}
              {workingHours.start}–{workingHours.end} · interval: {slotInterval} min · editable:{' '}
              {editable ? 'on' : 'off'} · locale:{' '}
              {locale === id ? 'Bahasa Indonesia' : 'English'} · loading:{loading ? 'on' : 'off'} ·
              error:{error ? 'on' : 'off'}
            </p>
            <p id="calendar-editable-hint" className="w-full text-xs text-muted-foreground">
              Editable turns on drag-and-drop of timed blocks and the Edit/Delete actions in event detail. Turn it
              off for read-only mode; detail can still be opened.
            </p>
            <p id="calendar-loading-hint" className="w-full text-xs text-muted-foreground">
              Loading shows a per-view skeleton grid with aria-busy and temporarily disables navigation.
            </p>
            <p id="calendar-error-hint" className="w-full text-xs text-muted-foreground">
              Error shows an alert role=&quot;alert&quot; with a text message and a retry button that calls
              onRetry (demo handler outside the component).
            </p>
            <p className="w-full text-sm text-muted-foreground" aria-live="polite">
              Selected slot: {lastSlot ?? 'none yet'} · selected event: {lastEvent ?? 'none yet'} · drop:{' '}
              {lastDrop ?? 'none yet'} · action: {lastAction ?? 'none yet'}
            </p>
            </div>
            </fieldset>
          </CardContent>
        </Card>
        <div className="w-full min-w-0 overflow-x-auto">
          <EventCalendar
            events={events}
            view={view}
            onViewChange={setView}
            currentDate={date}
            onDateChange={setDate}
            locale={locale}
            weekStartsOn={1}
            workingHours={workingHours}
            slotIntervalMinutes={slotInterval}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            editable={editable}
            onEventDrop={handleEventDrop}
            onAction={handleAction}
          />
        </div>
      </section>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Pattern notes
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              <UserRound className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Controlled via currentDate and view; the demo panel above drives them from outside the component.
            </li>
            <li>
              <MousePointerClick className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Week and Day render a 24-hour time grid. Click or focus a slot and press Enter/Space to trigger
              onSelectSlot with the exact interval range.
            </li>
            <li>
              Multi-day events render one segment per day in month cells and the all-day strip, with ▸/◂ glyphs and
              screen-reader text instead of color alone.
            </li>
            <li>
              Event detail (M-006) opens as a desktop popover or mobile sheet. Escape closes it and returns focus to the
              originating event.
            </li>
          </ul>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground">
              <caption className="py-2 text-left text-xs font-semibold text-foreground">How the demo controls map to the calendar</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-foreground">
                  <th scope="col" className="py-1 pr-4 font-semibold">Control</th>
                  <th scope="col" className="py-1 pr-4 font-semibold">What changes</th>
                  <th scope="col" className="py-1 font-semibold">Calendar response</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-1 pr-4">View switcher</td>
                  <td className="py-1 pr-4">Month / Week / Day / Agenda</td>
                  <td className="py-1">Grid re-renders for the active view without losing the active date.</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 pr-4">Working hours · Slot interval</td>
                  <td className="py-1 pr-4">08–18 / 09–17 · 30 / 60 min</td>
                  <td className="py-1">Off-hours shade and the time grid reflow; empty slots stay selectable.</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 pr-4">Locale</td>
                  <td className="py-1 pr-4">English / Bahasa Indonesia</td>
                  <td className="py-1">Day and month names and the week start follow the locale prop.</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 pr-4">Loading</td>
                  <td className="py-1 pr-4">On / Off</td>
                  <td className="py-1">Per-view skeleton (month 7×6, week columns, day rows, agenda rows) with aria-busy.</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 pr-4">Error · Editable</td>
                  <td className="py-1 pr-4">On / Off</td>
                  <td className="py-1">Error alert with retry (onRetry); drag-and-drop and Edit/Delete actions.</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4">Agenda (empty)</td>
                  <td className="py-1 pr-4">No events in period</td>
                  <td className="py-1">Empty state with role=&quot;status&quot; and a &quot;Buat event&quot; consumer CTA.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Accessibility notes
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>The grid uses role=&quot;grid&quot;, cells role=&quot;gridcell&quot;, and events are named buttons (title + time + category).</li>
            <li>The view-switcher toolbar uses radiogroup; period and view changes are announced via a live region (aria-live=&quot;polite&quot;).</li>
            <li>The primary-token focus ring (2px) is visible in light and dark mode; slots and events are keyboard-operable only.</li>
            <li>Status and category are never conveyed by color alone (there is text, labels, and badges).</li>
            <li>prefers-reduced-motion is honored; animations are disabled when the user enables it.</li>
            <li>All demo handlers are mocks (log/toast) outside the component; the component itself never calls an API.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
