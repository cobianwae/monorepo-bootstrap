import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatePicker, DateRangePicker, isDateRangeComplete } from './date-picker';

describe('DatePicker component', () => {
  it('renders placeholder when no date selected', () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeDefined();
  });

  it('renders formatted selected date', () => {
    const date = new Date(2026, 7, 16);
    render(<DatePicker value={date} formatDate={(d) => `D:${d.toISOString().slice(0, 10)}`} />);
    expect(screen.getByText(`D:${date.toISOString().slice(0, 10)}`)).toBeDefined();
  });

  it('renders label', () => {
    render(<DatePicker label="Due date" />);
    expect(screen.getByText('Due date')).toBeDefined();
  });

  it('renders clear button when value present and clearable', () => {
    const date = new Date(2026, 7, 16);
    render(<DatePicker value={date} formatDate={(d) => d.toDateString()} />);
    expect(screen.getByLabelText('Clear date')).toBeDefined();
  });
});

describe('DateRangePicker component', () => {
  it('renders placeholder when no range selected', () => {
    render(<DateRangePicker placeholder="Pick a range" />);
    expect(screen.getByText('Pick a range')).toBeDefined();
  });

  it('renders range summary when both dates selected', () => {
    const from = new Date(2026, 0, 1);
    const to = new Date(2026, 0, 15);
    render(
      <DateRangePicker
        value={{ from, to }}
        formatDate={(d) => `${d.getDate()}/${d.getMonth() + 1}`}
      />
    );
    expect(screen.getByText('1/1 – 15/1')).toBeDefined();
  });
});

describe('isDateRangeComplete', () => {
  it('returns true when from and to are present', () => {
    expect(isDateRangeComplete({ from: new Date(), to: new Date() })).toBe(true);
  });

  it('returns false when range is incomplete', () => {
    expect(isDateRangeComplete({ from: new Date() })).toBe(false);
    expect(isDateRangeComplete(null)).toBe(false);
  });
});