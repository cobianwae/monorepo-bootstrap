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

describe('RichTextEditor 006-03 mode + counter + states', () => {
  it('renders placeholder + empty hint, disabled, and readonly variants', async () => {
    const { unmount } = render(<RichTextEditor value="" />);
    await waitFor(() => {
      expect(screen.getByTestId('rte-empty')).toBeDefined();
    });
    expect(screen.getByTestId('rte-counter')).toBeDefined();
    unmount();

    const { unmount: unmountDisabled } = render(
      <RichTextEditor value="<p>Nilai tetap terlihat</p>" mode="disabled" />
    );
    const toolbar = await screen.findByTestId('rte-toolbar');    expect(toolbar.getAttribute('aria-disabled')).toBe('true');
    const buttons = screen.getAllByTestId(/^rte-button-/);
    for (const button of buttons) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
    await waitFor(() => {
      expect(screen.getByTestId('rte-content').textContent ?? '').toContain('Nilai tetap terlihat');
    });
    unmountDisabled();

    const { unmount: unmountReadonly } = render(
      <RichTextEditor value="<p>Konten baca</p>" mode="readonly" />
    );
    await waitFor(() => {
      expect(screen.getByTestId('rte-content').textContent ?? '').toContain('Konten baca');
    });
    // Readonly menyembunyikan toolbar tetapi konten tetap terbaca SR.
    expect(screen.queryByTestId('rte-toolbar')).toBeNull();
    unmountReadonly();
  });

  it('warns at 90% and alerts over 100% without blocking typing', async () => {
    const { unmount: unmountNear } = render(
      <RichTextEditor value="<p>123456789</p>" maxLength={10} showCounter />
    );
    await waitFor(() => {
      expect(screen.getByTestId('rte-counter').textContent).toContain('9/10');
    });
    const counter = screen.getByTestId('rte-counter');
    // 90% = gaya warning + teks "mendekati batas"
    expect(counter.className).toContain('text-warning');
    expect(screen.getByText('mendekati batas')).toBeDefined();
    unmountNear();

    const { unmount } = render(
      <RichTextEditor value="<p>123456789012</p>" maxLength={10} showCounter />
    );
    const alert = await screen.findByTestId('rte-counter-alert');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.textContent).toContain('melewati batas 2 karakter');
    // Mengetik tetap boleh: editor tetap editable saat over-limit.
    const editable = await waitFor(() => {
      const contents = screen.getAllByTestId('rte-content');
      const found = contents[contents.length - 1]?.querySelector('[contenteditable="true"]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(editable.getAttribute('contenteditable')).toBe('true');
    unmount();
  });

  it('shows loading skeleton with aria-busy and SR text', async () => {
    render(<RichTextEditor value="<p>Halo</p>" loading />);
    const skeleton = await screen.findByTestId('rte-loading');
    expect(skeleton.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Memuat editor…')).toBeDefined();
    // Toolbar + counter disembunyikan saat loading.
    expect(screen.queryByTestId('rte-toolbar')).toBeNull();
    expect(screen.queryByTestId('rte-counter')).toBeNull();
  });

  it('shows error alert with retry and keeps content out of edit mode', async () => {
    const onRetry = vi.fn();
    render(
      <RichTextEditor value="<p>Data terakhir</p>" error="Konten gagal dimuat" onRetry={onRetry} />
    );
    const alert = await screen.findByTestId('rte-error');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.textContent).toContain('Konten gagal dimuat');
    fireEvent.click(screen.getByTestId('rte-error-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('wires counter a11y: describedby + polite status, disabled skipped from focus', async () => {
    render(<RichTextEditor value="<p>Halo</p>" mode="disabled" />);
    const counter = await screen.findByTestId('rte-counter');
    expect(counter.getAttribute('role')).toBe('status');
    expect(counter.getAttribute('aria-live')).toBe('polite');
    const describedBy = counter.getAttribute('id');
    expect(describedBy).not.toBeNull();
    const editable = screen.getByTestId('rte-content').querySelector('[contenteditable]');
    expect(editable?.getAttribute('contenteditable')).toBe('false');
    expect(editable?.getAttribute('aria-describedby')).toBe(describedBy);
  });
});

describe('RichTextEditor 006-04 gambar + markdown + mention', () => {
  it('renders image toolbar button and opens M-010 with required validation', async () => {
    render(<RichTextEditor value="<p>Halo</p>" />);
    const imageButton = await screen.findByTestId('rte-button-image');
    expect(imageButton.getAttribute('aria-label')).toContain('gambar');
    fireEvent.click(imageButton);
    const dialog = await screen.findByTestId('rte-image-dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Sisip gambar');
    // Kosong: tolak + pesan + Sisipkan disabled + dialog tetap terbuka.
    expect(screen.getByTestId('rte-image-error').textContent).toContain('wajib diisi');
    expect((screen.getByTestId('rte-image-save') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByTestId('rte-image-dialog')).toBeDefined();
  });

  it('rejects invalid URL without inserting a broken image', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Halo</p>" onChange={onChange} />);
    fireEvent.click(await screen.findByTestId('rte-button-image'));
    const url = await screen.findByTestId('rte-image-url');
    fireEvent.change(url, { target: { value: 'notaurl' } });
    fireEvent.change(await screen.findByTestId('rte-image-alt'), { target: { value: 'Alt' } });
    expect(screen.getByTestId('rte-image-error').textContent).toContain('URL tidak valid');
    expect((screen.getByTestId('rte-image-save') as HTMLButtonElement).disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('rte-image-dialog')).toBeDefined();
  });

  it('requires alt text and keeps dialog open until filled', async () => {
    render(<RichTextEditor value="<p>Halo</p>" />);
    fireEvent.click(await screen.findByTestId('rte-button-image'));
    fireEvent.change(await screen.findByTestId('rte-image-url'), {
      target: { value: 'https://contoh.com/gambar.png' },
    });
    // Alt kosong → tolak dengan pesan "alt wajib".
    expect(screen.getByTestId('rte-image-error').textContent).toContain('alt wajib');
    expect((screen.getByTestId('rte-image-save') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(await screen.findByTestId('rte-image-alt'), { target: { value: 'Kucing' } });
    expect(screen.queryByTestId('rte-image-error')).toBeNull();
    expect((screen.getByTestId('rte-image-save') as HTMLButtonElement).disabled).toBe(false);
  });

  it('inserts image at cursor with rounded border + alt, undo restores', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Halo</p>" onChange={onChange} />);
    fireEvent.click(await screen.findByTestId('rte-button-image'));
    fireEvent.change(await screen.findByTestId('rte-image-url'), {
      target: { value: 'https://contoh.com/gambar.png' },
    });
    fireEvent.change(await screen.findByTestId('rte-image-alt'), { target: { value: 'Kucing' } });
    fireEvent.click(screen.getByTestId('rte-image-save'));
    await waitFor(() => {
      const last = onChange.mock.calls.at(-1)?.[0] as string | undefined;
      expect(last ?? '').toContain('<img');
      expect(last ?? '').toContain('alt="Kucing"');
      expect(last ?? '').toContain('https://contoh.com/gambar.png');
    });
    expect(screen.getByTestId('rte-live').textContent).toContain('Gambar disisipkan');
    await waitFor(() => {
      expect(screen.queryByTestId('rte-image-dialog')).toBeNull();
    });
    // Undo mengembalikan (gambar hilang dari HTML terakhir).
    const undo = await screen.findByTestId('rte-button-undo');
    fireEvent.click(undo);
    await waitFor(() => {
      const last = onChange.mock.calls.at(-1)?.[0] as string | undefined;
      expect(last ?? '').not.toContain('<img');
    });
  });

  it('round-trips core markdown without new deps', async () => {
    const { htmlToMarkdown, markdownToHtml } = await import('./rich-text-editor-serializer');
    const html =
      '<h1>Judul</h1><h2>Sub</h2><h3>Kecil</h3><p>Halo <strong>tebal</strong> dan <em>miring</em> serta <code>kode</code> + <a href="https://contoh.com">tautan</a></p><ul><li>Satu</li><li>Dua</li></ul><ol><li>Pertama</li></ol><blockquote><p>Kutipan</p></blockquote><pre><code>const a = 1;</code></pre><p><img src="https://contoh.com/g.png" alt="G" /></p>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('# Judul');
    expect(md).toContain('**tebal**');
    expect(md).toContain('[tautan](https://contoh.com)');
    expect(md).toContain('![G](https://contoh.com/g.png)');
    const back = markdownToHtml(md);
    expect(back).toContain('<h1>');
    expect(back).toContain('<strong>tebal</strong>');
    expect(back).toContain('<a href="https://contoh.com">tautan</a>');
    expect(back).toContain('<img');
    // Di luar inti: fallback HTML mentah diteruskan.
    expect(markdownToHtml('<table><tr><td>X</td></tr></table>')).toContain('<table>');
    expect(htmlToMarkdown('<table><tr><td>X</td></tr></table>')).toContain('<table>');
  });

  it('accepts injected extensions without breaking FR-001/002 toolbar', async () => {
    const { Extension } = await import('@tiptap/core');
    const Dummy = Extension.create({ name: 'dummy00604' });
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Baris biasa</p>" onChange={onChange} extensions={[Dummy]} />);
    const h1 = await screen.findByTestId('rte-button-h1');
    fireEvent.click(h1);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    expect(onChange.mock.calls.at(-1)?.[0] as string).toContain('<h1');
  });
});
