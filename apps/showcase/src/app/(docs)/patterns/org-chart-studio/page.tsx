'use client';

// Draf showcase OrgChartStudio (011-04): tambah 1-klik inline-edit + panel
// detail on-demand + pindah drag/dialog (M-007) + hapus (M-008) + undo/redo
// + pencarian presentasional + papan keyboard. State controlled milik konsumen.
// Scope penuh (langkah bernomor, state matrix) di 011-05.

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Button, Input, Label, OrgChartStudio, PageHeader, type OrgStudioNodeFlat } from '@ds/ui';

const seedData: OrgStudioNodeFlat[] = [
  { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Direksi', accent: 'primary' },
  { id: 'eng-head', parentId: 'ceo', title: 'Bima Prasetyo', subtitle: 'VP Engineering', badge: 'Engineering', accent: 'info' },
  { id: 'eng-fe', parentId: 'eng-head', title: 'Sari Dewi', subtitle: 'Engineering Manager Frontend', badge: 'Engineering', accent: 'info' },
  { id: 'eng-be', parentId: 'eng-head', title: 'Andi Kurniawan', subtitle: 'Engineering Manager Backend', badge: 'Engineering', accent: 'info' },
  { id: 'ops-head', parentId: 'ceo', title: 'Eko Santoso', subtitle: 'VP Operations', badge: 'Operations', accent: 'success' },
  { id: 'ops-mgr', parentId: 'ops-head', title: 'Nina Hartati', subtitle: 'Operations Manager', badge: 'Operations', accent: 'success' },
];

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: 'Tab', action: 'Urutan fokus: toolbar → kanvas → kartu/gagang → kontrol → panel → pohon aksesibel' },
  { keys: '← ↑ ↓ →', action: 'Geser kanvas 40px (fokus di viewport)' },
  { keys: '+ − 0 F', action: 'Zoom in / out / reset 100% / fit view' },
  { keys: 'Enter', action: 'Pilih kartu fokus' },
  { keys: 'Shift+Enter', action: 'Buka panel detail kartu fokus' },
  { keys: 'F2 / Ctrl+Enter', action: 'Ubah nama kartu fokus (inline-edit)' },
  { keys: 'Space', action: 'Perluas/ciutkan kartu induk' },
  { keys: 'Delete', action: 'Hapus kartu fokus (dialog M-008, root diproteksi)' },
  { keys: 'Ctrl+Z / Ctrl+Y', action: 'Urungkan / ulangi perubahan' },
];

export default function OrgChartStudioPage() {
  const [data, setData] = React.useState<OrgStudioNodeFlat[]>(seedData);
  const [query, setQuery] = React.useState('');
  const [expandedIds, setExpandedIds] = React.useState<string[] | undefined>(undefined);

  // Pencarian presentasional milik konsumen (design D9): cocok nama/jabatan/badge.
  const highlightedIds = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return data
      .filter(
        (node) =>
          node.title.toLowerCase().includes(q) ||
          (node.subtitle ?? '').toLowerCase().includes(q) ||
          (node.badge ?? '').toLowerCase().includes(q),
      )
      .map((node) => node.id);
  }, [data, query]);

  const resetDemo = React.useCallback(() => {
    setData(seedData);
    setQuery('');
    setExpandedIds(undefined);
  }, []);

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Org Chart Studio / Studio Organisasi"
        description="Draf 011-04 (S-005.34): tambah 1-klik + panel detail (S-005.34.01) + pindah via seret kartu atau dialog M-007 + hapus via Delete/dialog M-008 (root diproteksi) + toolbar Urungkan/Ulangi (Ctrl+Z/Y) + pencarian + pohon aksesibel + papan keyboard. Tiap commit memanggil onChange sekali; toast menyediakan Urungkan."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={resetDemo}>
          Reset demo
        </Button>
        <div className="min-w-64 flex-1 space-y-1 sm:max-w-sm">
          <Label htmlFor="org-studio-search">Cari nama, jabatan, atau departemen</Label>
          <Input
            id="org-studio-search"
            type="search"
            value={query}
            placeholder="mis. engineer"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {query.trim() === ''
            ? 'Ketik untuk menyorot hasil (cincin + badge Cocok + garis putus).'
            : highlightedIds.length === 0
              ? 'Tidak ada hasil.'
              : `${highlightedIds.length} hasil — path ancestor dibuka otomatis.`}
        </p>
      </div>

      <div className="space-y-2">
        <OrgChartStudio
          data={data}
          onChange={setData}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          highlightedIds={highlightedIds}
          ariaLabel="Org chart studio"
        />
        <p className="text-xs text-muted-foreground">
          Resep kontrol: pegang <code>data</code> di state, sambung <code>onChange</code> langsung ke{' '}
          <code>setData</code> (log demo mock). Pencarian milik konsumen: hitung{' '}
          <code>highlightedIds</code> dari query sendiri; komponen membuka path + mengumumkan jumlah.
        </p>
      </div>

      <section aria-labelledby="org-studio-shortcuts" className="space-y-3">
        <h2 id="org-studio-shortcuts" className="text-lg font-semibold text-foreground">
          Papan keyboard
        </h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((row) => (
            <div key={row.keys} className="rounded-md border border-border bg-card p-3">
              <dt className="font-mono text-sm font-medium text-foreground">{row.keys}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{row.action}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Catatan aksesibilitas: kanvas memakai <code>role=&quot;application&quot;</code>; jalur utama screen
          reader adalah pohon aksesibel internal (<code>role=&quot;tree&quot;</code>, tautan &quot;Lewati kanvas
          ke pohon aksesibel&quot; tersedia sebelum kanvas). Error memakai live region assertive; status lain
          polite.
        </p>
      </section>
    </div>
  );
}
