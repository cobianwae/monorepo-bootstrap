'use client';

import * as React from 'react';
import { Button, Input, MindMap, PageHeader, getAncestors, type MindNodeFlat } from '@ds/ui';

const EXAMPLE: MindNodeFlat[] = [
  { id: 'q1', parentId: null, label: 'Peluncuran Q1' },
  { id: 'riset', parentId: 'q1', label: 'Riset pasar', accent: 'success' },
  { id: 'produk', parentId: 'q1', label: 'Produk MVP', accent: 'info' },
  { id: 'marketing', parentId: 'q1', label: 'Marketing', accent: 'warning' },
  { id: 'wawancara', parentId: 'riset', label: 'Wawancara pengguna' },
  { id: 'kompetitor', parentId: 'riset', label: 'Analisis kompetitor' },
  { id: 'fitur', parentId: 'produk', label: 'Fitur inti' },
  { id: 'uji', parentId: 'produk', label: 'Uji kegunaan' },
  { id: 'materi', parentId: 'marketing', label: 'Materi kampanye' },
  { id: 'kanal', parentId: 'marketing', label: 'Kanal distribusi' },
  { id: 'harga', parentId: 'produk', label: 'Harga' },
  { id: 'persona', parentId: 'riset', label: 'Persona' },
];
const LARGE: MindNodeFlat[] = [
  EXAMPLE[0],
  ...Array.from({ length: 49 }, (_, index): MindNodeFlat => ({
    id: `ide-${index + 1}`,
    parentId: index < 3 ? 'q1' : `ide-${(index % 3) + 1}`,
    label: `Ide ${index + 1}`,
    ...(index < 3 ? { accent: 'primary' as const } : {}),
  })),
];
const STATES = ['Berisi', 'Contoh Q1', 'Loading', 'Empty', 'Invalid', 'Error eksternal'] as const;
type DemoState = typeof STATES[number];
const RECIPE = `const [data, setData] = useState(ideas);
const [expanded, setExpanded] = useState(parents);
const [query, setQuery] = useState('');
const studio = data.map(n => ({ ...n, title: n.label }));
const find = text => data.filter(n =>
  text.trim() && n.label.toLowerCase().includes(text.trim().toLowerCase()));
const matches = find(query);
function search(text) {
  setQuery(text);
  const paths = find(text).flatMap(n => getAncestors(studio, n.id));
  setExpanded(ids => [...new Set([...ids, ...paths])]);
}
<MindMap data={data} onChange={setData} highlightedIds={matches.map(n => n.id)}
  expandedIds={expanded} onExpandedChange={setExpanded}
  searchSlot={<label>Cari ide<input value={query} onChange={e => search(e.target.value)} /></label>} />`;

