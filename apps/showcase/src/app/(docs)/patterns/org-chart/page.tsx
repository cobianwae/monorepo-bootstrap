'use client';

import * as React from 'react';
import Link from 'next/link';
import { Network, Sparkles } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  OrgChart,
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

export default function OrgChartPage() {
  const [demoState, setDemoState] = React.useState<DemoState>('normal');
  const [orientation, setOrientation] = React.useState<OrgChartOrientation>('top-down');
  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = React.useState<string | null>(null);
  // Engineering head collapsed secara default; pencarian membuka path via getAncestors.
  const [expandedIds, setExpandedIds] = React.useState<string[]>(() =>
    parentIds.filter((id) => id !== 'eng-head'),
  );

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return orgData.filter(
      (node) =>
        node.title.toLowerCase().includes(q) ||
        (node.subtitle ?? '').toLowerCase().includes(q),
    );
  }, [query]);

  const highlightedIds = matches.map((node) => node.id);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const q = value.trim().toLowerCase();
    if (!q) return;
    const found = orgData.filter(
      (node) =>
        node.title.toLowerCase().includes(q) || (node.subtitle ?? '').toLowerCase().includes(q),
    );
    const path = new Set<string>();
    for (const node of found) {
      for (const ancestor of getAncestors(orgData, node.id)) path.add(ancestor);
    }
    if (path.size > 0) {
      setExpandedIds((prev) => Array.from(new Set([...prev, ...path])));
    }
  };

  const data =
    demoState === 'empty'
      ? []
      : demoState === 'error-cycle'
        ? cycleData
        : demoState === 'error-parent'
          ? missingParentData
          : orgData;

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Org Chart / Diagram Organisasi"
        description="Pattern OrgChart (S-005.28): diagram hierarki 40 orang, 4 tingkat, 4 departemen beda aksen — dengan state matrix (loading/empty/error), highlight pencarian yang membuka path, toggle orientasi, dan pan/zoom keyboard. Handler demo mock; logika pencarian milik konsumen."
      />

      <Alert variant="warning">
        <AlertTitle>Deprecated — digantikan Org Chart Studio (PRD 011)</AlertTitle>
        <AlertDescription>
          <p>
            Komponen <code>OrgChart</code> dan halaman ini (S-005.28) berstatus deprecated dan akan dihapus saat 011
            shipped. Untuk fitur baru gunakan{' '}
            <Link href="/patterns/org-chart-studio" className="font-medium underline underline-offset-4">
              Org Chart Studio (/patterns/org-chart-studio)
            </Link>
            .
          </p>
        </AlertDescription>
      </Alert>

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
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {query.trim() ? `${matches.length} hasil` : 'Ketik untuk mencari'}
        </p>
      </div>

      <OrgChart
        data={data}
        orientation={orientation}
        expandedIds={expandedIds}
        onExpandedChange={setExpandedIds}
        selectedId={selectedId}
        highlightedIds={highlightedIds}
        loading={demoState === 'loading'}
        error={demoState === 'error-external' ? 'Gagal memuat data organisasi. Diagram terakhir tetap ditampilkan.' : null}
        emptyActionLabel="Kembalikan data contoh"
        onEmptyAction={() => setDemoState('normal')}
        onSelect={(node) => {
          setSelectedId(node.id);
          setSelectedTitle(node.title);
          toast({ variant: 'success', title: 'Node dipilih', description: node.title });
        }}
      />

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {selectedTitle ? `Node terpilih: ${selectedTitle}` : 'Belum ada node terpilih.'}
      </p>

      <section aria-label="Papan zoom dan pan keyboard" className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Network className="h-4 w-4" aria-hidden="true" /> Papan zoom/pan keyboard
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Fokus kanvas (role region): panah = pan 40px, <kbd>+</kbd>/<kbd>-</kbd> = zoom, <kbd>0</kbd> = reset.</li>
          <li>Zoom via tombol [−] [%] [+] [reset] di kanan atas kanvas, atau Ctrl/Cmd+wheel; wheel polos tidak dicegat.</li>
          <li>Node (roving tabindex): ↑↓ antar node visible, → expand/masuk anak, ← collapse/ke parent, Home/End, Enter/Spasi = pilih.</li>
        </ul>
      </section>

      <section aria-label="Catatan aksesibilitas" className="space-y-2">
        <h2 className="text-sm font-semibold">Catatan aksesibilitas</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Diagram memakai role tree/treeitem dengan aria-level/aria-expanded/aria-selected; navigasi keyboard mengikuti pola tree-view.</li>
          <li>Loading memakai skeleton 8 kotak dengan aria-busy; empty memakai role status; error invalid dan error eksternal memakai role alert dengan pesan teks.</li>
          <li>Highlight pencarian memakai ring primary + data-highlighted (bukan hanya warna); hasil diumumkan via live region di luar kanvas.</li>
          <li>Resep pencarian: konsumen mencocokkan nama/jabatan, lalu memakai getAncestors untuk expand path ke target.</li>
          <li>Semua warna lewat token semantik; light/dark parity terjaga. Transisi dihormati via prefers-reduced-motion.</li>
        </ul>
      </section>
    </div>
  );
}
