import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { FileManager, type FileFolder, type FileItem } from './file-manager';

const folders: FileFolder[] = [
  { id: 'root', name: 'Dokumen', parentId: null },
  { id: '2026', name: '2026', parentId: 'root' },
  { id: 'q4', name: 'Q4', parentId: '2026' },
  { id: 'arsip', name: 'Arsip', parentId: null },
];

const items: FileItem[] = [
  {
    id: 'f1',
    folderId: 'q4',
    name: 'laporan.pdf',
    type: 'pdf',
    size: 1024,
    updatedAt: '2026-11-01T00:00:00Z',
  },
];

const contentItems: FileItem[] = [
  { id: 'f1', folderId: 'q4', name: 'a.pdf', type: 'pdf', size: 1024, updatedAt: '2026-11-01T00:00:00Z' },
  { id: 'f2', folderId: 'q4', name: 'b.jpg', type: 'image', size: 4096, updatedAt: '2026-11-03T00:00:00Z' },
  { id: 'f3', folderId: 'q4', name: 'c.mp4', type: 'video', size: 8192, updatedAt: '2026-11-02T00:00:00Z' },
];

function StatefulHarness({ onChange }: { onChange: (id: string) => void }) {
  const [activeId, setActiveId] = React.useState('root');
  return (
    <FileManager
      folders={folders}
      items={items}
      activeFolderId={activeId}
      onActiveFolderChange={(id) => {
        setActiveId(id);
        onChange(id);
      }}
    />
  );
}

