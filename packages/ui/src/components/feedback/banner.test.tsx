import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Banner } from './banner';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Banner', () => {
  it('wraps long content and action labels instead of truncating or hiding controls', () => {
    const message = 'Pengumuman sangat panjang '.repeat(20);
    const action = 'TujuanTanpaSpasi'.repeat(20);
    render(<Banner actionText={action} actionHref="/updates">{message}</Banner>);
    const text = screen.getByText(message.trim());
    expect(text.className).toContain('[overflow-wrap:anywhere]');
    expect(text.className).not.toContain('truncate');
    expect(text.parentElement?.className).toContain('flex-wrap');
    expect(text.parentElement?.parentElement?.className).toContain('min-w-0');
    const link = screen.getByRole('link', { name: action });
    expect(link.getAttribute('href')).toBe('/updates');
    expect(link.className).toContain('max-w-full');
    expect(link.className).not.toContain('shrink-0');
    const dismiss = screen.getByRole('button', { name: 'Dismiss banner' });
    expect(dismiss.className).toContain('shrink-0');
    expect(dismiss.className).toContain('h-11 w-11');
    expect(dismiss.className).toContain('focus-visible:ring-2');
    expect(link.className).toContain('focus-visible:ring-2');
  });

  it('preserves custom icons, rich content and caller attributes', () => {
    const Icon = () => <svg data-testid="custom-icon" />;
    const ref = { current: null };
    render(
      <Banner ref={ref} icon={Icon} dismissible={false} className="rounded-lg" aria-label="Release">
        <strong>Release:</strong> Ready
      </Banner>
    );
    const region = screen.getByRole('region', { name: 'Release' });
    expect(ref.current).toBe(region);
    expect(region.className).toContain('rounded-lg');
    expect(screen.getByTestId('custom-icon')).toBeDefined();
    expect(screen.getByText('Release:').tagName).toBe('STRONG');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('supports a caller icon that renders nothing', () => {
    render(<Banner icon={() => null} actionHref="/updates">No icon</Banner>);
    expect(screen.getByRole('link', { name: 'Learn more' }).getAttribute('href')).toBe('/updates');
    expect(screen.getByText('No icon')).toBeDefined();
  });

  it('preserves action callbacks', () => {
    const onActionClick = vi.fn();
    render(<Banner actionText="Run" onActionClick={onActionClick}>Action</Banner>);
    fireEvent.click(screen.getByText('Run'));
    expect(onActionClick).toHaveBeenCalledOnce();
  });

  it('dismisses once and persists dismissal across mounts', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(<Banner storageKey="release" onDismiss={onDismiss}>Release</Banner>);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(screen.queryByRole('region')).toBeNull();
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(localStorage.getItem('banner-dismissed-release')).toBe('true');
    unmount();
    render(<Banner storageKey="release">Release</Banner>);
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('does not persist dismissal without a storage key', () => {
    const { unmount } = render(<Banner>Temporary</Banner>);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(localStorage.length).toBe(0);
    unmount();
    render(<Banner>Temporary</Banner>);
    expect(screen.getByRole('region')).toBeDefined();
  });
});
