'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, FileText, MousePointerClick, UserRound } from 'lucide-react';
import { PageHeader, Button, Card, CardContent, Switch } from '@ds/ui';
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
    location: 'Ruang 2',
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
                onCheckedChange={(v) => setError(v ? 'Gagal memuat data dari server' : null)}
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
              Editable menyalakan drag-and-drop blok waktu dan aksi Edit/Delete di detail event. Matikan untuk
              mode baca-saja; detail tetap dapat dibuka.
            </p>
            <p id="calendar-loading-hint" className="w-full text-xs text-muted-foreground">
              Loading menampilkan skeleton grid dengan aria-busy dan menonaktifkan navigasi sementara.
            </p>
            <p id="calendar-error-hint" className="w-full text-xs text-muted-foreground">
              Error menampilkan alert role=&quot;alert&quot; dengan pesan teks dan tombol &quot;Coba lagi&quot; yang memanggil
              onRetry (handler demo di luar komponen).
            </p>
            <p className="w-full text-sm text-muted-foreground" aria-live="polite">
              Selected slot: {lastSlot ?? 'none yet'} · selected event: {lastEvent ?? 'none yet'} · drop:{' '}
              {lastDrop ?? 'none yet'} · action: {lastAction ?? 'none yet'}
            </p>
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
            <li>Working hours shade the off-hours area; slots stay visible and selectable so consumers can validate bookings.</li>
            <li>All-day events and full 24-hour events live in the strip above the time grid, never mixed with timed blocks.</li>
            <li>
              Multi-day events render one segment per day in month cells and the all-day strip, with ▸/◂ glyphs and
              screen-reader text instead of color alone.
            </li>
            <li>
              Overlapping timed events share the column width equally and show an &quot;n bentrok&quot; indicator on the
              slot; keyboard users can Tab to each event.
            </li>
            <li>
              Event detail (M-006) opens as a desktop popover or mobile sheet. Escape closes it and returns focus to the
              originating event.
            </li>
            <li>
              With Editable on, drag a timed block to another slot for a live preview, or use the keyboard &quot;Move
              to selected slot&quot; controls inside the detail panel. Both emit the same onEventDrop payload.
            </li>
            <li>
              Agenda view menampilkan event kronologis periode aktif, grup per hari, dengan baris tombol yang
              memanggil onSelectEvent dengan payload event utuh.
            </li>
            <li>
              State matrix: loading (skeleton grid, aria-busy, navigasi disabled), empty (role=&quot;status&quot; +
              CTA konsumen), dan error (role=&quot;alert&quot; + pesan teks + tombol Coba lagi → onRetry).
            </li>
            <li>
              Locale en ↔ id mengubah nama hari/bulan dan awal pekan via prop locale (terverifikasi test dan terlihat
              di weekday header week view).
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Catatan aksesibilitas
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Grid pakai role=&quot;grid&quot;, sel role=&quot;gridcell&quot;, dan event berupa tombol bernama (judul + waktu + kategori).</li>
            <li>Toolbar view switcher pakai radiogroup; perubahan periode/view diumumkan lewat live region (aria-live=&quot;polite&quot;).</li>
            <li>Fokus ring warna token primary 2px terlihat di mode light dan dark; tab navigasi pada slot dan event dapat dioperasikan keyboard-only.</li>
            <li>Pembeda status dan kategori tidak pernah mengandalkan warna saja (ada teks/labels serta badge).</li>
            <li>prefers-reduced-motion dihormati; animasi dinonaktifkan bila pengguna mengaktifkannya.</li>
            <li>Semua handler pada demo adalah mock (log/toast) di luar komponen; komponen itu sendiri tidak memanggil API.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
