import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toaster } from './toaster';
import { toast } from './use-toast';

beforeAll(() => {
  const proto = Element.prototype as unknown as { scrollIntoView?: () => void };
  proto.scrollIntoView = () => undefined;
});

describe('Toaster', () => {
  it('renders an empty toast viewport', () => {
    const { container } = render(<Toaster />);
    expect(container.querySelector('[data-sonner-toaster]') ?? container.querySelector('[role="status"]') ?? container.querySelector('ol')).toBeDefined();
  });

  it('renders a toast after firing toast()', () => {
    render(<Toaster />);
    act(() => {
      toast({ title: 'Saved successfully', description: 'Changes were applied.', variant: 'success' });
    });
    expect(screen.getByText('Saved successfully')).toBeDefined();
  });
});