import { afterEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { addMonths } from 'date-fns';
import { enUS as en, id } from 'date-fns/locale';
import { EventCalendar, type CalendarEvent } from './event-calendar';

const CONTEXT_DATE = new Date(2026, 10, 21);

function dayDate(day: number, hour = 9, minute = 0): Date {
  return new Date(2026, 10, day, hour, minute);
}

const EVENTS: CalendarEvent[] = [
  { id: 'conf', title: 'Design Conference', start: dayDate(19, 9), end: dayDate(21, 17), category: 'primary' },
  { id: 'keynote', title: 'Keynote', start: dayDate(21, 9), end: dayDate(21, 10), category: 'success' },
  { id: 'workshop', title: 'OKLCH Workshop', start: dayDate(21, 10), end: dayDate(21, 11), category: 'info' },
  { id: 'panel', title: 'Panel Talk', start: dayDate(21, 13), end: dayDate(21, 14), category: 'warning' },
  { id: 'meetup', title: 'Community Meetup', start: dayDate(22, 16), end: dayDate(22, 17), category: 'destructive' },
  { id: 'off', title: 'Company Offsite', start: dayDate(20), end: dayDate(20, 17), allDay: true, category: 'primary' },
];

function cellFor(container: HTMLElement, date: string): HTMLElement | null {
  return container.querySelector(`[data-date="${date}"]`);
}

describe('EventCalendar', () => {
  it('AC-01: menampilkan chip event pada sel tanggal yang benar', () => {
    const { container } = render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="month" />);

    const cell21 = cellFor(container, '2026-11-21');
    expect(cell21).not.toBeNull();
    expect(within(cell21 as HTMLElement).getByText('Keynote')).toBeDefined();
    expect(within(cell21 as HTMLElement).getByText('Design Conference')).toBeDefined();

    const cell19 = cellFor(container, '2026-11-19');
    expect(within(cell19 as HTMLElement).getByText('Design Conference')).toBeDefined();

    const cell20 = cellFor(container, '2026-11-20');
    expect(within(cell20 as HTMLElement).getByText('Company Offsite')).toBeDefined();

    const cell24 = cellFor(container, '2026-11-24');
    expect(cell24).not.toBeNull();
    expect(within(cell24 as HTMLElement).queryByText('Keynote')).toBeNull();
  });

  it('AC-01: overflow menampilkan +n saat lebih dari tiga event', () => {
    const { container } = render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="month" />);
    const cell21 = cellFor(container, '2026-11-21') as HTMLElement;
    expect(screen.getByLabelText(/more events on/)).toBeDefined();
    fireEvent.click(screen.getByLabelText(/more events on/));
    expect(screen.getByText('Panel Talk')).toBeDefined();
    expect(within(cell21).getByText('Keynote')).toBeDefined();
  });

  it('AC-02: navigasi uncontrolled mengubah label dan memanggil onDateChange', () => {
    const onDateChange = vi.fn();
    render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} onDateChange={onDateChange} defaultView="month" />);
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeDefined();

    fireEvent.click(screen.getByLabelText('Next period'));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    const next = onDateChange.mock.calls[0][0] as Date;
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(11);
    expect(screen.getByRole('heading', { name: 'December 2026' })).toBeDefined();
  });

  it('AC-02: controlled currentDate tidak berubah tanpa parent', () => {
    const onDateChange = vi.fn();
    render(<EventCalendar events={EVENTS} currentDate={CONTEXT_DATE} onDateChange={onDateChange} view="month" />);
    fireEvent.click(screen.getByLabelText('Next period'));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'December 2026' })).toBeNull();
  });

  it('AC-03: switch ke week mempertahankan konteks tanggal dan memanggil onViewChange', () => {
    const onViewChange = vi.fn();
    render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="month" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onViewChange).toHaveBeenCalledWith('week');
    expect(screen.getByRole('heading', { name: '16 Nov – 22 Nov 2026' })).toBeDefined();
  });

  it('AC-03: controlled view tidak berubah tanpa parent', () => {
    const onViewChange = vi.fn();
    const { rerender } = render(<EventCalendar events={EVENTS} currentDate={CONTEXT_DATE} view="month" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onViewChange).toHaveBeenCalledWith('week');
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeDefined();
    rerender(<EventCalendar events={EVENTS} currentDate={CONTEXT_DATE} view="week" onViewChange={onViewChange} />);
    expect(screen.getByRole('heading', { name: '16 Nov – 22 Nov 2026' })).toBeDefined();
  });

  it('AC-04: semua kategori memakai token semantik', () => {
    const { container } = render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="month" />);
    const cell21 = cellFor(container, '2026-11-21') as HTMLElement;
    const chips = within(cell21).getAllByText(/Design Conference|Keynote|Panel Talk|OKLCH Workshop/);
    expect(chips.length).toBeGreaterThanOrEqual(3);

    const allChips = Array.from(container.querySelectorAll('[data-category]'));
    const categories = new Set(allChips.map((c) => c.getAttribute('data-category')));
    expect(categories.has('primary')).toBe(true);
    expect(categories.has('success')).toBe(true);
    expect(categories.has('info')).toBe(true);
    expect(categories.has('destructive')).toBe(true);

    const joinClasses = (el: Element) => el.getAttribute('class') ?? '';
    expect(allChips.some((el) => joinClasses(el).includes('bg-success'))).toBe(true);
    expect(allChips.some((el) => joinClasses(el).includes('bg-info'))).toBe(true);
    expect(allChips.some((el) => joinClasses(el).includes('bg-primary'))).toBe(true);
    expect(allChips.some((el) => joinClasses(el).includes('bg-destructive'))).toBe(true);
    expect(allChips.every((el) => !joinClasses(el).includes('#'))).toBe(true);

    // Warning ada di overflow pada 21 Nov; dibuka lewat popover.
    fireEvent.click(screen.getByLabelText(/more events on/));
    const popoverItem = screen.getByText('Panel Talk').closest('li') as HTMLElement;
    expect(popoverItem.querySelector('.bg-warning')).not.toBeNull();
    expect((popoverItem.getAttribute('class') ?? '').includes('#')).toBe(false);
  });

  it('AC-04: legend memakai varian badge yang sama dengan chip', () => {
    render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} />);
    const legend = screen.getByLabelText('Category legend');
    expect(within(legend).getByText('Primary')).toBeDefined();
    expect(within(legend).getByText('Success')).toBeDefined();
    expect(within(legend).getByText('Warning')).toBeDefined();
    expect(within(legend).getByText('Info')).toBeDefined();
    expect(within(legend).getByText('Critical')).toBeDefined();
  });

  it('Today mengembalikan konteks ke hari ini', () => {
    const onDateChange = vi.fn();
    render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} onDateChange={onDateChange} defaultView="month" />);
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).getTime()).toBeGreaterThan(0);
    expect(addMonths(new Date(), 1).getMonth()).not.toBe((onDateChange.mock.calls[0][0] as Date).getMonth());
  });
});

