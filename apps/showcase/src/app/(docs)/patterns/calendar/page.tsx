'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, FileText, MousePointerClick, UserRound } from 'lucide-react';
import { PageHeader, Button, Card, CardContent } from '@ds/ui';
import {
  EventCalendar,
  type CalendarEvent,
  type CalendarSlot,
  type CalendarView,
  type WorkingHours,
} from '@ds/ui';
import { format } from 'date-fns';

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

export default function CalendarPage() {
  const [view, setView] = React.useState<CalendarView>('month');
  const [date, setDate] = React.useState<Date>(DEMO_DATE);
  const [workingHours, setWorkingHours] = React.useState<WorkingHours>(WORKING_HOUR_OPTIONS[0].value);
  const [slotInterval, setSlotInterval] = React.useState(30);
  const [lastSlot, setLastSlot] = React.useState<string | null>(null);
  const [lastEvent, setLastEvent] = React.useState<string | null>(null);

  const handleSelectSlot = (slot: CalendarSlot) => {
    setLastSlot(`${format(slot.start, 'EEE d MMM HH:mm')}–${format(slot.end, 'HH:mm')}`);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setLastEvent(event.title);
  };

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={CalendarDays}
        title="Calendar & Event Scheduling"
        description="Declarative EventCalendar with toolbar navigation, month view, and a week/day time grid with all-day strip, configurable working hours, and empty-slot booking. Data is supplied by the scenario; the component never fetches on its own."
      />

      <section className="space-y-3">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 pt-6">
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

            <div className="flex flex-wrap items-center gap-2">
              {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((v) => (
                <Button key={v} type="button" variant={view === v ? 'default' : 'outline'} size="sm" onClick={() => setView(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </div>

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

            <p className="w-full text-sm text-muted-foreground">
              Demo state — view: {view} · date: {format(date, 'EEEE, d MMMM yyyy')} · working hours:{' '}
              {workingHours.start}–{workingHours.end} · interval: {slotInterval} min
            </p>
            <p className="w-full text-sm text-muted-foreground" aria-live="polite">
              Selected slot: {lastSlot ?? 'none yet'} · selected all-day event: {lastEvent ?? 'none yet'}
            </p>
          </CardContent>
        </Card>
        <EventCalendar
          events={DEMO_EVENTS}
          view={view}
          onViewChange={setView}
          currentDate={date}
          onDateChange={setDate}
          workingHours={workingHours}
          slotIntervalMinutes={slotInterval}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
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
            <li>Working hours shade the off-hours area; slots stay visible and selectable so consumers can validate bookings.</li>
            <li>All-day events and full 24-hour events live in the strip above the time grid, never mixed with timed blocks.</li>
            <li>Multi-day continuation markers, overlap columns, and event detail (M-006) arrive in the next iteration.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
