import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimePicker, parseTimeValue } from './time-picker';

describe('TimePicker component', () => {
  it('renders placeholder when no value', () => {
    render(<TimePicker placeholder="HH:MM" />);
    expect(screen.getByText('HH:MM')).toBeDefined();
  });

  it('displays hours and minutes segments', () => {
    render(<TimePicker value="14:30" />);
    expect(screen.getByLabelText('Hours').textContent).toContain('14');
    expect(screen.getByLabelText('Minutes').textContent).toContain('30');
  });

  it('emits padded value when hours incremented', () => {
    const onValueChange = vi.fn();
    render(<TimePicker value="14:30" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByLabelText('Hours up'));
    expect(onValueChange).toHaveBeenCalledWith('15:30');
  });

  it('does not wrap hours beyond 23', () => {
    const onValueChange = vi.fn();
    render(<TimePicker value="23:00" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByLabelText('Hours up'));
    expect(onValueChange).toHaveBeenCalledWith('23:00');
  });
});

describe('parseTimeValue', () => {
  it('parses HH:MM string', () => {
    expect(parseTimeValue('09:45')).toEqual({ hours: 9, minutes: 45 });
  });

  it('parses HH:MM:SS string', () => {
    expect(parseTimeValue('09:45:30')).toEqual({ hours: 9, minutes: 45, seconds: 30 });
  });

  it('returns null for invalid input', () => {
    expect(parseTimeValue('')).toBeNull();
    expect(parseTimeValue('abc')).toBeNull();
    expect(parseTimeValue(null)).toBeNull();
  });
});