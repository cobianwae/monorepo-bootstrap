import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputOTP } from './input-otp';

describe('InputOTP component', () => {
  it('renders the correct number of digit inputs', () => {
    const { container } = render(<InputOTP length={6} />);
    expect(container.querySelectorAll('input')).toHaveLength(6);
  });

  it('renders provided value across digit boxes', () => {
    render(<InputOTP value="123" length={6} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('2');
    expect(inputs[2].value).toBe('3');
    expect(inputs[3].value).toBe('');
  });

  it('calls onChange with combined value when typing a digit', () => {
    const onChange = vi.fn();
    render(<InputOTP value="123" onChange={onChange} length={6} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[3], { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('calls onChange with combined value on paste', () => {
    const onChange = vi.fn();
    render(<InputOTP value="" onChange={onChange} length={6} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '654321' },
    });
    expect(onChange).toHaveBeenCalledWith('654321');
  });

  it('applies a11y aria-labels per digit', () => {
    render(<InputOTP label="2FA code" length={6} />);
    expect(screen.getByLabelText('2FA code digit 1 of 6')).toBeDefined();
    expect(screen.getByLabelText('2FA code digit 6 of 6')).toBeDefined();
  });
});