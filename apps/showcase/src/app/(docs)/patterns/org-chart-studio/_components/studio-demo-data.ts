import type { OrgStudioNodeFlat } from '@ds/ui';

// Seed dataset: 6 nodes, 3 levels, 3 departments (light enough for the guided steps).
export const studioSeedData: OrgStudioNodeFlat[] = [
  { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Executive', accent: 'primary' },
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

// 40 people / 4 levels / 4 departments: 1 root + 3 VPs + 9 managers (3 per VP)
// + 27 staff (3 per manager). Deterministic for the demo.
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
    { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Executive', accent: 'primary' },
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
  // Vary the accent strip so contrast is observable across the full example.
  return nodes.map((node, index) => ({
    ...node,
    accent: node.parentId === null ? 'primary' : EXAMPLE_ACCENTS[(index % (EXAMPLE_ACCENTS.length - 1)) + 1] ?? 'info',
  }));
}

export type StudioInvalidKind = 'duplicate' | 'missing-parent' | 'cycle';

// Invalid datasets for the structured error state (cause + id + copy).
export function buildStudioInvalid(kind: StudioInvalidKind): OrgStudioNodeFlat[] {
  if (kind === 'duplicate') {
    return [
      { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer' },
      { id: 'eng-head', parentId: 'ceo', title: 'Bima Prasetyo', subtitle: 'VP Engineering' },
      { id: 'eng-head', parentId: 'ceo', title: 'Duplicate', subtitle: 'Same ID' },
    ];
  }
  if (kind === 'missing-parent') {
    return [
      { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer' },
      { id: 'orphan-1', parentId: 'does-not-exist', title: 'Orphan', subtitle: 'Missing parent' },
    ];
  }
  return [
    { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer' },
    { id: 'a-1', parentId: 'b-1', title: 'Node A', subtitle: 'Cycle via B' },
    { id: 'b-1', parentId: 'a-1', title: 'Node B', subtitle: 'Cycle via A' },
  ];
}

// Integration recipe shown in the CodeBlock: fetch -> data, onChange -> POST.
export const STUDIO_RECIPE = `// Consumer recipe: fetch -> data, onChange -> POST
const [data, setData] = useState<OrgStudioNodeFlat[]>([]);

useEffect(() => {
  fetch('/api/org').then((r) => r.json()).then(setData);
}, []);

async function handleChange(next: OrgStudioNodeFlat[]) {
  setData(next); // optimistic, once per commit
  await fetch('/api/org', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(next),
  });
}

<OrgChartStudio data={data} onChange={handleChange} />
// Search is yours: compute highlightedIds from your own query.
// Undo/redo and the "Undo" toast are built in.`;

export const STUDIO_STEPS: Array<{ title: string; detail: string }> = [
  { title: 'Read the chart', detail: 'The root sits on top and children spread evenly below. No panel opens until you ask for one.' },
  { title: 'Add a report inline', detail: 'Click the CEO card, then the + below it ("Add report"), type a name and press Enter (Esc cancels). The canvas centres on the new card. The side + adds a peer.' },
  { title: 'Move a person', detail: 'Drag a card onto another team (a green line previews the new path), or use the Move dialog from the detail panel. Both work from the keyboard.' },
  { title: 'Delete and undo', detail: 'Press Delete to open a confirmation that states how many reports go with it (the root is protected). Confirm, then use Undo in the toast.' },
  { title: 'Find someone', detail: 'Type a name, title or department. Matches get a ring and a "Match" badge, their ancestors expand, and the count is announced.' },
  { title: 'Start over', detail: 'Reset demo restores the 6-person seed, clears search and dismisses the external error.' },
];