describe('EventCalendar time grid', () => {
  const fullDayEvent: CalendarEvent = {
    id: 'retreat',
    title: 'Team Retreat',
    start: new Date(2026, 10, 22, 0, 0),
    end: new Date(2026, 10, 23, 0, 0),
    category: 'info',
  };

  function workingCells(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>('[data-working="true"]'));
  }

  it('AC-01: week grid memposisikan blok dari menit dan mengarsir luar jam kerja', () => {
    const offsetEvent: CalendarEvent = {
      id: 'sync',
      title: 'Quick Sync',
      start: new Date(2026, 10, 21, 9, 15),
      end: new Date(2026, 10, 21, 9, 45),
      category: 'success',
    };
    const { container } = render(
      <EventCalendar events={[...EVENTS, offsetEvent]} defaultDate={CONTEXT_DATE} defaultView="week" />
    );

    const keynote = container.querySelector<HTMLElement>('[data-event-id="keynote"]');
    expect(keynote).not.toBeNull();
    expect(keynote?.style.top).toBe('0px');
    expect(keynote?.style.height).toBe('60px');
    expect(keynote?.closest('[data-slot-minute]')?.getAttribute('data-slot-minute')).toBe('540');
    expect(keynote?.closest('[data-date]')?.getAttribute('data-date')).toBe('2026-11-21');

    const workshop = container.querySelector<HTMLElement>('[data-event-id="workshop"]');
    expect(workshop?.closest('[data-slot-minute]')?.getAttribute('data-slot-minute')).toBe('600');
    expect(workshop?.style.height).toBe('60px');

    const offset = container.querySelector<HTMLElement>('[data-event-id="sync"]');
    expect(offset?.style.top).toBe('15px');
    expect(offset?.style.height).toBe('30px');

    expect(container.querySelectorAll('[data-hour-label]').length).toBe(24);
    expect(screen.getAllByRole('gridcell').length).toBe(48 * 7);

    const defaultWorking = workingCells(container);
    expect(defaultWorking.length).toBe(20 * 7);

    const outside = container.querySelector<HTMLElement>('[data-date="2026-11-16"][data-slot-minute="0"]');
    expect(outside?.getAttribute('data-working')).toBe('false');
    expect(outside?.className).toContain('bg-muted');
    expect(container.querySelector('[data-working="false"]')).not.toBeNull();
  });

  it('AC-02: workingHours + slotIntervalMinutes mengubah grid (09–17/30 dan default 08–18/30)', () => {
    const { container, unmount } = render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        workingHours={{ start: '09:00', end: '17:00' }}
        slotIntervalMinutes={30}
      />
    );

    expect(workingCells(container).length).toBe(16 * 7);
    expect(container.querySelector('[data-hour-label="09:00"]')).not.toBeNull();
    expect(container.querySelector('[data-hour-label="16:00"]')).not.toBeNull();
    expect(
      container.querySelector('[data-date="2026-11-16"][data-slot-minute="540"]')?.getAttribute('data-working')
    ).toBe('true');
    expect(
      container.querySelector('[data-date="2026-11-16"][data-slot-minute="480"]')?.getAttribute('data-working')
    ).toBe('false');
    unmount();

    const hourly = render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        slotIntervalMinutes={60}
      />
    );
    expect(workingCells(hourly.container).length).toBe(10 * 7);
    expect(screen.getAllByRole('gridcell').length).toBe(24 * 7);
  });

  it('AC-03: klik dan keyboard pada slot memanggil onSelectSlot sekali dengan rentang interval', () => {
    const onSelectSlot = vi.fn();
    render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        onSelectSlot={onSelectSlot}
      />
    );

    const slot = screen.getByRole('gridcell', { name: 'Monday 09:00–09:30' });
    fireEvent.click(slot);

    expect(onSelectSlot).toHaveBeenCalledTimes(1);
    const payload = onSelectSlot.mock.calls[0][0] as { start: Date; end: Date; allDay: boolean };
    expect(payload.start.getFullYear()).toBe(2026);
    expect(payload.start.getMonth()).toBe(10);
    expect(payload.start.getDate()).toBe(16);
    expect(payload.start.getHours()).toBe(9);
    expect(payload.start.getMinutes()).toBe(0);
    expect(payload.end.getHours()).toBe(9);
    expect(payload.end.getMinutes()).toBe(30);
    expect(payload.allDay).toBe(false);

    fireEvent.keyDown(slot, { key: 'Enter' });
    fireEvent.keyDown(slot, { key: ' ' });
    expect(onSelectSlot).toHaveBeenCalledTimes(3);
  });

  it('AC-03: day view merender satu kolom slot fokusable', () => {
    const { container } = render(
      <EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="day" />
    );

    expect(screen.getAllByRole('gridcell').length).toBe(48);
    expect(container.querySelectorAll('[data-date="2026-11-21"]').length).toBe(48);

    const slot = screen.getByRole('gridcell', { name: 'Saturday 09:00–09:30' });
    expect(slot.getAttribute('tabindex')).toBe('-1');
    expect(screen.getByRole('gridcell', { name: 'Saturday 08:00–08:30' }).getAttribute('tabindex')).toBe('0');
  });

  it('AC-04: all-day dan event 24 jam tampil di strip terpisah, tidak di grid jam', () => {
    const onSelectEvent = vi.fn();
    const { container } = render(
      <EventCalendar
        events={[...EVENTS, fullDayEvent]}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        onSelectEvent={onSelectEvent}
      />
    );

    const friday = container.querySelector<HTMLElement>('[data-allday-date="2026-11-20"]');
    expect(friday).not.toBeNull();
    expect(within(friday as HTMLElement).getByText('Company Offsite')).toBeDefined();

    const sunday = container.querySelector<HTMLElement>('[data-allday-date="2026-11-22"]');
    expect(within(sunday as HTMLElement).getByText('Team Retreat')).toBeDefined();

    expect(container.querySelector('[data-time-grid] [data-event-id="off"]')).toBeNull();
    expect(container.querySelector('[data-time-grid] [data-event-id="retreat"]')).toBeNull();
    expect(container.querySelector('[data-event-id="keynote"]')).not.toBeNull();

    const chip = screen.getByRole('button', { name: 'Company Offsite, all day' });
    fireEvent.click(chip);
    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    expect((onSelectEvent.mock.calls[0][0] as CalendarEvent).id).toBe('off');
  });
});

