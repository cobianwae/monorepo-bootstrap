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
  { id: 'f1', folderId: 'q4', name: 'laporan-q4.pdf', type: 'pdf', size: 204800, updatedAt: '2026-11-01T00:00:00Z', previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 'f2', folderId: 'q4', name: 'foto-tim.jpg', type: 'image', size: 1048576, updatedAt: '2026-11-02T00:00:00Z', dimensions: '4032x3024', previewUrl: 'https://picsum.photos/seed/foto-tim/800/600' },
  { id: 'f3', folderId: 'q4', name: 'rekaman-demo.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z', duration: 754, previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'f4', folderId: 'q4', name: 'podcast-ep1.mp3', type: 'audio', size: 8388608, updatedAt: '2026-11-03T00:00:00Z', duration: 2145, previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3' },
  { id: 'f5', folderId: '2026', name: 'rekaman-demo.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z', duration: 754, previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'f6', folderId: 'dokumen', name: 'pedoman.docx', type: 'other', size: 51200, updatedAt: '2026-09-01T00:00:00Z' },
];

const sidebarStates = ['normal', 'loading', 'error'] as const;
type SidebarState = (typeof sidebarStates)[number];

const contentStates = ['normal', 'loading', 'empty', 'error'] as const;
type ContentState = (typeof contentStates)[number];

const quotaLevels = ['normal', 'warning', 'full'] as const;
type QuotaLevel = (typeof quotaLevels)[number];

const quotaByLevel: Record<QuotaLevel, { total: number; used: number }> = {
  normal: { total: 10 * 1024 ** 3, used: 2 * 1024 ** 3 },
  warning: { total: 10 * 1024 ** 3, used: 9 * 1024 ** 3 },
  full: { total: 10 * 1024 ** 3, used: 10 * 1024 ** 3 },
};

const previewTypes = ['image', 'pdf', 'video', 'audio', 'other'] as const;

const mockUploadHandler = async (_file: File, { onProgress }: { onProgress: (n: number) => void }) => {
  onProgress(100);
};

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
  const [quotaLevel, setQuotaLevel] = React.useState<QuotaLevel>('normal');
  const [quotaLoading, setQuotaLoading] = React.useState(false);
  const [quotaError, setQuotaError] = React.useState(false);

  // Buka preview lewat jalur keyboard yang sama dengan user: fokus baris
  // item lalu dispatch Enter (pattern menangani sisanya).
  const openPreviewFor = (item: FileItem) => {
    setActiveFolderId(item.folderId);
    setSelectedIds([item.id]);
    window.requestAnimationFrame(() => {
      const row = Array.from(document.querySelectorAll('tr')).find((tr) =>
        tr.textContent?.includes(item.name)
      );
      row?.focus();
      row?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    });
  };

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
        title="File Manager / Panel Konteks, Preview & Quota"
        description="Pattern FileManager (S-005.27.02): panel konteks berisi upload queue (compose file-upload), indikator quota tiga level via token, dan detail item terpilih. Preview M-001 tampil sebagai sheet di desktop dan dialog full-screen di mobile untuk image, PDF (sandbox), video, audio, dengan fallback generik untuk tipe lain."
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Level quota
        </span>
        {quotaLevels.map((level) => (
          <Button
            key={level}
            size="sm"
            variant={quotaLevel === level ? 'default' : 'outline'}
            onClick={() => setQuotaLevel(level)}
          >
            {level}
          </Button>
        ))}
        <Button size="sm" variant={quotaLoading ? 'default' : 'outline'} onClick={() => setQuotaLoading((v) => !v)}>
          loading
        </Button>
        <Button size="sm" variant={quotaError ? 'default' : 'outline'} onClick={() => setQuotaError((v) => !v)}>
          error
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Buka preview
        </span>
        {previewTypes.map((type) => {
          const item = items.find((i) => i.type === type);
          if (!item) return null;
          return (
            <Button key={type} size="sm" variant="outline" onClick={() => openPreviewFor(item)}>
              {type}
            </Button>
          );
        })}
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
        quota={quotaByLevel[quotaLevel]}
        quotaLoading={quotaLoading}
        quotaError={quotaError ? 'Kuota gagal dimuat. Coba lagi nanti.' : null}
        uploadHandler={mockUploadHandler}
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
          <li>Panel konteks berisi upload queue, quota (total/terpakai/sisa + pesan teks, bukan hanya warna), dan detail item terpilih.</li>
          <li>Preview M-001 terbuka via Enter pada baris item atau menu Buka/Pratinjau; fokus terjebak di dalamnya, Esc menutup, fokus kembali ke baris pemicu.</li>
          <li>PDF dirender dengan sandbox tanpa script ditambah tombol unduh; tipe tak didukung jatuh ke fallback generik.</li>
        </ul>
      </section>
    </div>
  );
}
