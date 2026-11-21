import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '../feedback/toaster';
import {
  OrgChartStudio,
  applyDelete,
  computeStudioPositions,
  getAncestors,
  getDescendants,
  isValidMove,
  normalizeStudioInput,
  pushHistoryCapped,
  toStudioFlowEdges,
  STUDIO_UNDO_LIMIT,
  type OrgStudioInput,
} from './org-chart-studio';

const mockFitView = vi.fn();
const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();
const mockSetViewport = vi.fn();

vi.mock('@xyflow/react', async (importOriginal) => {
  const xyflow = (await importOriginal()) as Record<string, unknown>;
  return {
    ...xyflow,
    useReactFlow: () => ({
      zoomIn: mockZoomIn,
      zoomOut: mockZoomOut,
      fitView: mockFitView,
      setViewport: mockSetViewport,
      getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
    }),
  };
});

const flatData: OrgStudioInput = [
  { id: 'ceo', parentId: null, title: 'Direktur Utama', subtitle: 'Chief Executive Officer', badge: 'Engineering', accent: 'primary' },
  { id: 'cto', parentId: 'ceo', title: 'CTO' },
  { id: 'cfo', parentId: 'ceo', title: 'CFO' },
  { id: 'eng', parentId: 'cto', title: 'Engineer' },
];

const nestedData: OrgStudioInput = {
  id: 'ceo',
  title: 'Direktur Utama',
  subtitle: 'Chief Executive Officer',
  badge: 'Engineering',
  accent: 'primary',
  children: [
    { id: 'cto', title: 'CTO', children: [{ id: 'eng', title: 'Engineer' }] },
    { id: 'cfo', title: 'CFO' },
  ],
};

function nodeIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-testid="org-studio-node"]')).map(
    (el) => el.getAttribute('data-node-id') ?? '',
  );
}

