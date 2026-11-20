import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { addMonths } from 'date-fns';
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
