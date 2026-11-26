import type { MindNodeFlat } from '@ds/ui';

export const EXAMPLE: MindNodeFlat[] = [
  { id: 'q1', parentId: null, label: 'Q1 Launch' },
  { id: 'riset', parentId: 'q1', label: 'Market research', accent: 'success' },
  { id: 'produk', parentId: 'q1', label: 'MVP product', accent: 'info' },
  { id: 'marketing', parentId: 'q1', label: 'Marketing', accent: 'warning' },
  { id: 'wawancara', parentId: 'riset', label: 'User interviews' },
  { id: 'kompetitor', parentId: 'riset', label: 'Competitor analysis' },
  { id: 'fitur', parentId: 'produk', label: 'Core features' },
  { id: 'uji', parentId: 'produk', label: 'Usability tests' },
  { id: 'materi', parentId: 'marketing', label: 'Campaign materials' },
  { id: 'kanal', parentId: 'marketing', label: 'Distribution channels' },
  { id: 'harga', parentId: 'produk', label: 'Pricing' },
  { id: 'persona', parentId: 'riset', label: 'Personas' },
];

export const LARGE: MindNodeFlat[] = [
  EXAMPLE[0],
  ...Array.from({ length: 49 }, (_, index): MindNodeFlat => ({
    id: `idea-${index + 1}`,
    parentId: index < 3 ? 'q1' : `idea-${(index % 3) + 1}`,
    label: `Idea ${index + 1}`,
    ...(index < 3 ? { accent: 'primary' as const } : {}),
  })),
];

export const STATES = ['Populated', 'Q1 example', 'Loading', 'Empty', 'Invalid', 'External error'] as const;
export type DemoState = typeof STATES[number];

export const STEPS: Array<{ title: string; detail: string }> = [
  { title: 'Start', detail: 'Open the Q1 Launch map.' },
  { title: 'Add an idea', detail: 'Add a branch or sibling, type the idea name, then press Enter to save it.' },
  { title: 'Collapse', detail: 'Collapse and expand branches with Space or the expander.' },
  { title: 'Delete', detail: 'Delete a branch, confirm, then undo with Ctrl+Z.' },
  { title: 'Search', detail: 'Search idea names to open the path to a result.' },
  { title: 'Navigate', detail: 'Pan, zoom, fit view, then reset to 100%.' },
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
  searchSlot={<label>Search ideas<input value={query} onChange={e => search(e.target.value)} /></label>} />`;
