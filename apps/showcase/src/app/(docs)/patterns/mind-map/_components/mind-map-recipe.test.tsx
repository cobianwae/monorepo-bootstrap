/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MindMapRecipe } from './mind-map-recipe';

afterEach(() => {
  vi.useRealTimers();
});

describe('MindMapRecipe (CR-027)', () => {
  it('mereset umpan balik setelah dua detik dan mempertahankan live region', async () => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { unmount } = render(<MindMapRecipe />);
    const status = screen.getByRole('status');
    const button = screen.getByRole('button', { name: 'Copy recipe' });
    expect(status.className).toBe('sr-only');
    await act(async () => fireEvent.click(button));
    expect(status.textContent).toBe('Recipe copied');
    expect(button.querySelector('.lucide-check')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1500));
    await act(async () => fireEvent.click(button));
    act(() => vi.advanceTimersByTime(1500));
    expect(status.textContent).toBe('Recipe copied');
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole('status')).toBe(status);
    expect(status.textContent).toBe('');
    expect(status.className).toBe('sr-only');
    expect(button.querySelector('.lucide-copy')).not.toBeNull();
    await act(async () => fireEvent.click(button));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mempertahankan pesan gagal salin agar pengguna bisa memilih teks manual', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    render(<MindMapRecipe />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy recipe' }));
    expect(await screen.findByText('Could not copy. Select the recipe text manually.')).toBeTruthy();
    expect(screen.getByRole('status').className).not.toBe('sr-only');
  });
});
