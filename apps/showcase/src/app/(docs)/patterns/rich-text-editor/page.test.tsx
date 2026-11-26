/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RichTextEditorPage from './page';

describe('RichTextEditorPage CR-060', () => {
  it('synchronizes initial words, reset and reloaded example; provides local image fallback', async () => {
    const { container } = render(<RichTextEditorPage />);
    await waitFor(() => expect(screen.getByText('47 words')).toBeTruthy());
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/examples/rich-text-document.svg');
    expect(image?.getAttribute('alt')).toContain('Document');
    fireEvent.error(image!);
    expect(screen.getByText(/The example image is unavailable/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reset demo' }));
    await waitFor(() => expect(screen.getByText('0 words')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Load example' }));
    await waitFor(() => expect(screen.getByText('47 words')).toBeTruthy());
    expect(screen.queryByText(/The example image is unavailable/)).toBeNull();
  });
});