describe('OrgChartStudio fondasi (011-01)', () => {
  beforeEach(() => {
    mockFitView.mockClear();
    mockZoomIn.mockClear();
    mockZoomOut.mockClear();
    mockSetViewport.mockClear();
  });

  it('AC-01: flat dan nested render identik (urutan anak stabil)', () => {
    const flat = render(<OrgChartStudio data={flatData} />);
    const flatIds = nodeIds(flat.container);
    flat.unmount();
    const nested = render(<OrgChartStudio data={nestedData} />);
    const nestedIds = nodeIds(nested.container);
    expect(nestedIds.sort()).toEqual(flatIds.sort());
    expect(flatIds.sort()).toEqual(['ceo', 'cfo', 'cto', 'eng']);
    nested.unmount();
    const flatNorm = normalizeStudioInput(flatData);
    const nestedNorm = normalizeStudioInput(nestedData);
    const visible = new Set(['ceo', 'cto', 'cfo', 'eng']);
    expect(computeStudioPositions(nestedNorm, visible)).toEqual(computeStudioPositions(flatNorm, visible));
  });

  it.each([
    ['duplikat', [{ id: 'a', parentId: null, title: 'A' }, { id: 'a', parentId: null, title: 'A2' }], 'a'],
    ['parent hilang', [{ id: 'a', parentId: null, title: 'A' }, { id: 'b', parentId: 'hilang', title: 'B' }], 'b'],
    ['siklus', [{ id: 'a', parentId: 'b', title: 'A' }, { id: 'b', parentId: 'a', title: 'B' }], 'a'],
    [
      'root berlebih',
      [
        { id: 'a', parentId: null, title: 'A' },
        { id: 'b', parentId: null, title: 'B' },
      ],
      'b',
    ],
  ])('AC-01: invalid %s ditolak terstruktur (penyebab + id pertama, tanpa throw)', (_label, data, nodeId) => {
    const { container } = render(<OrgChartStudio data={data as OrgStudioInput} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain(nodeId);
    expect(container.querySelector('[data-testid="org-studio-node"]')).toBeNull();
  });

  it('AC-02: layout balanced-tidy deterministik (slot 240×84, gap 32, level 64, parent center)', () => {
    const normalized = normalizeStudioInput(flatData);
    expect(normalized.error).toBeNull();
    const visible = new Set(['ceo', 'cto', 'cfo', 'eng']);
    const first = computeStudioPositions(normalized, visible);
    const second = computeStudioPositions(normalized, visible);
    expect(first).toEqual(second);
    const byId = new Map(first.map((p) => [p.id, p]));
    const ceo = byId.get('ceo');
    const cto = byId.get('cto');
    const cfo = byId.get('cfo');
    const eng = byId.get('eng');
    expect(ceo).toEqual({ id: 'ceo', x: 152, y: 0 });
    expect(cto?.y).toBe(148);
    expect(eng?.y).toBe(296);
    expect(cfo?.y).toBe(148);
    // Parent center di atas rentang anak: ceo di tengah antara cto dan cfo.
    expect((ceo?.x ?? 0) + 120).toBeCloseTo(((cto?.x ?? 0) + 120 + ((cfo?.x ?? 0) + 120)) / 2);
    // Tidak ada kolom kosong: dua anak cto/cfo berdampingan tanpa celah > 1 slot.
    expect(Math.abs((cfo?.x ?? 0) - (eng?.x ?? 0))).toBeLessThanOrEqual(2 * 272);
  });

  it('AC-02: tree kecil 1 node tetap di asal', () => {
    const normalized = normalizeStudioInput([{ id: 'r', parentId: null, title: 'R' }]);
    const positions = computeStudioPositions(normalized, new Set(['r']));
    expect(positions).toEqual([{ id: 'r', x: 16, y: 0 }]);
  });

  it('AC-03: kartu lega 240×84 — nama tooltip, badge tidak truncate, strip aksen', () => {
    const { container } = render(<OrgChartStudio data={flatData} />);
    const ceo = container.querySelector('[data-node-id="ceo"]');
    expect(ceo).not.toBeNull();
    expect(ceo?.getAttribute('title')).toContain('Chief Executive Officer');
    expect(ceo?.getAttribute('title')).toContain('Engineering');
    expect(ceo?.querySelector('[data-testid="org-studio-accent-strip"]')).not.toBeNull();
    const badge = ceo?.querySelector('[class*="badge" i]');
    expect(ceo?.textContent).toContain('Engineering');
    expect(badge?.className ?? '').not.toContain('truncate');
    expect(ceo?.className).toContain('w-[240px]');
    expect(ceo?.className).toContain('h-[84px]');
  });

  it('AC-03: edge smoothstep 1px token border', () => {
    const normalized = normalizeStudioInput(flatData);
    const edges = toStudioFlowEdges(normalized, new Set(['ceo', 'cto', 'cfo', 'eng']));
    expect(edges).toHaveLength(3);
    for (const edge of edges) {
      expect(edge.type).toBe('smoothstep');
      expect(edge.style).toEqual({ strokeWidth: 1, stroke: 'var(--border)' });
    }
  });

  it('AC-04: reset 100% memakai setViewport dan fit memakai fitView', () => {
    render(<OrgChartStudio data={flatData} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(mockSetViewport).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(mockZoomIn).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Fit view' }));
    expect(mockFitView).toHaveBeenCalledWith({ padding: 0.2 });
  });

  it('AC-04: keyboard + - 0 F memicu zoom yang sesuai', () => {
    const { container } = render(<OrgChartStudio data={flatData} />);
    const canvas = container.querySelector('[role="application"]') as HTMLElement;
    expect(canvas).not.toBeNull();
    const canvasBox = canvas.querySelector('.react-flow') ?? canvas;
    fireEvent.keyDown(canvasBox, { key: '+' });
    expect(mockZoomIn).toHaveBeenCalled();
    fireEvent.keyDown(canvasBox, { key: '-' });
    expect(mockZoomOut).toHaveBeenCalled();
    fireEvent.keyDown(canvasBox, { key: '0' });
    expect(mockSetViewport).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1 });
    fireEvent.keyDown(canvasBox, { key: 'f' });
    expect(mockFitView).toHaveBeenCalledWith({ padding: 0.2 });
  });

  it('AC-04: expand uncontrolled menyembunyikan subtree', () => {
    const { container } = render(
      <OrgChartStudio data={flatData} defaultExpandedIds={['cto']} />,
    );
    expect(nodeIds(container)).toEqual(['ceo', 'cto', 'cfo']);
    const toggle = screen.getByRole('button', { name: 'Perluas CTO' });
    fireEvent.click(toggle);
    expect(nodeIds(container)).toEqual(['ceo', 'cto', 'cfo', 'eng']);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse CTO' }));
    expect(nodeIds(container)).toEqual(['ceo', 'cto', 'cfo']);
  });

  it('AC-04: expanded controlled konsisten via onExpandedChange', () => {
    const onExpandedChange = vi.fn();
    render(
      <OrgChartStudio
        data={flatData}
        expandedIds={['ceo', 'cto']}
        onExpandedChange={onExpandedChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Collapse CTO' }));
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange.mock.calls[0][0]).toEqual(['ceo']);
  });

  it('getAncestors mengembalikan path root → induk', () => {
    const flat = [
      { id: 'ceo', parentId: null, title: 'CEO' },
      { id: 'cto', parentId: 'ceo', title: 'CTO' },
      { id: 'eng', parentId: 'cto', title: 'Engineer' },
    ];
    expect(getAncestors(flat, 'eng')).toEqual(['ceo', 'cto']);
  });

  it('loading menampilkan skeleton 240×84 dan empty menampilkan CTA', () => {
    const loading = render(<OrgChartStudio data={flatData} loading />);
    expect(loading.container.querySelectorAll('[data-testid="org-studio-skeleton-box"]')).toHaveLength(8);
    expect(loading.container.querySelector('[aria-busy="true"]')).not.toBeNull();
    loading.unmount();
    const onEmptyAction = vi.fn();
    const empty = render(<OrgChartStudio data={[]} onEmptyAction={onEmptyAction} />);
    expect(empty.container.querySelector('[role="status"]')).not.toBeNull();
    const button = empty.container.querySelector('button');
    expect(button?.textContent).toBe('Buat root');
    fireEvent.click(button as HTMLElement);
    expect(onEmptyAction).toHaveBeenCalled();
    empty.unmount();
  });
});

describe('OrgChartStudio tambah 1-klik + panel detail (011-02)', () => {
  function ControlledStudio({
    initial = flatData,
    onChangeSpy,
    minimap = true,
  }: {
    initial?: OrgStudioInput;
    onChangeSpy?: (next: { id: string; parentId: string | null; title: string }[]) => void;
    minimap?: boolean;
  }) {
    const [data, setData] = React.useState(initial);
    return (
      <OrgChartStudio
        data={data}
        minimap={minimap}
        onChange={(next) => {
          onChangeSpy?.(next);
          setData(next);
        }}
      />
    );
  }

  function addChildViaHandle(container: HTMLElement, parentId: string): void {
    fireEvent.click(container.querySelector(`[data-testid="org-studio-add-child-${parentId}"]`) as HTMLElement);
  }

  function commitViaEnter(input: HTMLElement, title: string): void {
    fireEvent.change(input, { target: { value: title } });
    fireEvent.keyDown(input, { key: 'Enter' });
  }

  it('AC-01: gagang bawah → inline-edit fokus → Enter commit sorotan, onChange sekali, panel tidak terbuka', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    addChildViaHandle(container, 'ceo');
    const input = container.querySelector('[data-testid="org-studio-inline-input-studio-baru-1"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(container.querySelector('[data-testid="org-studio-detail-path"]')).toBeNull();
    commitViaEnter(input, 'Staff Baru');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; parentId: string | null; title: string }[];
    expect(next).toHaveLength(5);
    expect(next.find((node) => node.id === 'studio-baru-1')).toEqual({
      id: 'studio-baru-1',
      parentId: 'ceo',
      title: 'Staff Baru',
    });
    const created = container.querySelector('[data-node-id="studio-baru-1"]');
    expect(created).not.toBeNull();
    expect(created?.getAttribute('data-new')).toBe('true');
    expect(created?.textContent).toContain('Staff Baru');
    // Tambah yang di-commit tidak pernah membuka panel.
    expect(screen.queryByText(/Panel detail on-demand/)).toBeNull();
    expect(document.activeElement?.getAttribute('data-node-id')).toBe('studio-baru-1');
  });

  it('AC-01: gagang samping menambah sejawat dengan parent yang sama; root tidak punya gagang sejawat', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    expect(container.querySelector('[data-testid="org-studio-add-sibling-ceo"]')).toBeNull();
    fireEvent.click(container.querySelector('[data-testid="org-studio-add-sibling-cto"]') as HTMLElement);
    const input = container.querySelector('[data-testid="org-studio-inline-input-studio-baru-1"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    commitViaEnter(input, 'Sejawat CTO');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; parentId: string | null; title: string }[];
    expect(next.find((node) => node.id === 'studio-baru-1')?.parentId).toBe('ceo');
  });

  it('AC-02: Esc membuang kartu tanpa onChange dan fokus kembali ke parent', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    addChildViaHandle(container, 'ceo');
    const input = container.querySelector('[data-testid="org-studio-inline-input-studio-baru-1"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Batal' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(container.querySelector('[data-node-id="studio-baru-1"]')).toBeNull();
    expect(document.activeElement?.getAttribute('data-node-id')).toBe('ceo');
  });

  it('AC-02: nama kosong ditolak inline (aria-invalid + pesan, tetap edit); blur dengan valid menyimpan', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    addChildViaHandle(container, 'ceo');
    const input = container.querySelector('[data-testid="org-studio-inline-input-studio-baru-1"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Nama tidak boleh kosong');
    expect(container.querySelector('[data-testid="org-studio-inline-input-studio-baru-1"]')).not.toBeNull();
    fireEvent.change(input, { target: { value: 'Via Blur' } });
    fireEvent.blur(input);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; title: string }[];
    expect(next.find((node) => node.id === 'studio-baru-1')?.title).toBe('Via Blur');
  });

  it('AC-03: panel hanya terbuka via [≡]/double-click/Shift+Enter dan berisi breadcrumb, meta, dan form edit', async () => {
    const { container } = render(<ControlledStudio minimap={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Detail CTO' }));
    // Panel terbuka (query role/text dipengaruhi aria-hidden Radix di jsdom,
    // sehingga assertion memakai testid + textContent; state sudah ter-flush
    // oleh fireEvent/act sehingga query sinkron cukup).
    expect(screen.queryByTestId('org-studio-detail-title')).not.toBeNull();
    expect(screen.getByTestId('org-studio-detail-path').textContent).toContain('Direktur Utama / CTO');
    expect(screen.getByTestId('org-studio-detail-meta').textContent).toContain('Atasan');
    expect(screen.getByTestId('org-studio-detail-meta').textContent).toContain('Anak');
    expect(screen.getByTestId('org-studio-detail-title')).not.toBeNull();
    expect(screen.getByTestId('org-studio-detail-subtitle')).not.toBeNull();
    expect(screen.getByTestId('org-studio-detail-badge')).not.toBeNull();
    // 011-03: tombol pindah/hapus panel aktif (M-007/M-008); root tetap diproteksi.
    expect((screen.getByTestId('org-studio-detail-move') as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByTestId('org-studio-detail-delete') as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(screen.queryByTestId('org-studio-detail-title')).toBeNull();
    // double-click membuka panel (query ulang: node di-render ulang)
    const ctoCardAgain = container.querySelector('[data-node-id="cto"]') as HTMLElement;
    fireEvent.doubleClick(ctoCardAgain);
    expect(screen.queryByTestId('org-studio-detail-title')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    // Shift+Enter membuka panel
    const ctoCardLatest = container.querySelector('[data-node-id="cto"]') as HTMLElement;
    fireEvent.keyDown(ctoCardLatest, { key: 'Enter', shiftKey: true });
    expect(screen.queryByTestId('org-studio-detail-title')).not.toBeNull();
  });

  it('AC-03/AC-04: simpan panel commit sekali via onChange; nama kosong ditolak', () => {
    const onChangeSpy = vi.fn();
    render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Detail CFO' }));
    const titleInput = screen.getByTestId('org-studio-detail-title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: '  ' } });
    fireEvent.click(screen.getByTestId('org-studio-detail-save'));
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(titleInput.getAttribute('aria-invalid')).toBe('true');
    fireEvent.change(titleInput, { target: { value: 'CFO Baru' } });
    fireEvent.click(screen.getByTestId('org-studio-detail-save'));
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; title: string }[];
    expect(next.find((node) => node.id === 'cfo')?.title).toBe('CFO Baru');
  });

  it('AC-04: hit-area gagang 44px dengan visual 24px', () => {
    const { container } = render(<OrgChartStudio data={flatData} />);
    const handle = container.querySelector('[data-testid="org-studio-add-child-ceo"]') as HTMLElement;
    expect(handle.className).toContain('h-11');
    expect(handle.className).toContain('w-11');
    const visual = handle.querySelector('span') as HTMLElement;
    expect(visual.className).toContain('h-6');
    expect(visual.className).toContain('w-6');
    expect(screen.getByRole('button', { name: 'Tambah bawahan untuk Direktur Utama' })).not.toBeNull();
  });

  it('AC-04: toast "Ditambah — Urungkan" memanggil undo mengembalikan snapshot asal', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(
      <>
        <ControlledStudio onChangeSpy={onChangeSpy} />
        <Toaster />
      </>,
    );
    addChildViaHandle(container, 'ceo');
    const input = container.querySelector('[data-testid="org-studio-inline-input-studio-baru-1"]') as HTMLInputElement;
    commitViaEnter(input, 'Staff Baru');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    // Toast terbaru paling akhir di DOM (Toaster merender urutan store); abaikan toast sisa test lain.
    const undoButtons = within(document.body).getAllByRole('button', { name: 'Urungkan' });
    fireEvent.click(undoButtons[undoButtons.length - 1]);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    const undone = onChangeSpy.mock.calls[1][0] as { id: string }[];
    expect(undone).toHaveLength(4);
    expect(undone.find((node) => node.id === 'studio-baru-1')).toBeUndefined();
  });
});

describe('OrgChartStudio pindah/hapus/undo (011-03)', () => {
  function ControlledStudio({
    initial = flatData,
    onChangeSpy,
  }: {
    initial?: OrgStudioInput;
    onChangeSpy?: (next: { id: string; parentId: string | null; title: string }[]) => void;
  }) {
    const [data, setData] = React.useState(initial);
    return (
      <OrgChartStudio
        data={data}
        onChange={(next) => {
          onChangeSpy?.(next);
          setData(next);
        }}
      />
    );
  }

  function dragTo(container: HTMLElement, sourceId: string, targetId: string): void {
    const source = container.querySelector(`[data-node-id="${sourceId}"]`) as HTMLElement;
    const target = container.querySelector(`[data-node-id="${targetId}"]`) as HTMLElement;
    fireEvent.dragStart(source);
    fireEvent.dragOver(target);
    fireEvent.drop(target);
    fireEvent.dragEnd(source);
  }

  function openPanel(container: HTMLElement, nodeId: string, title: string): void {
    const card = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
    fireEvent.click(card);
    fireEvent.click(screen.getByRole('button', { name: `Detail ${title}` }));
  }

  it('helper: isValidMove menolak diri/descendant/no-op dan menerima valid', () => {
    const flat = flatData as unknown as Parameters<typeof isValidMove>[0];
    expect(isValidMove(flat, 'cto', 'cto').valid).toBe(false);
    expect(isValidMove(flat, 'cto', 'cto').reason).toContain('diri sendiri');
    expect(isValidMove(flat, 'ceo', 'eng').valid).toBe(false);
    expect(isValidMove(flat, 'ceo', 'eng').reason).toContain('siklus');
    expect(isValidMove(flat, 'cto', 'ceo').valid).toBe(false);
    expect(isValidMove(flat, 'eng', 'cfo').valid).toBe(true);
    expect(getDescendants(flat, 'ceo').sort()).toEqual(['cfo', 'cto', 'eng']);
  });

  it('helper: applyDelete reparent vs subtree; root diproteksi', () => {
    const flat = flatData as unknown as Parameters<typeof applyDelete>[0];
    const reparented = applyDelete(flat, 'cto', 'reparent') as { id: string; parentId: string | null }[];
    expect(reparented.find((n) => n.id === 'cto')).toBeUndefined();
    expect(reparented.find((n) => n.id === 'eng')?.parentId).toBe('ceo');
    const subtree = applyDelete(flat, 'cto', 'subtree') as { id: string }[];
    expect(subtree.map((n) => n.id).sort()).toEqual(['ceo', 'cfo']);
    expect(applyDelete(flat, 'ceo', 'subtree')).toHaveLength(4);
  });

  it('helper: pushHistoryCapped membatasi 50 snapshot', () => {
    let past: { id: string }[][] = [];
    for (let i = 0; i < STUDIO_UNDO_LIMIT + 10; i += 1) {
      past = pushHistoryCapped(past as never, [{ id: `s-${i}` }] as never) as unknown as {
        id: string;
      }[][];
    }
    expect(past).toHaveLength(STUDIO_UNDO_LIMIT);
    expect(past[0][0].id).toBe('s-10');
  });

  it('AC-01: drag valid memindah + satu onChange + preview path + live region', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    const source = container.querySelector('[data-node-id="eng"]') as HTMLElement;
    const target = container.querySelector('[data-node-id="cfo"]') as HTMLElement;
    fireEvent.dragStart(source);
    fireEvent.dragOver(target);
    expect(target.getAttribute('data-drop')).toBe('valid');
    expect(screen.getByTestId('org-studio-drag-feedback').textContent).toContain('Lepas untuk pindah');
    expect(screen.getByTestId('org-studio-drag-feedback').textContent).toContain(
      'Direktur Utama / CFO / Engineer',
    );
    fireEvent.drop(target);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; parentId: string | null }[];
    expect(next.find((n) => n.id === 'eng')?.parentId).toBe('cfo');
    expect(screen.getByTestId('org-studio-live').textContent).toContain('dipindah ke');
    fireEvent.dragEnd(source);
  });

  it('AC-01: drag invalid (ke descendant) ditolak + alert + tanpa onChange', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    const source = container.querySelector('[data-node-id="cto"]') as HTMLElement;
    const target = container.querySelector('[data-node-id="eng"]') as HTMLElement;
    fireEvent.dragStart(source);
    fireEvent.dragOver(target);
    expect(target.getAttribute('data-drop')).toBe('invalid');
    fireEvent.drop(target);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('org-studio-drag-feedback').textContent).toContain('siklus');
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    fireEvent.dragEnd(source);
  });

  it('AC-02: dialog M-007 setara drag — pilih atasan + preview + konfirmasi', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    openPanel(container, 'eng', 'Engineer');
    fireEvent.click(screen.getByTestId('org-studio-detail-move'));
    fireEvent.click(screen.getByRole('radio', { name: /CFO/ }));
    expect(screen.getByTestId('org-studio-move-preview').textContent).toContain('Direktur Utama / CFO / Engineer');
    fireEvent.click(screen.getByTestId('org-studio-move-confirm'));
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; parentId: string | null }[];
    expect(next.find((n) => n.id === 'eng')?.parentId).toBe('cfo');
    expect(screen.getByTestId('org-studio-live').textContent).toContain('dipindah ke');
  });

  it('AC-02: M-007 menonaktifkan diri + turunan beserta alasan', () => {
    const { container } = render(<ControlledStudio />);
    openPanel(container, 'cto', 'CTO');
    fireEvent.click(screen.getByTestId('org-studio-detail-move'));
    expect(screen.getByRole('radio', { name: /CTO.*Node itu sendiri/ })).toHaveProperty('disabled', true);
    expect(screen.getByRole('radio', { name: /Engineer.*Turunan/ })).toHaveProperty('disabled', true);
    expect(screen.getByTestId('org-studio-move-confirm')).toHaveProperty('disabled', true);
  });

  it('AC-03: M-008 mode reparent memindahkan anak ke kakek + menyebut N turunan', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    openPanel(container, 'cto', 'CTO');
    fireEvent.click(screen.getByTestId('org-studio-detail-delete'));
    expect(screen.getByText(/beserta 1 turunan/)).not.toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: /atasan di atasnya/ }));
    fireEvent.click(screen.getByTestId('org-studio-delete-confirm'));
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as { id: string; parentId: string | null }[];
    expect(next.find((n) => n.id === 'cto')).toBeUndefined();
    expect(next.find((n) => n.id === 'eng')?.parentId).toBe('ceo');
    expect(screen.getByTestId('org-studio-live').textContent).toContain('dihapus');
  });

  it('AC-03: M-008 mode subtree menghapus seluruh turunan', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    openPanel(container, 'cto', 'CTO');
    fireEvent.click(screen.getByTestId('org-studio-detail-delete'));
    fireEvent.click(screen.getByRole('radio', { name: /Hapus subtree/ }));
    fireEvent.click(screen.getByTestId('org-studio-delete-confirm'));
    const next = onChangeSpy.mock.calls[0][0] as { id: string }[];
    expect(next.map((n) => n.id).sort()).toEqual(['ceo', 'cfo']);
  });

  it('AC-03: root diproteksi — tombol hapus disabled + Delete keyboard diabaikan', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    openPanel(container, 'ceo', 'Direktur Utama');
    expect(screen.getByTestId('org-studio-detail-delete')).toHaveProperty('disabled', true);
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    const ceoCard = container.querySelector('[data-node-id="ceo"]') as HTMLElement;
    fireEvent.keyDown(ceoCard, { key: 'Delete' });
    expect(screen.queryByTestId('org-studio-delete-confirm')).toBeNull();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('AC-03: Delete keyboard membuka M-008 untuk non-root', () => {
    const { container } = render(<ControlledStudio />);
    const card = container.querySelector('[data-node-id="cfo"]') as HTMLElement;
    fireEvent.keyDown(card, { key: 'Delete' });
    expect(screen.getByTestId('org-studio-delete-confirm')).not.toBeNull();
  });

  it('AC-04: toolbar undo/redo round-trip pindah + live region', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    expect(screen.getByTestId('org-studio-undo')).toHaveProperty('disabled', true);
    expect(screen.getByTestId('org-studio-redo')).toHaveProperty('disabled', true);
    dragTo(container, 'eng', 'cfo');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('org-studio-undo')).toHaveProperty('disabled', false);
    fireEvent.click(screen.getByTestId('org-studio-undo'));
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('org-studio-live').textContent).toContain('dibatalkan');
    const undone = onChangeSpy.mock.calls[1][0] as { id: string; parentId: string | null }[];
    expect(undone.find((n) => n.id === 'eng')?.parentId).toBe('cto');
    expect(screen.getByTestId('org-studio-redo')).toHaveProperty('disabled', false);
    fireEvent.click(screen.getByTestId('org-studio-redo'));
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('org-studio-live').textContent).toContain('diulang');
    const redone = onChangeSpy.mock.calls[2][0] as { id: string; parentId: string | null }[];
    expect(redone.find((n) => n.id === 'eng')?.parentId).toBe('cfo');
  });

  it('AC-04: Ctrl+Z / Ctrl+Y memicu undo/redo', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledStudio onChangeSpy={onChangeSpy} />);
    dragTo(container, 'eng', 'cfo');
    const app = container.querySelector('[role="application"]') as HTMLElement;
    fireEvent.keyDown(app, { key: 'z', ctrlKey: true });
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(app, { key: 'y', ctrlKey: true });
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
  });
});
