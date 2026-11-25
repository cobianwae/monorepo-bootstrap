/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import * as UI from '@ds/ui';
import MediaGalleryPage from './page';

vi.mock('@ds/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof UI>();
  return {
    ...actual,
    Lightbox: ({
      items,
      openIndex,
      loading,
      error,
    }: {
      items: Array<{ id: string; type?: string }>;
      openIndex: number | null;
      loading?: boolean;
      error?: string | null;
    }) =>
      openIndex === null ? null : (
        <div data-testid="lightbox-stub">
          <span>{`${openIndex + 1} / ${items.length}`}</span>
          <span>{items[openIndex]?.type ?? 'image'}</span>
          {loading ? <span>Loading media</span> : null}
          {error ? <span>{error}</span> : null}
        </div>
      ),
  };
});

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

function renderPage() {
  return render(
    <UI.ThemeProvider>
      <MediaGalleryPage />
    </UI.ThemeProvider>,
  );
}

describe('MediaGalleryPage (016-03)', () => {
  it('grid utama 12 gambar dan klik thumbnail ke-3 membuka counter 3 / 12', async () => {
    renderPage();
    expect(await screen.findByText('12 of 12 files match')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open onboarding-flow.png in lightbox' }));

    expect(screen.getByTestId('lightbox-stub').textContent).toContain('3 / 12');
  });

  it('panel demo membuka video, error item rusak, dan empty mengosongkan grid', async () => {
    renderPage();
    expect(await screen.findByText('12 of 12 files match')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Video (item 13)' }));
    expect(screen.getByTestId('lightbox-stub').textContent).toContain('13 / 14');
    expect(screen.getByTestId('lightbox-stub').textContent).toContain('video');

    fireEvent.click(screen.getByRole('button', { name: 'Error (broken item)' }));
    expect(screen.getByTestId('lightbox-stub').textContent).toContain('14 / 14');
    expect(screen.getByText(/could not be loaded \(404\)/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Empty (filter to none)' }));
    expect(await screen.findByText('No files found')).toBeTruthy();
  });

  it('resep controlled 15 baris tampil di panel demo', async () => {
    const { container } = renderPage();
    expect(await screen.findByText('12 of 12 files match')).toBeTruthy();
    expect(screen.getByText('media-gallery.tsx')).toBeTruthy();
    expect(container.textContent).toContain('onOpenChange');
  });
});
