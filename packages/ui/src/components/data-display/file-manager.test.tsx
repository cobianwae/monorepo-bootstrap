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
    expect(screen.getByRole('alert')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows empty sidebar with Folder baru CTA', () => {
    render(<FileManager folders={[]} items={[]} activeFolderId="" />);
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