describe('EventCalendar multi-day segments', () => {
  it('AC-01: event 3 hari tampil berurutan dengan penanda lanjutan di month', () => {
    const { container } = render(
      <EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="month" />
    );

    const day19 = container.querySelector<HTMLElement>('[data-date="2026-11-19"]');
    const day20 = container.querySelector<HTMLElement>('[data-date="2026-11-20"]');
    const day21 = container.querySelector<HTMLElement>('[data-date="2026-11-21"]');

    const first = within(day19 as HTMLElement).getByRole('button', { name: /Design Conference/ });
    const middle = within(day20 as HTMLElement).getByRole('button', { name: /Design Conference/ });
    const last = within(day21 as HTMLElement).getByRole('button', { name: /Design Conference/ });

    expect(first.getAttribute('data-continuation')).toBe('after');
    expect(middle.getAttribute('data-continuation')).toBe('both');
    expect(last.getAttribute('data-continuation')).toBe('before');
    expect(first.getAttribute('aria-label')).toContain('berlanjut ke hari berikutnya');
    expect(middle.getAttribute('aria-label')).toContain('berlanjut dari hari sebelumnya');
  });

  it('AC-01: klik segmen mana pun mengirim payload event utuh', () => {
    const onSelectEvent = vi.fn();
    const { container } = render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="month"
        onSelectEvent={onSelectEvent}
      />
    );

    const day20 = container.querySelector<HTMLElement>('[data-date="2026-11-20"]');
    fireEvent.click(within(day20 as HTMLElement).getByRole('button', { name: /Design Conference/ }));

    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    const payload = onSelectEvent.mock.calls[0][0] as CalendarEvent;
    expect(payload.id).toBe('conf');
    expect(payload.start.getDate()).toBe(19);
    expect(payload.end.getDate()).toBe(21);
    expect(payload.title).toBe('Design Conference');
  });

  it('AC-01: week dan day menampilkan segmen lanjutan bertanda teks', () => {
    const week = render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="week" />);
    const weekSegments = week.container.querySelectorAll('[data-allday-date] [data-event-id="conf"]');
    expect(weekSegments.length).toBe(3);
    expect(weekSegments[0].getAttribute('data-continuation')).toBe('after');
    expect(weekSegments[1].getAttribute('data-continuation')).toBe('both');
    expect(weekSegments[2].getAttribute('data-continuation')).toBe('before');
    expect(weekSegments[0].getAttribute('aria-label')).toContain('berlanjut ke hari berikutnya');
    expect(weekSegments[1].getAttribute('aria-label')).toContain('berlanjut dari hari sebelumnya');
    week.unmount();

    const day = render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="day" />);
    const daySegment = day.container.querySelector('[data-allday-date] [data-event-id="conf"]');
    expect(daySegment?.getAttribute('data-continuation')).toBe('before');
  });
});

