'use client';

// Showcase final OrgChartStudio (011-05, S-005.34): langkah end-to-end bernomor,
// panel demo 6 state matrix, contoh 40 orang 1 klik, resep integrasi 15 baris,
// toolbar + pencarian + live region + controls + minimap + panel S-005.34.01 +
// M-007/M-008 + toast + pohon SR internal + papan keyboard + catatan a11y.
// State controlled milik konsumen (resep FR-013/FR-014).

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
  OrgChartStudio,
  PageHeader,
  toast,
  type OrgStudioNodeFlat,
} from '@ds/ui';
import { StudioDemoPanel, type StudioDemoKind } from './_components/studio-demo-panel';
import { STUDIO_STEPS, buildStudioExample40, buildStudioInvalid, studioSeedData, type StudioInvalidKind } from './_components/studio-demo-data';
import { StudioRecipe } from './_components/studio-recipe';
import { StudioShortcuts } from './_components/studio-shortcuts';

const EXTERNAL_ERROR_MESSAGE =
  'Gagal menyinkronkan dengan server (demo): perubahan lokal aman, diagram terakhir tetap tampil.';

export default function OrgChartStudioPage() {
  const [data, setData] = React.useState<OrgStudioNodeFlat[]>(studioSeedData);
  const [query, setQuery] = React.useState('');
  const [expandedIds, setExpandedIds] = React.useState<string[] | undefined>(undefined);
  const [kind, setKind] = React.useState<StudioDemoKind>('success');
  const [invalidKind, setInvalidKind] = React.useState<StudioInvalidKind>('duplikat');
  const [externalError, setExternalError] = React.useState<string | null>(null);
  const [minimap, setMinimap] = React.useState(true);
  const example40 = React.useMemo(() => buildStudioExample40(), []);

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

  const visibleData = React.useMemo<OrgStudioNodeFlat[]>(() => {
    switch (kind) {
      case 'empty':
        return [];
      case 'invalid':
        return buildStudioInvalid(invalidKind);
      default:
        return data;
    }
  }, [kind, data, invalidKind]);

  const handleKindChange = React.useCallback(
    (next: StudioDemoKind) => {
      if (next === 'contoh') {
        setData(example40);
        setQuery('');
        setExpandedIds(undefined);
      }
      setKind(next);
      setExternalError(next === 'eksternal' ? EXTERNAL_ERROR_MESSAGE : null);
      if (next === 'loading') {
        toast({ title: 'Memuat struktur…', description: 'Skeleton 8 kartu + teks SR (aria-busy).', duration: 3000 });
      }
    },
    [example40],
  );

  const loadExample = React.useCallback(() => {
    setData(example40);
    setKind('success');
    setQuery('');
    setExpandedIds(undefined);
    setExternalError(null);
    toast({ title: 'Contoh dimuat', description: '40 orang · 4 tingkat · 4 departemen.', duration: 4000 });
  }, [example40]);

  const resetDemo = React.useCallback(() => {
    setData(studioSeedData);
    setQuery('');
    setExpandedIds(undefined);
    setKind('success');
    setInvalidKind('duplikat');
    setExternalError(null);
    setMinimap(true);
  }, []);

  const createRoot = React.useCallback(() => {
    const root: OrgStudioNodeFlat[] = [
      { id: 'root', parentId: null, title: 'Unit baru', subtitle: 'Klik kartu lalu F2 untuk ganti nama', badge: 'Direksi', accent: 'primary' },
    ];
    setData(root);
    setKind('success');
    toast({ title: 'Root dibuat', description: 'Fokus kartu lalu tekan F2 untuk inline-edit.', duration: 4000 });
  }, []);

  const deptCount = React.useMemo(
    () => new Set(visibleData.map((node) => node.badge).filter(Boolean)).size,
    [visibleData],
  );
  const meta =
    kind === 'contoh'
      ? `${visibleData.length} orang · 4 tingkat · ${deptCount} departemen`
      : `${visibleData.length} orang · ${deptCount} departemen`;

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Org Chart Studio / Studio Organisasi"
        description={`S-005.34 final (PRD 011): tambah 1-klik inline-edit + panel detail (S-005.34.01) + pindah drag/dialog M-007 + hapus M-008 + undo/redo + pencarian + pohon SR + state matrix 6 demo. ${meta}.`}
      />

      <StudioDemoPanel
        kind={kind}
        onKindChange={handleKindChange}
        invalidKind={invalidKind}
        onInvalidKindChange={setInvalidKind}
        minimap={minimap}
        onMinimapChange={setMinimap}
        onLoadExample={loadExample}
        onReset={resetDemo}
      />

      <section aria-labelledby="org-studio-steps" className="space-y-2">
        <h2 id="org-studio-steps" className="text-lg font-semibold text-foreground">
          Langkah end-to-end (FR-014)
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground marker:font-medium marker:text-foreground">
          {STUDIO_STEPS.map((step) => (
            <li key={step.title}>
              <span className="font-medium text-foreground">{step.title}:</span> {step.detail}
            </li>
          ))}
        </ol>
      </section>

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

      {externalError ? (
        <Alert variant="destructive">
          <AlertTitle>Kesalahan eksternal (demo)</AlertTitle>
          <AlertDescription>
            <p>{externalError}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setExternalError(null)}>
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <OrgChartStudio
          data={visibleData}
          onChange={setData}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          highlightedIds={highlightedIds}
          loading={kind === 'loading'}
          minimap={minimap}
          emptyActionLabel="Buat root"
          onEmptyAction={createRoot}
          ariaLabel="Org chart studio"
        />
        <p className="text-xs text-muted-foreground">
          Resep kontrol: pegang <code>data</code> di state, sambung <code>onChange</code> langsung ke{' '}
          <code>setData</code> (log demo mock). Pencarian milik konsumen: hitung <code>highlightedIds</code> dari
          query sendiri; komponen membuka path + mengumumkan jumlah.
        </p>
      </div>

      <StudioRecipe />
      <StudioShortcuts />
    </div>
  );
}
