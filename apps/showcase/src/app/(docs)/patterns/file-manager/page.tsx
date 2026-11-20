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
  { id: 'f3', folderId: '2026', name: 'rekaman-demo.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z' },
  { id: 'f4', folderId: 'dokumen', name: 'pedoman.docx', type: 'other', size: 51200, updatedAt: '2026-09-01T00:00:00Z' },
];

const sidebarStates = ['normal', 'loading', 'error'] as const;
type SidebarState = (typeof sidebarStates)[number];

export default function FileManagerPage() {
  const [activeFolderId, setActiveFolderId] = React.useState('dokumen');
  const [sidebarState, setSidebarState] = React.useState<SidebarState>('normal');
  const [isEmpty, setIsEmpty] = React.useState(false);

  const handleFolderChange = (folderId: string) => {
    setActiveFolderId(folderId);
    toast({
      variant: 'success',
      title: 'Folder aktif berubah',
      description: `Folder aktif: ${folders.find((f) => f.id === folderId)?.name ?? folderId}`,
    });
  };

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="File Manager / Shell Tiga Zona"
        description="Pattern FileManager (S-005.27): sidebar tree, konten placeholder, dan panel konteks placeholder. Klik folder di tree atau segmen breadcrumb untuk melihat navigasi dua arah. Konten list/grid pada 002-02; panel upload/quota/detail pada 002-03."
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
        <Button size="sm" variant={isEmpty ? 'default' : 'outline'} onClick={() => setIsEmpty((v) => !v)}>
          empty
        </Button>
      </div>

      <FileManager
        folders={isEmpty ? [] : folders}
        items={items}
        activeFolderId={activeFolderId}
        loading={sidebarState === 'loading'}
        error={sidebarState === 'error' ? 'Gagal memuat folder. Periksa koneksi lalu coba lagi.' : null}
        onActiveFolderChange={handleFolderChange}
        onRetry={() => setSidebarState('normal')}
      />

      <section aria-label="Catatan aksesibilitas" className="space-y-2">
        <h2 className="text-sm font-semibold">Catatan aksesibilitas</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Sidebar memakai pola treeview existing: panah untuk bergerak, Enter/spasi untuk memilih.</li>
          <li>Breadcrumb memakai nav berlabel Breadcrumb; setiap segmen adalah tombol yang terjangkau keyboard.</li>
          <li>Loading sidebar memakai skeleton dengan aria-busy; error memakai role alert dengan tombol Coba lagi.</li>
          <li>Di mobile, sidebar menjadi drawer dan panel konteks menjadi sheet; tidak ada fungsi inti yang hilang.</li>
        </ul>
      </section>
    </div>
  );
}
