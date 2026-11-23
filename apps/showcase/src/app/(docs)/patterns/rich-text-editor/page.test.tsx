/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RichTextEditorPage from './page';

describe('RichTextEditorPage CR-060', () => {
  it('synchronizes initial words, reset and reloaded example; provides local image fallback', async () => {
    const { container } = render(<RichTextEditorPage />);
    await waitFor(() => expect(screen.getByText('44 kata')).toBeTruthy());
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/examples/rich-text-document.svg');
    expect(image?.getAttribute('alt')).toContain('dokumen');
    fireEvent.error(image!);
    expect(screen.getByText(/Gambar contoh tidak tersedia/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Atur ulang demo' }));
    await waitFor(() => expect(screen.getByText('0 kata')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Muat contoh' }));
    await waitFor(() => expect(screen.getByText('44 kata')).toBeTruthy());
    expect(screen.queryByText(/Gambar contoh tidak tersedia/)).toBeNull();
  });
});
