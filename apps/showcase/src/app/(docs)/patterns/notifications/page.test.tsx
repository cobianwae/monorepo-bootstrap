/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NotificationsPage from './page';

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('NotificationsPage — state dibaca tanpa warna', () => {
  it('setiap item menyatakan status Read/Unread sebagai teks', () => {
    render(<NotificationsPage />);
    expect(screen.getAllByText('Unread').length).toBeGreaterThan(0);
  });

  it('menekan item yang belum dibaca mengubah status teksnya', () => {
    render(<NotificationsPage />);
    const before = screen.getAllByText('Unread').length;
    const item = screen.getAllByRole('button').find((b) => b.textContent?.includes('Unread'));
    expect(item).toBeTruthy();
    if (item) fireEvent.click(item);
    expect(screen.getAllByText('Unread').length).toBe(before - 1);
  });
});
