import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './number-input';

describe('NumberInput component', () => {
  it('renders an input with aria-label', () => {
    render(<NumberInput aria-label="Quantity" />);
    expect(screen.getByLabelText('Quantity')).toBeDefined();
  });

  it('displays the current value', () => {
    render(<NumberInput value={5} aria-label="Quantity" />);
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).value).toBe('5');
  });

  it('increments when the increment button is clicked', () => {
    const onValueChange = vi.fn();
    render(<NumberInput value={5} onValueChange={onValueChange} aria-label="Quantity" />);
    fireEvent.click(screen.getByLabelText('Increment'));
    expect(onValueChange).toHaveBeenCalledWith(6);
  });

  it('decrements when the decrement button is clicked', () => {
    const onValueChange = vi.fn();
    render(<NumberInput value={5} onValueChange={onValueChange} aria-label="Quantity" />);
    fireEvent.click(screen.getByLabelText('Decrement'));
    expect(onValueChange).toHaveBeenCalledWith(4);
  });

  it('clamps increment to max', () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput value={9} max={10} onValueChange={onValueChange} aria-label="Quantity" />
    );
    fireEvent.click(screen.getByLabelText('Increment'));
    expect(onValueChange).toHaveBeenCalledWith(10);
  });

  it('steps with arrow keys', () => {
    const onValueChange = vi.fn();
    render(<NumberInput value={5} onValueChange={onValueChange} aria-label="Quantity" />);
    fireEvent.keyDown(screen.getByLabelText('Quantity'), { key: 'ArrowUp' });
    expect(onValueChange).toHaveBeenCalledWith(6);
  });
});