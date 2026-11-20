'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Button,
  FileManager,
  PageHeader,
  toast,
  type FileFolder,
  type FileItem,
  type FileManagerView,
} from '@ds/ui';

const folders: FileFolder[] = [
  { id: 'dokumen', name: 'Dokumen', parentId: null },
  { id: '2026', name: '2026', parentId: 'dokumen' },
  { id: 'q4', name: 'Q4', parentId: '2026' },
  { id: 'arsip', name: 'Arsip', parentId: null },
];

const items: FileItem[] = [
  { id: 'f1', folderId: 'q4', name: 'laporan-q4.pdf', type: 'pdf', size: 204800, updatedAt: '2026-11-01T00:00:00Z' },
  { id: 'f2', folderId: 'q4', name: 'foto-tim.jpg', type: 'image', size: 1048576, updatedAt: '2026-11-02T00:00:00Z' },
  { id: 'f3', folderId: 'q4', name: 'rekaman-demo.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z' },
  { id: 'f4', folderId: 'q4', name: 'podcast-ep1.mp3', type: 'audio', size: 8388608, updatedAt: '2026-11-03T00:00:00Z' },
  { id: 'f5', folderId: '2026', name: 'rekaman-demo.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z' },
  { id: 'f6', folderId: 'dokumen', name: 'pedoman.docx', type: 'other', size: 51200, updatedAt: '2026-09-01T00:00:00Z' },
];

const sidebarStates = ['normal', 'loading', 'error'] as const;
type SidebarState = (typeof sidebarStates)[number];

const contentStates = ['normal', 'loading', 'empty', 'error'] as const;
type ContentState = (typeof contentStates)[number];

function toastAction(title: string, count?: number) {
  toast({
    variant: 'success',
    title,
    description: count !== undefined ? `${count} item` : undefined,
  });
}

export default function FileManagerPage() {
  const [activeFolderId, setActiveFolderId] = React.useState('dokumen');
  const [sidebarState, setSidebarState] = React.useState<SidebarState>('normal');
  const [contentState, setContentState] = React.useState<ContentState>('normal');
  const [view, setView] = React.useState<FileManagerView>('list');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isEmpty, setIsEmpty] = React.useState(false);

  const handleFolderChange = (folderId: string) => {
    setActiveFolderId(folderId);
    toast({
      variant: 'success',
      title: 'Folder aktif berubah',
      description: `Folder aktif: ${folders.find((f) => f.id === folderId)?.name ?? folderId}`,
    });
  };

  const shownItems = contentState === 'empty' ? [] : items;

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="File Manager / Konten List-Grid"
        description="Pattern FileManager (S-005.27.01): zona konten mode list (basis data-table) dan grid dengan seleksi tunggal yang tidak reset saat menukar view, bulk action bar, context menu 6 aksi, sortir kolom, dan filter tipe file. Panel upload/quota/detail pada 002-03."
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          State sidebar
        </span>
        {sidebarStates.map((state) => (
          <Button
            key={state}
            size="sm"
            variant={sidebarState === state ? 'default' : 'outline'}
            onClick={() => setSidebarState(state)}
          >
            {state}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          State konten
        </span>
        {contentStates.map((state) => (
          <Button
            key={state}
            size="sm"
            variant={contentState === state ? 'default' : 'outline'}
            onClick={() => setContentState(state)}
          >
            {state}
          </Button>
        ))}
        <Button size="sm" variant={isEmpty ? 'default' : 'outline'} onClick={() => setIsEmpty((v) => !v)}>
          empty (sidebar)
        </Button>
      </div>

      <FileManager
        folders={isEmpty ? [] : folders}
        items={shownItems}
        activeFolderId={activeFolderId}
        view={view}
        selectedIds={selectedIds}
        loading={sidebarState === 'loading' || contentState === 'loading'}
        error={
          sidebarState === 'error'
            ? 'Gagal memuat folder. Periksa koneksi lalu coba lagi.'
            : contentState === 'error'
              ? 'Gagal memuat konten folder. Seleksi dibersihkan.'
              : null
        }
        onActiveFolderChange={handleFolderChange}
        onSelectionChange={setSelectedIds}
        onViewChange={setView}
        onPreview={(item) => toastAction(`Buka ${item.name}`)}
        onDownload={(selected) => toastAction('Unduh', selected.length)}
        onMove={(selected) => toastAction('Pindah', selected.length)}
        onDelete={(selected) => toastAction('Hapus', selected.length)}
        onRename={(item) => toastAction(`Ganti nama ${item.name}`)}
        onRetry={() => {
          setSidebarState('normal');
          setContentState('normal');
        }}
      />

      <section aria-label="Catatan aksesibilitas" className="space-y-2">
        <h2 className="text-sm font-semibold">Catatan aksesibilitas</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Sidebar memakai pola treeview existing: panah untuk bergerak, Enter/spasi untuk memilih.</li>
          <li>Breadcrumb memakai nav berlabel Breadcrumb; setiap segmen adalah tombol yang terjangkau keyboard.</li>
          <li>Loading sidebar dan konten memakai skeleton dengan aria-busy; error memakai role alert dengan tombol Coba lagi.</li>
          <li>Seleksi diumumkan via aria-live polite; bulk action bar muncul saat ada item terpilih.</li>
          <li>Context menu terbuka via klik kanan atau tombol Menu/Shift+F10 pada baris item yang fokus.</li>
          <li>Grid memakai listbox dengan posisi item (aria-posinset) terbaca screen reader.</li>
          <li>Di mobile, sidebar menjadi drawer dan panel konteks menjadi sheet; tidak ada fungsi inti yang hilang.</li>
        </ul>
      </section>
    </div>
  );
}