describe('EventCalendar overlap columns', () => {
  const CONFLICT_EVENTS: CalendarEvent[] = [
    { id: 'a', title: 'Rapat A', start: dayDate(21, 9), end: dayDate(21, 10), category: 'primary' },
    { id: 'b', title: 'Rapat B', start: dayDate(21, 9), end: dayDate(21, 10), category: 'warning' },
  ];

  it('AC-02: dua event tumpang tampil berdampingan dengan indikator n bentrok', () => {
    const { container } = render(
      <EventCalendar events={CONFLICT_EVENTS} defaultDate={CONTEXT_DATE} defaultView="week" />
    );

    const a = container.querySelector<HTMLElement>('[data-event-id="a"]');
    const b = container.querySelector<HTMLElement>('[data-event-id="b"]');
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a?.style.width).toBe('calc(50% - 4px)');
    expect(b?.style.width).toBe('calc(50% - 4px)');
    expect(a?.style.left).not.toBe(b?.style.left);
    expect(container.querySelector('[data-conflict-count="2"]')).not.toBeNull();
    expect(screen.getAllByText('2 bentrok').length).toBeGreaterThan(0);
  });

  it('AC-02: kedua event bentrok tetap fokusable dan membuka detail masing-masing', () => {
    const onSelectEvent = vi.fn();
    render(
      <EventCalendar
        events={CONFLICT_EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        onSelectEvent={onSelectEvent}
      />
    );

    const first = screen.getByRole('button', { name: /Rapat A/ });
    const second = screen.getByRole('button', { name: /Rapat B/ });
    expect(first.tabIndex).toBe(0);
    expect(second.tabIndex).toBe(0);
    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.click(second);
    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    expect((onSelectEvent.mock.calls[0][0] as CalendarEvent).id).toBe('b');
  });
});

