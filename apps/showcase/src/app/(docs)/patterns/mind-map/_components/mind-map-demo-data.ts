import type { MindNodeFlat } from '@ds/ui';

export const EXAMPLE: MindNodeFlat[] = [
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

export const LARGE: MindNodeFlat[] = [
  EXAMPLE[0],
  ...Array.from({ length: 49 }, (_, index): MindNodeFlat => ({
    id: `ide-${index + 1}`,
    parentId: index < 3 ? 'q1' : `ide-${(index % 3) + 1}`,
    label: `Ide ${index + 1}`,
    ...(index < 3 ? { accent: 'primary' as const } : {}),
  })),
];

export const STATES = ['Berisi', 'Contoh Q1', 'Loading', 'Empty', 'Invalid', 'Error eksternal'] as const;
export type DemoState = typeof STATES[number];

export const STEPS: Array<{ title: string; detail: string }> = [
  { title: 'Mulai', detail: 'Buka peta Peluncuran Q1.' },
  { title: 'Tambah ide', detail: 'Tambah cabang atau saudara, ketik nama ide, lalu Enter untuk menyimpan.' },
  { title: 'Lipat', detail: 'Lipat dan buka cabang lewat Space atau expander.' },
  { title: 'Hapus', detail: 'Hapus cabang, konfirmasi, lalu urungkan lewat Ctrl+Z.' },
  { title: 'Cari', detail: 'Cari nama ide untuk membuka jalur menuju hasil.' },
  { title: 'Navigasi', detail: 'Pan, zoom, fit-view, lalu reset ke 100%.' },
];

export const RECIPE = `const [data, setData] = useState(ideas);
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
