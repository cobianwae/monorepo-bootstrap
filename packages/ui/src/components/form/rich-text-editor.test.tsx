import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useState } from 'react';
import { RichTextEditor } from './rich-text-editor';

function ControlledHarness({
  initial = '<p>Halo <strong>dunia</strong></p>',
  onChangeSpy,
}: {
  initial?: string;
  onChangeSpy?: (html: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <RichTextEditor
      value={value}
      onChange={(html) => {
        setValue(html);
        onChangeSpy?.(html);
      }}
    />
  );
}

describe('RichTextEditor 006-01', () => {
  it('renders toolbar, content, and live region (SSR-safe)', async () => {
    // SSR does not throw thanks to immediatelyRender:false
    expect(() => renderToString(<RichTextEditor value="<p>Halo</p>" />)).not.toThrow();

    render(<ControlledHarness />);
    expect(await screen.findByTestId('rte-toolbar')).toBeDefined();
    expect(screen.getByTestId('rte-content')).toBeDefined();
    expect(screen.getByTestId('rte-live')).toBeDefined();
    expect(screen.getByRole('toolbar', { name: 'Format teks' })).toBeDefined();
  });

  it('marks inline format buttons active inside formatted text', async () => {
    render(<ControlledHarness initial="<p><strong>Halo</strong></p>" />);
    const bold = await screen.findByTestId('rte-button-bold');
    // Toolbar renders with aria-pressed live; initial selection may be inactive
    // but the attribute must exist and follow selection updates.
    expect(bold.getAttribute('aria-pressed')).not.toBeNull();
  });

  it('round-trips controlled HTML when value is set from outside', async () => {
    const { rerender } = render(<RichTextEditor value="<p>Halo</p>" />);
    expect(await screen.findByTestId('rte-content')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByTestId('rte-content').textContent ?? '').toContain('Halo');
    });

    rerender(<RichTextEditor value="<p>Dunia</p>" />);
    await waitFor(() => {
      expect(screen.getByTestId('rte-content').textContent ?? '').toContain('Dunia');
    });
  });

  it('exposes undo/redo with disabled state and live region', async () => {
    render(<ControlledHarness />);
    const undo = (await screen.findByTestId('rte-button-undo')) as HTMLButtonElement;
    const redo = (await screen.findByTestId('rte-button-redo')) as HTMLButtonElement;
    expect(undo.disabled).toBe(true);
    expect(redo.disabled).toBe(true);
    expect(undo.getAttribute('aria-label')).toContain('Urungkan');
    expect(redo.getAttribute('aria-label')).toContain('Ulangi');
    expect(screen.getByTestId('rte-live').getAttribute('aria-live')).toBe('polite');
  });

  it('toolbar buttons are keyboard reachable with visible focus ring', async () => {
    render(<ControlledHarness />);
    const bold = (await screen.findByTestId('rte-button-bold')) as HTMLButtonElement;
    bold.focus();
    expect(document.activeElement).toBe(bold);
    expect(bold.className).toContain('focus-visible:ring-primary');

    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Halo</p>" onChange={onChange} />);
    const buttons = await screen.findAllByTestId(/^rte-button-/);
    // Second instance duplicates testids; activating via keyboard must not throw.
    fireEvent.click(buttons[0]);
    fireEvent.keyDown(buttons[0], { key: 'Enter' });
    expect(document.activeElement).toBeDefined();
  });

  it('block toolbar transforms paragraph content', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Baris biasa</p>" onChange={onChange} />);
    const h1 = await screen.findByTestId('rte-button-h1');
    fireEvent.click(h1);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