describe('FileManager shell', () => {
  it('renders three zones', () => {
    render(<FileManager folders={folders} items={items} activeFolderId="root" />);
    expect(screen.getByLabelText('Sidebar folder')).toBeDefined();
    expect(screen.getByLabelText('Konten folder')).toBeDefined();
    expect(screen.getByLabelText('Panel konteks')).toBeDefined();
    expect(screen.getByLabelText('Breadcrumb')).toBeDefined();
  });

  it('syncs tree click to breadcrumb and calls onActiveFolderChange once', () => {
    const onChange = vi.fn();
    render(<StatefulHarness onChange={onChange} />);
    const tree = screen.getByRole('tree');
    fireEvent.click(within(tree).getByText('Dokumen')); // expand root
    onChange.mockClear();
    fireEvent.click(within(tree).getByText('2026'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('2026');
    // Breadcrumb now mirrors the active path: Dokumen is a button segment, 2026 is the page
    expect(screen.getByRole('button', { name: 'Dokumen' })).toBeDefined();
    expect(screen.getByRole('link', { name: '2026' })).toBeDefined();
  });

  it('syncs breadcrumb click back to tree highlight and handler', () => {
    const onChange = vi.fn();
    render(<StatefulHarness onChange={onChange} />);
    const tree = screen.getByRole('tree');
    fireEvent.click(within(tree).getByText('Dokumen'));
    fireEvent.click(within(tree).getByText('2026'));
    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Dokumen' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('root');
  });

  it('shows sidebar loading skeleton with aria-busy', () => {
    const { container } = render(
      <FileManager folders={folders} items={items} activeFolderId="root" loading />
    );
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getByText('Memuat folder…')).toBeDefined();
  });

  it('shows sidebar error with retry', () => {
    const onRetry = vi.fn();
    render(
      <FileManager
        folders={folders}
        items={items}
        activeFolderId="root"
        error="Gagal memuat folder"
        onRetry={onRetry}
      />
    );
    // Error tampil di sidebar dan zona konten (002-02).
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Coba lagi' })[0]);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows empty sidebar with Folder baru CTA', () => {
    render(<FileManager folders={[]} items={[]} activeFolderId="" />);
    expect(screen.getAllByRole('button', { name: 'Folder baru' }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders content list with sortable columns and selection checkboxes', () => {
    render(<FileManager folders={folders} items={contentItems} activeFolderId="q4" />);
    expect(screen.getByRole('columnheader', { name: /nama/i })).toBeDefined();
    expect(screen.getByRole('columnheader', { name: /ukuran/i })).toBeDefined();
    expect(screen.getByRole('columnheader', { name: /tanggal/i })).toBeDefined();
    expect(screen.getByLabelText('Pilih a.pdf')).toBeDefined();
  });

  it('toggles list to grid without resetting selection', () => {
    const onSelectionChange = vi.fn();
    render(
      <FileManager
        folders={folders}
        items={contentItems}
        activeFolderId="q4"
        onSelectionChange={onSelectionChange}
      />
    );
    fireEvent.click(screen.getByLabelText('Pilih a.pdf'));
    expect(onSelectionChange).toHaveBeenCalledWith(['f1']);
    fireEvent.click(screen.getByRole('button', { name: 'Tampilan grid' }));
    expect(screen.getByRole('listbox', { name: /konten folder/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /a\.pdf/i })).toBeDefined();
    // Seleksi tetap: aria-selected pada opsi grid + bulk bar tampil.
    expect(screen.getAllByText('1 item dipilih').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: 'Tampilan list' }));
    expect(screen.getByLabelText('Pilih a.pdf')).toBeDefined();
  });

  it('shows bulk action bar with handlers receiving all selected items', () => {
    const onDownload = vi.fn();
    const onDelete = vi.fn();
    render(
      <FileManager
        folders={folders}
        items={contentItems}
        activeFolderId="q4"
        selectedIds={['f1', 'f2']}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    );
    expect(screen.getAllByText('2 item dipilih').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: /unduh/i }));
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onDownload.mock.calls[0][0].map((i: FileItem) => i.id)).toEqual(['f1', 'f2']);
    fireEvent.click(screen.getByRole('button', { name: /hapus/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete.mock.calls[0][0]).toHaveLength(2);
  });

  it('opens context menu via right-click and calls the same handlers', () => {
    const onPreview = vi.fn();
    const onDownload = vi.fn();
    render(
      <FileManager
        folders={folders}
        items={contentItems}
        activeFolderId="q4"
        onPreview={onPreview}
        onDownload={onDownload}
      />
    );
    fireEvent.contextMenu(screen.getByText('a.pdf'));
    expect(screen.getByRole('menuitem', { name: /buka \/ pratinjau/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /unduh/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /ganti nama/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /pindah/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /hapus/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /detail/i })).toBeDefined();
    fireEvent.click(screen.getByRole('menuitem', { name: /buka \/ pratinjau/i }));
    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onPreview.mock.calls[0][0].id).toBe('f1');
  });

  it('opens context menu via keyboard (Shift+F10) on a focused row', () => {
    render(<FileManager folders={folders} items={contentItems} activeFolderId="q4" />);
    const row = screen.getByText('b.jpg').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.keyDown(row as Element, { key: 'F10', shiftKey: true });
    expect(screen.getByRole('menuitem', { name: /detail/i })).toBeDefined();
  });

  it('sorts by column and filters by file type without refetching', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<FileManager folders={folders} items={contentItems} activeFolderId="q4" />);
    fireEvent.click(screen.getByRole('button', { name: /sort by name/i }));
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('a.pdf');
    // Filter tipe: hanya PDF yang tampil.
    fireEvent.click(screen.getByLabelText('Filter tipe file'));
    fireEvent.click(screen.getByRole('option', { name: 'PDF' }));
    expect(screen.queryByText('b.jpg')).toBeNull();
    expect(screen.getByText('a.pdf')).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('shows content loading skeleton and empty state with CTAs', () => {
    const { rerender } = render(
      <FileManager folders={folders} items={contentItems} activeFolderId="q4" loading />
    );
    expect(screen.getByText('Memuat konten…')).toBeDefined();
    rerender(<FileManager folders={folders} items={[]} activeFolderId="q4" />);
    expect(screen.getByText('Folder kosong')).toBeDefined();
    expect(screen.getAllByRole('button', { name: 'Upload' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: 'Folder baru' }).length).toBeGreaterThanOrEqual(1);
  });

  it('does not fetch on navigation (declarative contract)', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const onChange = vi.fn();
    render(<StatefulHarness onChange={onChange} />);
    fireEvent.click(screen.getByText('Arsip'));
    expect(onChange).toHaveBeenCalledWith('arsip');
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('FileManager context panel (002-03)', () => {
  const panelItems: FileItem[] = [
    { id: 'p1', folderId: 'q4', name: 'foto.png', type: 'image', size: 2048, updatedAt: '2026-11-01T00:00:00Z', dimensions: '800x600', previewUrl: 'https://example.com/foto.png' },
    { id: 'p2', folderId: 'q4', name: 'dokumen.pdf', type: 'pdf', size: 4096, updatedAt: '2026-11-02T00:00:00Z', previewUrl: 'https://example.com/dokumen.pdf' },
    { id: 'p3', folderId: 'q4', name: 'klip.mp4', type: 'video', size: 8192, updatedAt: '2026-11-03T00:00:00Z', duration: 125, previewUrl: 'https://example.com/klip.mp4' },
    { id: 'p4', folderId: 'q4', name: 'suara.mp3', type: 'audio', size: 1024, updatedAt: '2026-11-04T00:00:00Z', duration: 61, previewUrl: 'https://example.com/suara.mp3' },
    { id: 'p5', folderId: 'q4', name: 'arsip.zip', type: 'other', size: 512, updatedAt: '2026-11-05T00:00:00Z' },
  ];

  function stubURL() {
    class MockURL extends URL {
      static createObjectURL = vi.fn(() => 'blob:fake-url');
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', MockURL);
  }

  function openPreviewByEnter(name: string) {
    const row = screen.getByText(name).closest('tr');
    expect(row).not.toBeNull();
    fireEvent.keyDown(row as Element, { key: 'Enter', code: 'Enter' });
  }

  it('adds uploaded files to the active folder content', async () => {
    stubURL();
    const uploadHandler = vi.fn(async (_file: File, { onProgress }: { onProgress: (n: number) => void }) => {
      onProgress(100);
    });
    const { container } = render(
      <FileManager folders={folders} items={panelItems} activeFolderId="q4" uploadHandler={uploadHandler} />
    );
    const dropzone = container.querySelector('[aria-label="File upload dropzone"]');
    expect(dropzone).not.toBeNull();
    const files = [
      new File([new Uint8Array(10)], 'baru-1.txt', { type: 'text/plain' }),
      new File([new Uint8Array(10)], 'baru-2.txt', { type: 'text/plain' }),
      new File([new Uint8Array(10)], 'baru-3.txt', { type: 'text/plain' }),
    ];
    fireEvent.drop(dropzone as Element, { dataTransfer: { files } });
    for (const name of ['baru-1.txt', 'baru-2.txt', 'baru-3.txt']) {
      expect(await screen.findByText(name)).toBeDefined();
    }
    expect(uploadHandler.mock.calls.length).toBeGreaterThanOrEqual(3);
    vi.unstubAllGlobals();
  });

  it('previews image via Enter and traps focus, Esc closes and returns focus', async () => {
    stubURL();
    render(<FileManager folders={folders} items={panelItems} activeFolderId="q4" />);
    openPreviewByEnter('foto.png');
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByAltText('foto.png')).toBeDefined();
    expect(screen.getByText('800x600')).toBeDefined();
    // Fokus terjebak di dalam dialog saat terbuka.
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    vi.unstubAllGlobals();
  });

  it('previews video, audio, pdf (sandbox) and falls back for other', async () => {
    stubURL();
    const { unmount } = render(<FileManager folders={folders} items={panelItems} activeFolderId="q4" />);
    openPreviewByEnter('klip.mp4');
    expect((await screen.findByRole('dialog')).querySelector('video')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    openPreviewByEnter('suara.mp3');
    expect((await screen.findByRole('dialog')).querySelector('audio')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    openPreviewByEnter('dokumen.pdf');
    const pdfFrame = (await screen.findByRole('dialog')).querySelector('iframe');
    expect(pdfFrame).not.toBeNull();
    expect(pdfFrame?.getAttribute('sandbox')).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    openPreviewByEnter('arsip.zip');
    expect(await screen.findByRole('dialog')).toBeDefined();
    expect(screen.getByText(/Pratinjau tidak tersedia/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Unduh' })).toBeDefined();
    unmount();
    vi.unstubAllGlobals();
  });

  it('renders quota three levels with token colors and text messages', () => {
    const { rerender } = render(
      <FileManager folders={folders} items={panelItems} activeFolderId="q4" quota={{ total: 1000, used: 500 }} />
    );
    let bar = screen.getByRole('progressbar');
    expect(bar.firstElementChild?.className).toContain('bg-primary');
    expect(screen.getByText('Kapasitas masih cukup.')).toBeDefined();
    expect(screen.getByText('Sisa')).toBeDefined();

    rerender(<FileManager folders={folders} items={panelItems} activeFolderId="q4" quota={{ total: 1000, used: 850 }} />);
    bar = screen.getByRole('progressbar');
    expect(bar.firstElementChild?.className).toContain('bg-warning');
    expect(screen.getByText(/Hampir penuh/)).toBeDefined();

    rerender(<FileManager folders={folders} items={panelItems} activeFolderId="q4" quota={{ total: 1000, used: 1000 }} />);
    bar = screen.getByRole('progressbar');
    expect(bar.firstElementChild?.className).toContain('bg-destructive');
    expect(screen.getByText(/Penyimpanan penuh/)).toBeDefined();

    rerender(<FileManager folders={folders} items={panelItems} activeFolderId="q4" />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByLabelText('Kuota penyimpanan')).toBeNull();
  });

  it('shows quota loading skeleton and light error message', () => {
    const { rerender } = render(
      <FileManager folders={folders} items={panelItems} activeFolderId="q4" quota={{ total: 1000, used: 10 }} quotaLoading />
    );
    expect(screen.getByText('Memuat kuota…')).toBeDefined();
    rerender(
      <FileManager folders={folders} items={panelItems} activeFolderId="q4" quota={{ total: 1000, used: 10 }} quotaError="Kuota gagal dimuat." />
    );
    expect(screen.getByText('Kuota gagal dimuat.')).toBeDefined();
    // Konten tetap tampil (error quota tidak memblokir).
    expect(screen.getByText('foto.png')).toBeDefined();
  });

  it('shows selected item detail in the context panel', () => {
    render(<FileManager folders={folders} items={panelItems} activeFolderId="q4" />);
    expect(screen.getByText('Pilih item untuk melihat detailnya di sini.')).toBeDefined();
    fireEvent.click(screen.getByText('foto.png'));
    const panel = screen.getByLabelText('Detail item');
    expect(panel.textContent).toContain('foto.png');
    expect(panel.textContent).toContain('800x600');
    expect(panel.textContent).toContain('2.0 KB');
  });
});
