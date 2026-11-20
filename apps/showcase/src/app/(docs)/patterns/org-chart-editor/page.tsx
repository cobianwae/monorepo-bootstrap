'use client';

import * as React from 'react';
import { Network, Sparkles } from 'lucide-react';
import {
  Button,
  OrgChart,
  OrgChartEditor,
  PageHeader,
  SearchInput,
  SegmentedControl,
  SegmentedControlItem,
  getAncestors,
  toast,
  type OrgChartOrientation,
  type OrgNodeFlat,
} from '@ds/ui';

const orgData: OrgNodeFlat[] = [
  { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Direksi', accent: 'primary' },
  // Engineering (info)
  { id: 'eng-head', parentId: 'ceo', title: 'Bima Prasetyo', subtitle: 'VP Engineering', badge: 'Engineering', accent: 'info' },
  { id: 'eng-fe-mgr', parentId: 'eng-head', title: 'Sari Dewi', subtitle: 'Engineering Manager Frontend', badge: 'Engineering', accent: 'info' },
  { id: 'eng-be-mgr', parentId: 'eng-head', title: 'Andi Kurniawan', subtitle: 'Engineering Manager Backend', badge: 'Engineering', accent: 'info' },
  { id: 'fe-1', parentId: 'eng-fe-mgr', title: 'Dita Anggraini', subtitle: 'Senior Frontend Engineer', badge: 'Engineering', accent: 'info' },
  { id: 'fe-2', parentId: 'eng-fe-mgr', title: 'Rizky Ramadhan', subtitle: 'Frontend Engineer', badge: 'Engineering', accent: 'info' },
  { id: 'fe-3', parentId: 'eng-fe-mgr', title: 'Putri Ayu Lestari', subtitle: 'Frontend Engineer', badge: 'Engineering', accent: 'info' },
  { id: 'be-1', parentId: 'eng-be-mgr', title: 'Fajar Nugroho', subtitle: 'Senior Backend Engineer', badge: 'Engineering', accent: 'info' },
  { id: 'be-2', parentId: 'eng-be-mgr', title: 'Maya Kusuma', subtitle: 'Backend Engineer', badge: 'Engineering', accent: 'info' },
  { id: 'be-3', parentId: 'eng-be-mgr', title: 'Hendra Gunawan', subtitle: 'Platform Engineer', badge: 'Engineering', accent: 'info' },
  { id: 'qa-1', parentId: 'eng-head', title: 'Lina Marlina', subtitle: 'QA Lead', badge: 'Engineering', accent: 'info' },
  // Operations (success)
  { id: 'ops-head', parentId: 'ceo', title: 'Eko Santoso', subtitle: 'VP Operations', badge: 'Operations', accent: 'success' },
  { id: 'ops-mgr-1', parentId: 'ops-head', title: 'Nina Hartati', subtitle: 'Operations Manager', badge: 'Operations', accent: 'success' },
  { id: 'ops-mgr-2', parentId: 'ops-head', title: 'Dedi Supriadi', subtitle: 'Logistics Manager', badge: 'Operations', accent: 'success' },
  { id: 'ops-1', parentId: 'ops-mgr-1', title: 'Rina Puspita', subtitle: 'Operations Specialist', badge: 'Operations', accent: 'success' },
  { id: 'ops-2', parentId: 'ops-mgr-1', title: 'Agus Setiawan', subtitle: 'Operations Specialist', badge: 'Operations', accent: 'success' },
  { id: 'ops-3', parentId: 'ops-mgr-1', title: 'Tari Wulandari', subtitle: 'Customer Success', badge: 'Operations', accent: 'success' },
  { id: 'ops-4', parentId: 'ops-mgr-2', title: 'Bayu Aditya', subtitle: 'Logistics Coordinator', badge: 'Operations', accent: 'success' },
  { id: 'ops-5', parentId: 'ops-mgr-2', title: 'Sinta Maharani', subtitle: 'Warehouse Lead', badge: 'Operations', accent: 'success' },
  { id: 'ops-6', parentId: 'ops-mgr-2', title: 'Yusuf Hakim', subtitle: 'Procurement Specialist', badge: 'Operations', accent: 'success' },
  // Sales (warning)
  { id: 'sales-head', parentId: 'ceo', title: 'Citra Rahmawati', subtitle: 'VP Sales', badge: 'Sales', accent: 'warning' },
  { id: 'sales-mgr-1', parentId: 'sales-head', title: 'Rudi Hartono', subtitle: 'Sales Manager Enterprise', badge: 'Sales', accent: 'warning' },
  { id: 'sales-mgr-2', parentId: 'sales-head', title: 'Mega Puspita', subtitle: 'Sales Manager SMB', badge: 'Sales', accent: 'warning' },
  { id: 'sales-1', parentId: 'sales-mgr-1', title: 'Ilham Maulana', subtitle: 'Account Executive', badge: 'Sales', accent: 'warning' },
  { id: 'sales-2', parentId: 'sales-mgr-1', title: 'Desi Ratnasari', subtitle: 'Account Executive', badge: 'Sales', accent: 'warning' },
  { id: 'sales-3', parentId: 'sales-mgr-1', title: 'Galih Pratama', subtitle: 'Sales Development Rep', badge: 'Sales', accent: 'warning' },
  { id: 'sales-4', parentId: 'sales-mgr-2', title: 'Fitri Handayani', subtitle: 'Account Executive', badge: 'Sales', accent: 'warning' },
  { id: 'sales-5', parentId: 'sales-mgr-2', title: 'Nanda Wijaya', subtitle: 'Inside Sales', badge: 'Sales', accent: 'warning' },
  { id: 'sales-6', parentId: 'sales-mgr-2', title: 'Raka Aditya', subtitle: 'Inside Sales', badge: 'Sales', accent: 'warning' },
  // Finance (destructive)
  { id: 'fin-head', parentId: 'ceo', title: 'Dian Permatasari', subtitle: 'VP Finance', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-mgr-1', parentId: 'fin-head', title: 'Oscar Tanuwijaya', subtitle: 'Finance Manager', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-mgr-2', parentId: 'fin-head', title: 'Vina Anggraini', subtitle: 'Accounting Manager', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-1', parentId: 'fin-mgr-1', title: 'Kevin Saputra', subtitle: 'Financial Analyst', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-2', parentId: 'fin-mgr-1', title: 'Ayu Kartika', subtitle: 'Financial Analyst', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-3', parentId: 'fin-mgr-1', title: 'Bagus Wicaksono', subtitle: 'Tax Specialist', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-4', parentId: 'fin-mgr-2', title: 'Salsa Bilqis', subtitle: 'Staff Accountant', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-5', parentId: 'fin-mgr-2', title: 'Rudiansyah', subtitle: 'Staff Accountant', badge: 'Finance', accent: 'destructive' },
  { id: 'fin-6', parentId: 'fin-mgr-2', title: 'Nabila Putri', subtitle: 'Payroll Specialist', badge: 'Finance', accent: 'destructive' },
];

const rootOnly: OrgNodeFlat[] = [
  { id: 'root-baru', parentId: null, title: 'Root Baru', subtitle: 'Tambahkan bawahan dari kanvas' },
];

const cycleData: OrgNodeFlat[] = orgData.map((node) =>
  node.id === 'ceo' ? { ...node, parentId: 'fin-6' } : node,
);

const missingParentData: OrgNodeFlat[] = orgData.map((node) =>
  node.id === 'fin-6' ? { ...node, parentId: 'tidak-ada' } : node,
);

const demoStates = ['normal', 'loading', 'empty', 'error-cycle', 'error-parent', 'error-external'] as const;
type DemoState = (typeof demoStates)[number];

const parentIds = orgData
  .filter((node) => orgData.some((child) => child.parentId === node.id))
  .map((node) => node.id);

export default function OrgChartEditorPage() {
  const [demoState, setDemoState] = React.useState<DemoState>('normal');
  const [data, setData] = React.useState<OrgNodeFlat[]>(orgData);
  const [orientation, setOrientation] = React.useState<OrgChartOrientation>('top-down');
  const [query, setQuery] = React.useState('');
  const [selectedTitle, setSelectedTitle] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'canvas' | 'list'>('canvas');
  // Engineering head collapsed secara default; pencarian membuka path via getAncestors.
  const [expandedIds, setExpandedIds] = React.useState<string[]>(() =>
    parentIds.filter((id) => id !== 'eng-head'),
  );

  const searchSource = demoState === 'normal' ? data : orgData;

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchSource.filter(
      (node) =>
        node.title.toLowerCase().includes(q) ||
        (node.subtitle ?? '').toLowerCase().includes(q),
    );
  }, [query, searchSource]);

  const highlightedIds = matches.map((node) => node.id);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const q = value.trim().toLowerCase();
    if (!q) return;
    const found = searchSource.filter(
      (node) =>
        node.title.toLowerCase().includes(q) || (node.subtitle ?? '').toLowerCase().includes(q),
    );
    const path = new Set<string>();
    for (const node of found) {
      for (const ancestor of getAncestors(searchSource, node.id)) path.add(ancestor);
    }
    if (path.size > 0) {
      setExpandedIds((prev) => Array.from(new Set([...prev, ...path])));
    }
  };

  const editorData =
    demoState === 'empty'
      ? []
      : demoState === 'error-cycle'
        ? cycleData
        : demoState === 'error-parent'
          ? missingParentData
          : data;

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Org Chart Editor / Editor Organisasi"
        description="Pattern OrgChartEditor (S-005.33): editor organisasi end-to-end di atas canvas xyflow — browse, tambah, pindah, edit, hapus, undo, dan search — dengan state matrix (loading/empty/error), pohon alternatif untuk screen reader, dan resep controlled data + onChange milik konsumen. Handler demo mock."
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          State demo
        </span>
        {demoStates.map((state) => (
          <Button
            key={state}
            size="sm"
            variant={demoState === state ? 'default' : 'outline'}
            onClick={() => setDemoState(state)}
          >
            {state}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          className="max-w-sm flex-1"
          placeholder="Cari nama atau jabatan…"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onClear={() => handleQueryChange('')}
          aria-label="Cari node organisasi"
        />
        <SegmentedControl
          type="single"
          value={orientation}
          onValueChange={(value) => {
            if (value) setOrientation(value as OrgChartOrientation);
          }}
          aria-label="Orientasi layout"
        >
          <SegmentedControlItem value="top-down">Top-down</SegmentedControlItem>
          <SegmentedControlItem value="left-right">Left-right</SegmentedControlItem>
        </SegmentedControl>
        <SegmentedControl
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as 'canvas' | 'list');
          }}
          aria-label="Tampilan editor"
        >
          <SegmentedControlItem value="canvas">Kanvas</SegmentedControlItem>
          <SegmentedControlItem value="list">Daftar (SR)</SegmentedControlItem>
        </SegmentedControl>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {query.trim() ? `${matches.length} hasil` : 'Ketik untuk mencari'}
        </p>
      </div>

      {view === 'canvas' ? (
        <OrgChartEditor
          data={editorData}
          onChange={(next) => {
            setData(next);
          }}
          orientation={orientation}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          highlightedIds={highlightedIds}
          loading={demoState === 'loading'}
          error={demoState === 'error-external' ? 'Gagal memuat data organisasi. Diagram terakhir tetap ditampilkan.' : null}
          emptyActionLabel="Buat root pertama"
          onEmptyAction={() => {
            setData(rootOnly);
            setDemoState('normal');
            toast({ variant: 'success', title: 'Root dibuat', description: 'Root Baru ditambahkan ke kanvas.' });
          }}
          onSelect={(node) => {
            setSelectedTitle(node.title);
            toast({ variant: 'success', title: 'Node dipilih', description: node.title });
          }}
        />
      ) : (
        <OrgChart
          data={editorData}
          orientation={orientation}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          highlightedIds={highlightedIds}
          loading={demoState === 'loading'}
          error={demoState === 'error-external' ? 'Gagal memuat data organisasi. Diagram terakhir tetap ditampilkan.' : null}
          emptyActionLabel="Buat root pertama"
          onEmptyAction={() => {
            setData(rootOnly);
            setDemoState('normal');
          }}
          onSelect={(node) => {
            setSelectedTitle(node.title);
            toast({ variant: 'success', title: 'Node dipilih', description: node.title });
          }}
        />
      )}

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {selectedTitle ? `Node terpilih: ${selectedTitle}` : 'Belum ada node terpilih.'}
      </p>

      <section aria-label="Papan keyboard editor" className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Network className="h-4 w-4" aria-hidden="true" /> Papan keyboard editor
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Kanvas: Tab masuk toolbar → kanvas → inspector; panah = pan, <kbd>+</kbd>/<kbd>-</kbd> zoom, <kbd>0</kbd> reset, <kbd>Ctrl+Z</kbd>/<kbd>Ctrl+Y</kbd> undo/redo.</li>
          <li>Node: Enter buka inspector (edit), tombol <kbd>+</kbd> tambah bawahan, Delete hapus dengan konfirmasi, Shift+F10 context-menu (pindah via dialog).</li>
          <li>Semua operasi (tambah/pindah/hapus/edit/collapse/search) tersedia tanpa mouse; drag pindah punya jalur dialog keyboard yang setara.</li>
          <li>Tampilan Daftar adalah pohon alternatif <code>role=&quot;tree&quot;</code>: ↑↓ antar baris, → expand, ← collapse, Home/End, Enter pilih.</li>
        </ul>
      </section>

      <section aria-label="Catatan aksesibilitas" className="space-y-2">
        <h2 className="text-sm font-semibold">Catatan aksesibilitas</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Kanvas memakai role application; pohon Daftar memakai role tree/treeitem dengan aria-level/aria-expanded/aria-selected.</li>
          <li>Loading memakai skeleton 8 kotak dengan aria-busy; empty memakai role status + CTA buat root; error invalid memakai role alert dengan id node + tombol salin detail; error eksternal tampil di atas diagram yang tetap terlihat.</li>
          <li>Highlight pencarian memakai ring primary + data-highlighted (bukan hanya warna); jumlah hasil diumumkan via live region di luar kanvas; hapus query menghilangkan sorotan.</li>
          <li>Resep pencarian: konsumen mencocokkan nama/jabatan, lalu memakai getAncestors untuk expand path ke target.</li>
          <li>Focus ring primary 2px terlihat; semua warna lewat token semantik (light/dark parity); transisi dihormati via prefers-reduced-motion.</li>
        </ul>
      </section>
    </div>
  );
}