describe('EventCalendar event detail M-006', () => {
  afterEach(() => vi.restoreAllMocks());
  const DETAIL_EVENTS: CalendarEvent[] = [
    {
      id: 'review',
      title: 'Design Review',
      start: dayDate(21, 9),
      end: dayDate(21, 10),
      category: 'success',
      location: 'Ruang A',
      description: 'Review komponen calendar.',
    },
  ];

  it.each(['month', 'week', 'day', 'agenda'] as const)(
    'CR-013: %s opens anchored detail once and Escape restores the source button',
    async (defaultView) => {
      const onSelectEvent = vi.fn();
      const { container } = render(
        <EventCalendar events={DETAIL_EVENTS} defaultDate={CONTEXT_DATE} defaultView={defaultView} onSelectEvent={onSelectEvent} />
      );
      const chip = defaultView === 'agenda'
        ? screen.getByText('Design Review').closest('button')!
        : within(container).getByRole('button', { name: /Design Review/ });
      vi.spyOn(chip, 'getBoundingClientRect').mockReturnValue({
        x: 120, y: 160, top: 160, left: 120, right: 180, bottom: 184,
        width: 60, height: 24, toJSON: () => ({}),
      });
      chip.focus();
      fireEvent.click(chip);
      const detail = await screen.findByRole('dialog', { name: /Event detail: Design Review/ });
      expect(detail.getAttribute('data-side')).not.toBeNull();
      expect(onSelectEvent).toHaveBeenCalledExactlyOnceWith(DETAIL_EVENTS[0]);
      fireEvent.keyDown(detail, { key: 'Escape', code: 'Escape' });
      await waitFor(() => expect(document.activeElement).toBe(chip));
    }
  );

  it('CR-013: mobile keeps the sheet and returns focus on Escape', async () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      ...matchMedia(query), matches: true,
    }));
    render(<EventCalendar events={DETAIL_EVENTS} defaultDate={CONTEXT_DATE} defaultView="agenda" />);
    const chip = screen.getByText('Design Review').closest('button')!;
    fireEvent.click(chip);
    const detail = await screen.findByRole('dialog', { name: 'Event detail' });
    expect(detail.className).toContain('bottom-0');
    fireEvent.keyDown(detail, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(chip));
  });

  it('CR-013: overflow detail anchors to the mounted +n trigger, not the removed item', async () => {
    const onSelectEvent = vi.fn();
    render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} onSelectEvent={onSelectEvent} />);
    const trigger = screen.getByRole('button', { name: /more events on/ });
    const measure = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 120, y: 160, top: 160, left: 120, right: 180, bottom: 184,
      width: 60, height: 24, toJSON: () => ({}),
    });
    fireEvent.click(trigger);
    const item = screen.getByRole('button', { name: /Panel Talk/ });
    fireEvent.click(item);
    const detail = await screen.findByRole('dialog', { name: /Event detail: Panel Talk/ });
    expect(item.isConnected).toBe(false);
    expect(trigger.isConnected).toBe(true);
    expect(measure).toHaveBeenCalled();
    expect(detail.getAttribute('data-side')).not.toBeNull();
    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(detail.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(detail, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('CR-013: unmeasurable anchors use a centered dialog instead of an unanchored popover', async () => {
    const { container } = render(<EventCalendar events={DETAIL_EVENTS} defaultDate={CONTEXT_DATE} />);
    const chip = within(cellFor(container, '2026-11-21')!).getByRole('button', { name: /Design Review/ });
    vi.spyOn(chip, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0,
      width: 0, height: 0, toJSON: () => ({}),
    });
    fireEvent.click(chip);
    const detail = await screen.findByRole('dialog', { name: /Event detail: Design Review/ });
    expect(detail.getAttribute('data-side')).toBeNull();
    expect(detail.className).toContain('fixed');
    expect(document.querySelector('[data-radix-popper-content-wrapper]')).toBeNull();
    fireEvent.keyDown(detail, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(chip));
  });

  it('CR-013: detached agenda anchor falls back to a dialog and returns focus to the calendar', async () => {
    const { container, rerender } = render(
      <EventCalendar events={DETAIL_EVENTS} defaultDate={CONTEXT_DATE} defaultView="agenda" />
    );
    const chip = screen.getByText('Design Review').closest('button')!;
    vi.spyOn(chip, 'getBoundingClientRect').mockReturnValue({
      x: 120, y: 160, top: 160, left: 120, right: 180, bottom: 184,
      width: 60, height: 24, toJSON: () => ({}),
    });
    fireEvent.click(chip);
    const popover = await screen.findByRole('dialog', { name: /Event detail: Design Review/ });
    expect(popover.getAttribute('data-side')).not.toBeNull();
    rerender(<EventCalendar events={[]} defaultDate={CONTEXT_DATE} defaultView="agenda" />);
    await waitFor(() => {
      const detail = screen.getByRole('dialog', { name: /Event detail: Design Review/ });
      expect(detail.getAttribute('data-side')).toBeNull();
      expect(chip.isConnected).toBe(false);
    });
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(container.querySelector('section')));
  });

  it('AC-03: klik event memanggil onSelectEvent dan membuka detail lengkap', async () => {
    const onSelectEvent = vi.fn();
    const { container } = render(
      <EventCalendar
        events={DETAIL_EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="month"
        onSelectEvent={onSelectEvent}
      />
    );

    const cell = container.querySelector<HTMLElement>('[data-date="2026-11-21"]') as HTMLElement;
    const chip = within(cell).getByRole('button', { name: /Design Review/ });
    fireEvent.click(chip);

    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    const dialog = await screen.findByRole('dialog', { name: /Design Review/ });
    expect(within(dialog).getByText('Ruang A')).toBeDefined();
    expect(within(dialog).getByText('Review komponen calendar.')).toBeDefined();
    expect(within(dialog).getByText('Success')).toBeDefined();
    expect(within(dialog).getByText(/Sat 21 Nov 2026, 09:00–10:00/)).toBeDefined();
  });

  it('AC-03: aksi sekunder dipanggil dengan event yang benar dan Esc mengembalikan fokus', async () => {
    const onAction = vi.fn();
    const { container } = render(
      <EventCalendar
        events={DETAIL_EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="month"
        editable
        onAction={onAction}
      />
    );

    const cell = container.querySelector<HTMLElement>('[data-date="2026-11-21"]') as HTMLElement;
    const chip = within(cell).getByRole('button', { name: /Design Review/ });
    fireEvent.click(chip);

    const dialog = await screen.findByRole('dialog', { name: /Design Review/ });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Edit' }));
    expect(onAction).toHaveBeenCalledWith('edit', expect.objectContaining({ id: 'review' }));

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledWith('delete', expect.objectContaining({ id: 'review' }));

    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(chip));
  });

  it('AC-03: renderEventActions menampilkan aksi custom konsumen', async () => {
    const { container } = render(
      <EventCalendar
        events={DETAIL_EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="month"
        renderEventActions={(event) => (
          <button type="button">Custom action {event.id}</button>
        )}
      />
    );

    const cell = container.querySelector<HTMLElement>('[data-date="2026-11-21"]') as HTMLElement;
    fireEvent.click(within(cell).getByRole('button', { name: /Design Review/ }));

    const dialog = await screen.findByRole('dialog', { name: /Design Review/ });
    expect(within(dialog).getByRole('button', { name: 'Custom action review' })).toBeDefined();
  });
});

