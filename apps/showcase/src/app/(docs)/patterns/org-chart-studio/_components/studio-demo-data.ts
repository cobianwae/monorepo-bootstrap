import type { OrgStudioNodeFlat } from '@ds/ui';

// Dataset awal demo: 6 node, 3 tingkat, 3 departemen (ringan untuk langkah 1–6).
export const studioSeedData: OrgStudioNodeFlat[] = [
  { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Direksi', accent: 'primary' },
  { id: 'eng-head', parentId: 'ceo', title: 'Bima Prasetyo', subtitle: 'VP Engineering', badge: 'Engineering', accent: 'info' },
  { id: 'eng-fe', parentId: 'eng-head', title: 'Sari Dewi', subtitle: 'Engineering Manager Frontend', badge: 'Engineering', accent: 'info' },
  { id: 'eng-be', parentId: 'eng-head', title: 'Andi Kurniawan', subtitle: 'Engineering Manager Backend', badge: 'Engineering', accent: 'info' },
  { id: 'ops-head', parentId: 'ceo', title: 'Eko Santoso', subtitle: 'VP Operations', badge: 'Operations', accent: 'success' },
  { id: 'ops-mgr', parentId: 'ops-head', title: 'Nina Hartati', subtitle: 'Operations Manager', badge: 'Operations', accent: 'success' },
];

interface ExampleSpec {
  id: string;
  title: string;
  subtitle: string;
}

// Contoh 40 orang / 4 tingkat / 4 departemen (FR-018): 1 root + 3 VP +
// 9 manajer (3 per VP) + 27 staf (3 per manajer). Deterministik untuk demo.
const EXAMPLE_MANAGERS: Array<{ vp: ExampleSpec; vpBadge: string; managers: Array<ExampleSpec & { staff: ExampleSpec[] }> }> = [
  {
    vp: { id: 'eng-head', title: 'Bima Prasetyo', subtitle: 'VP Engineering' },
    vpBadge: 'Engineering',
    managers: [
      {
        id: 'eng-fe', title: 'Sari Dewi', subtitle: 'Engineering Manager Frontend',
        staff: [
          { id: 'fe-1', title: 'Dita Anggraini', subtitle: 'Senior Frontend Engineer' },
          { id: 'fe-2', title: 'Rizky Ramadhan', subtitle: 'Frontend Engineer' },
          { id: 'fe-3', title: 'Putri Ayu Lestari', subtitle: 'Frontend Engineer' },
        ],
      },
      {
        id: 'eng-be', title: 'Andi Kurniawan', subtitle: 'Engineering Manager Backend',
        staff: [
          { id: 'be-1', title: 'Fajar Nugroho', subtitle: 'Senior Backend Engineer' },
          { id: 'be-2', title: 'Maya Kusuma', subtitle: 'Backend Engineer' },
          { id: 'be-3', title: 'Hendra Gunawan', subtitle: 'Platform Engineer' },
        ],
      },
      {
        id: 'eng-plat', title: 'Bagas Firmansyah', subtitle: 'Engineering Manager Platform',
        staff: [
          { id: 'pl-1', title: 'Intan Permata', subtitle: 'DevOps Engineer' },
          { id: 'pl-2', title: 'Yoga Saputra', subtitle: 'QA Engineer' },
          { id: 'pl-3', title: 'Lina Marlina', subtitle: 'QA Lead' },
        ],
      },
    ],
  },
  {
    vp: { id: 'ops-head', title: 'Eko Santoso', subtitle: 'VP Operations' },
    vpBadge: 'Operations',
    managers: [
      {
        id: 'ops-log', title: 'Nina Hartati', subtitle: 'Logistics Manager',
        staff: [
          { id: 'lg-1', title: 'Dedi Supriadi', subtitle: 'Warehouse Lead' },
          { id: 'lg-2', title: 'Wulan Sari', subtitle: 'Inventory Staff' },
          { id: 'lg-3', title: 'Agus Setiawan', subtitle: 'Courier Coordinator' },
        ],
      },
      {
        id: 'ops-cs', title: 'Rina Marlina', subtitle: 'Customer Success Manager',
        staff: [
          { id: 'cs-1', title: 'Tania Putri', subtitle: 'CS Specialist' },
          { id: 'cs-2', title: 'Farhan Aziz', subtitle: 'CS Specialist' },
          { id: 'cs-3', title: 'Sinta Bella', subtitle: 'Onboarding Specialist' },
        ],
      },
      {
        id: 'ops-fin', title: 'Joko Prayogo', subtitle: 'Finance Manager',
        staff: [
          { id: 'fn-1', title: 'Ratna Sari', subtitle: 'Accountant' },
          { id: 'fn-2', title: 'Budi Hartono', subtitle: 'Payroll Staff' },
          { id: 'fn-3', title: 'Mega Lestari', subtitle: 'Auditor' },
        ],
      },
    ],
  },
  {
    vp: { id: 'ppl-head', title: 'Dian Puspita', subtitle: 'VP People' },
    vpBadge: 'People',
    managers: [
      {
        id: 'ppl-ta', title: 'Rudi Hermawan', subtitle: 'Talent Acquisition Manager',
        staff: [
          { id: 'ta-1', title: 'Anisa Rahma', subtitle: 'Recruiter' },
          { id: 'ta-2', title: 'Galih Pratama', subtitle: 'Sourcer' },
          { id: 'ta-3', title: 'Nadia Fitri', subtitle: 'Employer Branding' },
        ],
      },
      {
        id: 'ppl-hr', title: 'Sari Wulandari', subtitle: 'HR Operations Manager',
        staff: [
          { id: 'hr-1', title: 'Dimas Aryo', subtitle: 'HR Generalist' },
          { id: 'hr-2', title: 'Kirana Dewi', subtitle: 'Compensation Analyst' },
          { id: 'hr-3', title: 'Ilham Maulana', subtitle: 'HR Admin' },
        ],
      },
      {
        id: 'ppl-lnd', title: 'Fitri Handayani', subtitle: 'Learning Manager',
        staff: [
          { id: 'ln-1', title: 'Eka Prasetya', subtitle: 'Trainer' },
          { id: 'ln-2', title: 'Yuni Astuti', subtitle: 'Content Designer' },
          { id: 'ln-3', title: 'Reza Fahlevi', subtitle: 'Coach' },
        ],
      },
    ],
  },
];

const EXAMPLE_ACCENTS = ['primary', 'info', 'success', 'warning'] as const;

export function buildStudioExample40(): OrgStudioNodeFlat[] {
  const nodes: OrgStudioNodeFlat[] = [
    { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Direksi', accent: 'primary' },
  ];
  for (const group of EXAMPLE_MANAGERS) {
    nodes.push({ ...group.vp, parentId: 'ceo', badge: group.vpBadge, accent: 'info' });
    for (const manager of group.managers) {
      nodes.push({ id: manager.id, title: manager.title, subtitle: manager.subtitle, parentId: group.vp.id, badge: group.vpBadge, accent: 'info' });
      for (const member of manager.staff) {
        nodes.push({ ...member, parentId: manager.id, badge: group.vpBadge, accent: 'info' });
      }
    }
  }
  // Aksen strip per departemen agar audit kontras §7 teramati di contoh penuh.
  return nodes.map((node, index) => ({
    ...node,
    accent: node.parentId === null ? 'primary' : EXAMPLE_ACCENTS[(index % (EXAMPLE_ACCENTS.length - 1)) + 1] ?? 'info',
  }));
}

export type StudioInvalidKind = 'duplikat' | 'parent-hilang' | 'siklus';

// Dataset invalid untuk demo state error terstruktur (penyebab + id + salin).
export function buildStudioInvalid(kind: StudioInvalidKind): OrgStudioNodeFlat[] {
  if (kind === 'duplikat') {
    return [
      { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer' },
      { id: 'eng-head', parentId: 'ceo', title: 'Bima Prasetyo', subtitle: 'VP Engineering' },
      { id: 'eng-head', parentId: 'ceo', title: 'Ganda', subtitle: 'ID sama' },
    ];
  }
  if (kind === 'parent-hilang') {
    return [
      { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer' },
      { id: 'orphan-1', parentId: 'tidak-ada', title: 'Yatim', subtitle: 'Parent hilang' },
    ];
  }
  return [
    { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer' },
    { id: 'a-1', parentId: 'b-1', title: 'Node A', subtitle: 'Siklus via B' },
    { id: 'b-1', parentId: 'a-1', title: 'Node B', subtitle: 'Siklus via A' },
  ];
}

// Kotak resep integrasi 15 baris: fetch → data, onChange → POST (FR-014).
export const STUDIO_RECIPE_LINES: string[] = [
  '// Resep konsumen: fetch → data, onChange → POST',
  'const [data, setData] = useState<OrgStudioNodeFlat[]>([]);',
  'useEffect(() => {',
  '  fetch(`/api/org`).then((r) => r.json()).then(setData);',
  '}, []);',
  'async function handleChange(next: OrgStudioNodeFlat[]) {',
  '  setData(next); // optimistis, sekali per commit',
  '  await fetch(`/api/org`, {',
  '    method: `POST`, headers: { `content-type`: `application/json` },',
  '    body: JSON.stringify(next),',
  '  });',
  '}',
  '<OrgChartStudio data={data} onChange={handleChange} />',
  '// Cari milik konsumen: highlightedIds + getAncestors.',
  '// Undo/redo + toast Urungkan sudah di dalam komponen.',
];

export const STUDIO_STEPS: Array<{ title: string; detail: string }> = [
  { title: 'Buka kanvas', detail: 'Struktur rapi langsung terbaca: root di atas, anak menyebar seimbang. Panel detail tidak terbuka sendiri.' },
  { title: 'Tambah bawahan inline', detail: 'Klik kartu CEO (terpilih, gagang + muncul menetap) → klik + bawah (tooltip “Tambah bawahan”) → ketik nama → Enter simpan (Esc batal). Kanvas otomatis memusatkan ke kartu baru. Gagang + samping = tambah sejawat. Tanpa buka form.' },
  { title: 'Pindah node', detail: 'Seret kartu ke tim lain (garis hijau + preview path) atau dialog M-007 via panel — setara keyboard.' },
  { title: 'Hapus + Urungkan', detail: 'Delete membuka M-008 (sebut N turunan, root diproteksi) → konfirmasi → toast “Dihapus — Urungkan”.' },
  { title: 'Cari orang', detail: 'Ketik nama/jabatan di pencarian → sorot ring + badge Cocok + path ancestor terbuka + live region jumlah.' },
  { title: 'Reset demo', detail: 'Tombol Reset demo mengembalikan dataset awal 6 node, membersihkan pencarian, dan menutup error eksternal.' },
];
