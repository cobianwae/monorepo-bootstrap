import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OrgChartStudio,
  computeStudioPositions,
  getAncestors,
  normalizeStudioInput,
  toStudioFlowEdges,
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