export default function MindMapPatternPage() {
  const [data, setData] = React.useState<MindNodeFlat[]>(EXAMPLE);
  const [expanded, setExpanded] = React.useState<string[]>(['q1', 'riset', 'produk', 'marketing']);
  const [query, setQuery] = React.useState('');
  const [demoState, setDemoState] = React.useState<DemoState>('Contoh Q1');
  const [dark, setDark] = React.useState(false);
  const [minimap, setMinimap] = React.useState(true);
  const [copied, setCopied] = React.useState('');
  const matches = query.trim()
    ? data.filter((node) => node.label.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id')))
    : [];

  const search = (text: string) => {
    setQuery(text);
    const normalized = text.trim().toLocaleLowerCase('id');
    if (!normalized) return;
    // Adapter hanya di batas util: getAncestors Studio memakai title, MindMap label.
    const studioNodes = data.map((node) => ({ ...node, title: node.label }));
    const ancestors = data.filter((node) => node.label.toLocaleLowerCase('id').includes(normalized))
      .flatMap((node) => getAncestors(studioNodes, node.id));
    setExpanded((current) => [...new Set([...current, ...ancestors])]);
  };
  const load = (next: MindNodeFlat[], state: DemoState) => {
    setData(next);
    setExpanded([...new Set(next.flatMap((node) => node.parentId ? [node.parentId] : []))]);
    setQuery('');
    setDemoState(state);
  };
  const selectState = (state: DemoState) => {
    if (state === 'Empty') load([], state);
    else if (state === 'Invalid') load([...EXAMPLE, { ...EXAMPLE[0] }], state);
    else if (state === 'Contoh Q1') load(EXAMPLE, state);
    else if (state === 'Berisi') load(EXAMPLE.slice(0, 4), state);
    else {
      if (demoState === 'Invalid' || demoState === 'Empty') load(EXAMPLE, state);
      else setDemoState(state);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Mind Map" description="Petakan ide, cari cabang, dan kelola hierarki tanpa meninggalkan kanvas." />
      <section aria-labelledby="mind-steps">
        <h2 id="mind-steps" className="text-lg font-semibold">Alur brainstorming</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-sm text-muted-foreground">
          <li>Buka peta Peluncuran Q1.</li>
          <li>Tambah anak atau saudara, ketik label, lalu Enter untuk menyimpan.</li>
          <li>Lipat dan buka cabang lewat Space atau expander.</li>
          <li>Hapus cabang, konfirmasi, lalu urungkan lewat Ctrl+Z.</li>
          <li>Cari label untuk membuka jalur menuju hasil.</li>
          <li>Pan, zoom, fit-view, lalu reset ke 100%.</li>
        </ol>
      </section>
      <section aria-labelledby="mind-demo" data-theme="pulse"
        className={`${dark ? 'dark' : 'light'} rounded-lg border border-border bg-background p-4 text-foreground`}
        style={{ colorScheme: dark ? 'dark' : 'light' }}>
        <h2 id="mind-demo" className="text-lg font-semibold">Demo interaktif</h2>
        <div role="group" aria-label="Panel demo" className="my-3 flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Status demo" className="flex flex-wrap gap-2 rounded-md bg-muted p-1">
            {STATES.map((state) => (
              <Button key={state} variant={demoState === state ? 'default' : 'ghost'} className="min-h-11"
                aria-pressed={demoState === state} onClick={() => selectState(state)}>{state}</Button>
            ))}
            <Button variant="ghost" className="min-h-11" onClick={() => load(LARGE, 'Berisi')}>Muat 50 node</Button>
          </div>
          <div role="group" aria-label="Tampilan demo" className="flex flex-wrap gap-2">
            <Button variant="outline" className="min-h-11" aria-pressed={dark} onClick={() => setDark(!dark)}>Mode gelap</Button>
            <Button variant="outline" className="min-h-11" aria-pressed={minimap} onClick={() => setMinimap(!minimap)}>Minimap</Button>
          </div>
        </div>
        <MindMap data={data} onChange={setData} expandedIds={expanded} onExpandedChange={setExpanded}
          highlightedIds={matches.map((node) => node.id)} loading={demoState === 'Loading'}
          error={demoState === 'Error eksternal' ? 'Perubahan belum tersimpan. Peta tetap tersedia; coba simpan lagi melalui aplikasi konsumen.' : null}
          minimap={minimap} searchSlot={<div className="mb-3">
          <label htmlFor="mind-search" className="mb-1 block text-sm font-medium">Cari ide</label>
          <Input id="mind-search" type="search" value={query} onChange={(event) => search(event.target.value)}
            disabled={demoState === 'Loading' || demoState === 'Invalid'} />
          <p role="status" aria-live="polite" data-testid="mind-search-results" className="mt-1 text-sm text-muted-foreground">
            {query.trim() ? (matches.length ? `${matches.length} hasil cocok` : 'Tidak ada hasil') : `${data.length} ide · cari berdasarkan label`}
          </p>
        </div>} />
      </section>
      <section aria-labelledby="mind-keyboard">
        <h2 id="mind-keyboard" className="text-lg font-semibold">Keyboard & aksesibilitas</h2>
        <p className="mt-2 text-sm text-muted-foreground">Node: ←/→ saudara di sisi sama, ↑ parent, ↓ anak pertama. Enter/F2 edit, Space lipat, Delete/Backspace hapus. Ctrl/Cmd+Z urungkan; Ctrl+Y atau Cmd+Shift+Z ulangi. Input teks memakai shortcut edit native.</p>
        <p className="mt-2 text-sm text-muted-foreground">Kanvas: panah pan, +/− zoom, 0 reset, F fit. Pohon aksesibel: ↑/↓ baris, → buka/anak, ← lipat/parent, Home/End awal/akhir. Buka panel pohon untuk alternatif pembaca layar. Gerakan mengikuti prefers-reduced-motion. Semua handler demo lokal, tanpa request server.</p>
      </section>
      <section aria-labelledby="mind-recipe">
        <h2 id="mind-recipe" className="text-lg font-semibold">Resep integrasi</h2>
        <pre className="my-2 overflow-x-auto rounded-md bg-muted p-4 text-sm text-foreground"><code>{RECIPE}</code></pre>
        <Button variant="outline" onClick={async () => {
          try {
            await navigator.clipboard.writeText(RECIPE);
            setCopied('Resep disalin');
          } catch { setCopied('Tidak dapat menyalin. Pilih teks resep secara manual.'); }
        }}>Salin resep</Button>
        <p role="status" className="mt-1 text-sm text-muted-foreground">{copied}</p>
      </section>
    </div>
  );
}