describe('EventCalendar drag and drop', () => {
  function cell(container: HTMLElement, date: string, minute: number): HTMLElement {
    return container.querySelector<HTMLElement>(
      `[data-date="${date}"][data-slot-minute="${minute}"]`
    ) as HTMLElement;
  }

  it('AC-04: drag menampilkan preview dan memanggil onEventDrop dengan rentang baru', async () => {
    const onEventDrop = vi.fn();
    const { container } = render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        editable
        onEventDrop={onEventDrop}
      />
    );

    const block = container.querySelector<HTMLElement>('[data-event-id="keynote"]') as HTMLElement;
    const target = cell(container, '2026-11-20', 600);

    fireEvent.pointerDown(block, { button: 0 });
    fireEvent.pointerMove(target);
    await waitFor(() => expect(target.querySelector('[data-drag-preview]')).not.toBeNull());

    fireEvent.pointerUp(target);
    expect(onEventDrop).toHaveBeenCalledTimes(1);
    const info = onEventDrop.mock.calls[0][0] as { id: string; start: Date; end: Date };
    expect(info.id).toBe('keynote');
    expect(info.start.getDate()).toBe(20);
    expect(info.start.getHours()).toBe(10);
    expect(info.end.getHours()).toBe(11);
  });

  it('AC-04: tanpa editable drag tidak aktif', () => {
    const onEventDrop = vi.fn();
    const { container } = render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        onEventDrop={onEventDrop}
      />
    );

    const block = container.querySelector<HTMLElement>('[data-event-id="keynote"]') as HTMLElement;
    const target = cell(container, '2026-11-20', 600);

    fireEvent.pointerDown(block, { button: 0 });
    fireEvent.pointerMove(target);
    fireEvent.pointerUp(target);
    expect(onEventDrop).not.toHaveBeenCalled();
    expect(target.querySelector('[data-drag-preview]')).toBeNull();
  });

  it('AC-04: menu Pindah… via keyboard menghasilkan onEventDrop yang sama', async () => {
    const onEventDrop = vi.fn();
    const { container } = render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        editable
        onEventDrop={onEventDrop}
      />
    );

    const block = container.querySelector<HTMLElement>('[data-event-id="keynote"]') as HTMLElement;
    fireEvent.click(block);

    const dialog = await screen.findByRole('dialog', { name: /Event detail: Keynote/ });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sun 22' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '10:00' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move to selected slot' }));

    expect(onEventDrop).toHaveBeenCalledTimes(1);
    const info = onEventDrop.mock.calls[0][0] as { id: string; start: Date; end: Date };
    expect(info.id).toBe('keynote');
    expect(info.start.getDate()).toBe(22);
    expect(info.start.getHours()).toBe(10);
    expect(info.end.getHours()).toBe(11);
  });
});

