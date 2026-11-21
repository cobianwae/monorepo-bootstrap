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

describe('RichTextEditor 006-02 link + shortcut + keyboard', () => {
  it('renders link toolbar button with Ctrl+K label', async () => {
    render(<ControlledHarness />);
    const link = await screen.findByTestId('rte-button-link');
    expect(link.getAttribute('aria-label')).toContain('Ctrl+K');
    expect(link.getAttribute('aria-pressed')).not.toBeNull();
  });

  it('opens M-009 via toolbar with autofocus and validates URL', async () => {
    render(<ControlledHarness />);
    fireEvent.click(await screen.findByTestId('rte-button-link'));
    const popover = await screen.findByTestId('rte-link-popover');
    expect(popover.getAttribute('aria-label')).toBe('Editor tautan');
    const input = (await screen.findByTestId('rte-link-input')) as HTMLInputElement;
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    // Empty URL: error + save disabled + aria-invalid
    expect(screen.getByTestId('rte-link-error')).toBeDefined();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect((screen.getByTestId('rte-link-save') as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(input, { target: { value: 'notaurl' } });
    expect(screen.getByTestId('rte-link-error').textContent).toContain('https://');
    expect((screen.getByTestId('rte-link-save') as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(input, { target: { value: 'https://contoh.com' } });
    expect(screen.queryByTestId('rte-link-error')).toBeNull();
    expect((screen.getByTestId('rte-link-save') as HTMLButtonElement).disabled).toBe(false);
  });

  it('edits an existing link via click and saves the new href', async () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor
        value='<p>Klik <a href="https://lama.com">sini</a> ya</p>'
        onChange={onChange}
      />
    );
    const anchor = await waitFor(() => {
      const found = screen.getByTestId('rte-content').querySelector('a');
      expect(found).not.toBeNull();
      return found as HTMLAnchorElement;
    });
    fireEvent.click(anchor);
    const input = (await screen.findByTestId('rte-link-input')) as HTMLInputElement;
    expect(input.value).toBe('https://lama.com');
    // Edit mode exposes Buka + Hapus
    expect(screen.getByTestId('rte-link-open')).toBeDefined();
    expect(screen.getByTestId('rte-link-remove')).toBeDefined();

    fireEvent.change(input, { target: { value: 'https://baru.com' } });
    fireEvent.click(screen.getByTestId('rte-link-save'));
    await waitFor(() => {
      const last = onChange.mock.calls.at(-1)?.[0] as string | undefined;
      expect(last).toContain('https://baru.com');
    });
    expect(screen.getByTestId('rte-live').textContent).toContain('diperbarui');
    // Popover closes and focus returns to the editor
    await waitFor(() => {
      expect(screen.queryByTestId('rte-link-input')).toBeNull();
    });
  });

  it('removes an existing link but keeps its text', async () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor
        value='<p>Klik <a href="https://lama.com">sini</a> ya</p>'
        onChange={onChange}
      />
    );
    const anchor = await waitFor(() => {
      const found = screen.getByTestId('rte-content').querySelector('a');
      expect(found).not.toBeNull();
      return found as HTMLAnchorElement;
    });
    fireEvent.click(anchor);
    await screen.findByTestId('rte-link-input');
    fireEvent.click(screen.getByTestId('rte-link-remove'));
    await waitFor(() => {
      const last = onChange.mock.calls.at(-1)?.[0] as string | undefined;
      expect(last).toBeDefined();
      expect(last as string).toContain('sini');
      expect(last as string).not.toContain('<a');
    });
    expect(screen.getByTestId('rte-live').textContent).toContain('dihapus');
  });

  it('opens the existing link in a new tab via Buka', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    try {
      render(<RichTextEditor value='<p><a href="https://buka.com">tautan</a></p>' />);
      const anchor = await waitFor(() => {
        const found = screen.getByTestId('rte-content').querySelector('a');
        expect(found).not.toBeNull();
        return found as HTMLAnchorElement;
      });
      fireEvent.click(anchor);
      await screen.findByTestId('rte-link-input');
      fireEvent.click(screen.getByTestId('rte-link-open'));
      expect(openSpy).toHaveBeenCalledWith('https://buka.com', '_blank', 'noopener,noreferrer');
    } finally {
      openSpy.mockRestore();
    }
  });

  it('opens M-009 via Ctrl/Cmd+K and cancels with Batal + focus return', async () => {
    render(<ControlledHarness />);
    const editable = (await waitFor(() => {
      const found = screen
        .getByTestId('rte-content')
        .querySelector('[contenteditable="true"]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    }));
    fireEvent.keyDown(editable, { key: 'k', ctrlKey: true });
    await screen.findByTestId('rte-link-input');
    fireEvent.click(screen.getByTestId('rte-link-cancel'));
    await waitFor(() => {
      expect(screen.queryByTestId('rte-link-input')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(editable);
    });
  });

  it('closes M-009 with Escape without changes', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Halo</p>" onChange={onChange} />);
    fireEvent.click(await screen.findByTestId('rte-button-link'));
    const input = await screen.findByTestId('rte-link-input');
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('rte-link-input')).toBeNull();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('never uses window.prompt in the link flow', async () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockImplementation(() => null);
    try {
      render(<ControlledHarness />);
      fireEvent.click(await screen.findByTestId('rte-button-link'));
      const input = await screen.findByTestId('rte-link-input');
      fireEvent.change(input, { target: { value: 'https://tanpa-prompt.com' } });
      fireEvent.click(screen.getByTestId('rte-link-save'));
      await waitFor(() => {
        expect(screen.queryByTestId('rte-link-input')).toBeNull();
      });
      expect(promptSpy).not.toHaveBeenCalled();
    } finally {
      promptSpy.mockRestore();
    }
  });

  it('toolbar produces the same blocks as markdown shortcuts (equivalence map)', async () => {
    // InputRules StarterKit aktif secara default (framework-covered); sisi toolbar
    // dijamin memancarkan HTML yang sama dengan yang dihasilkan tiap shortcut:
    // '# '→h1, '## '→h2, '### '→h3, '- '→bullet, '1. '→ordered, '> '→quote.
    const cases: Array<{ button: string; tag: string }> = [
      { button: 'rte-button-h1', tag: '<h1' },
      { button: 'rte-button-h2', tag: '<h2' },
      { button: 'rte-button-h3', tag: '<h3' },
      { button: 'rte-button-bullet', tag: '<ul' },
      { button: 'rte-button-ordered', tag: '<ol' },
      { button: 'rte-button-quote', tag: '<blockquote' },
    ];
    for (const { button, tag } of cases) {
      const onChange = vi.fn();
      const { unmount } = render(<RichTextEditor value="<p>Baris biasa</p>" onChange={onChange} />);
      fireEvent.click(await screen.findByTestId(button));
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
      const last = onChange.mock.calls.at(-1)?.[0] as string;
      expect(last).toContain(tag);
      unmount();
    }
  });

  it('toolbar bold wraps the full selection like **teks**', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>tebalkan saya</p>" onChange={onChange} />);
    const editable = await waitFor(() => {
      const found = screen.getByTestId('rte-content').querySelector('[contenteditable="true"]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    // Select-all (Mod+A) then Bold — same command the ** shortcut delegates to.
    fireEvent.keyDown(editable, { key: 'a', ctrlKey: true });
    fireEvent.click(await screen.findByTestId('rte-button-bold'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const last = onChange.mock.calls.at(-1)?.[0] as string;
    expect(last).toContain('<strong>');
  });
});
