'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, FileText, UserRound } from 'lucide-react';
import { PageHeader, Button, Card, CardContent } from '@ds/ui';
import { EventCalendar, type CalendarEvent, type CalendarView } from '@ds/ui';
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
];

export default function CalendarPage() {
  const [view, setView] = React.useState<CalendarView>('month');
  const [date, setDate] = React.useState<Date>(DEMO_DATE);

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={CalendarDays}
        title="Calendar & Event Scheduling"
        description="Declarative EventCalendar with toolbar navigation, view switcher, and category legend. Data is supplied by the scenario; the component never fetches on its own."
      />

      <section className="space-y-3">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 pt-6">
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
            <p className="w-full text-sm text-muted-foreground">
              Demo state — view: {view} · date: {format(date, 'EEEE, d MMMM yyyy')}
            </p>
          </CardContent>
        </Card>
        <EventCalendar events={DEMO_EVENTS} view={view} onViewChange={setView} currentDate={date} onDateChange={setDate} />
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
            <li>Multi-day events render as a chip on every covered day.</li>
            <li>More than three events on a day collapse into a +n popover.</li>
            <li>Week keeps the surrounding week of the active date; day and agenda layouts arrive in later iterations.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