describe('EventCalendar locale', () => {
  const LOCALE_EVENTS: CalendarEvent[] = [
    { id: 'a', title: 'Meeting', start: dayDate(21, 9), end: dayDate(21, 10), category: 'info' },
  ];

  it('AC-03: locale en menampilkan nama hari dalam bahasa Inggris', () => {
    render(
      <EventCalendar
        events={LOCALE_EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        locale={en}
        weekStartsOn={1}
      />
    );
    // 21 Nov 2026 adalah Sabtu
    expect(screen.getByText('Sat 21')).toBeDefined();
  });

  it('AC-03: locale id menampilkan nama hari dalam bahasa Indonesia', () => {
    render(
      <EventCalendar
        events={LOCALE_EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="week"
        locale={id}
        weekStartsOn={1}
      />
    );
    expect(screen.getByText('Sab 21')).toBeDefined();
  });
});

describe('EventCalendar agenda', () => {
  it('AC-04: agenda menampilkan event kronologis grup per hari, baris panggil onSelectEvent', () => {
    const onSelectEvent = vi.fn();
    render(
      <EventCalendar
        events={EVENTS}
        defaultDate={CONTEXT_DATE}
        defaultView="agenda"
        onSelectEvent={onSelectEvent}
      />
    );

    expect(screen.getAllByText('Design Conference')).toHaveLength(3);
    expect(screen.getByText('Keynote')).toBeDefined();
    expect(screen.getByText('Thursday, 19 November 2026')).toBeDefined();
    expect(screen.getAllByRole('list')).toHaveLength(2);

    const keynoteTitle = screen.getByText('Keynote');
    const keynoteBtn = keynoteTitle.closest('button');
    expect(keynoteBtn).toBeInstanceOf(HTMLButtonElement);
    fireEvent.click(keynoteBtn!);
    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    expect((onSelectEvent.mock.calls[0][0] as CalendarEvent).id).toBe('keynote');
  });

  it('AC-04: agenda periode tanpa event menampilkan pesan kosong', () => {
    render(
      <EventCalendar
        events={[]}
        defaultDate={new Date(2026, 0, 15)}
        defaultView="agenda"
      />
    );
    expect(screen.getByText('Tidak ada event pada periode ini.')).toBeDefined();
  });
});

describe('EventCalendar state matrix', () => {
  it('AC-01: loading menampilkan skeleton grid dengan aria-busy', () => {
    render(
      <EventCalendar events={[]} defaultDate={CONTEXT_DATE} loading />
    );
    const grid = screen.getByRole('grid');
    expect(grid.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Memuat event…')).toBeDefined();
    expect(screen.getByLabelText('Previous period').getAttribute('disabled')).toBeDefined();
  });

  it('AC-01: error menampilkan alert role alert + pesan + tombol Coba lagi', () => {
    const onRetry = vi.fn();
    render(
      <EventCalendar
        events={[]}
        defaultDate={CONTEXT_DATE}
        error="Gagal memuat data"
        onRetry={onRetry}
      />
    );
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Gagal memuat event')).toBeDefined();
    expect(screen.getByText('Gagal memuat data')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('AC-01: error tanpa onRetry tidak menampilkan tombol Coba lagi', () => {
    render(
      <EventCalendar events={[]} defaultDate={CONTEXT_DATE} error="Gagal memuat data" />
    );
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Coba lagi' })).toBeNull();
  });

  it('AC-01: empty (periode tanpa event) menampilkan empty-state role status', () => {
    render(<EventCalendar events={[]} defaultDate={CONTEXT_DATE} />);
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Tidak ada event di periode ini')).toBeDefined();
  });

  it('AC-01: success dengan event menampilkan grid aktif, bukan state matrix', () => {
    render(<EventCalendar events={EVENTS} defaultDate={CONTEXT_DATE} defaultView="month" />);
    expect(screen.queryByText('Tidak ada event di periode ini')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('grid')).toBeDefined();
  });
});
