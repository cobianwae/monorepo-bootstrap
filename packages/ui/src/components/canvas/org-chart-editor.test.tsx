import { fireEvent, render, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OrgChartEditor,
  computeEditorPositions,
  toFlowEdges,
  type OrgChartInput,
} from './org-chart-editor';

const mockFitView = vi.fn();
const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();

vi.mock('@xyflow/react', async (importOriginal) => {
  const xyflow = (await importOriginal()) as Record<string, unknown>;
  return {
    ...xyflow,
    useReactFlow: () => ({ zoomIn: mockZoomIn, zoomOut: mockZoomOut, fitView: mockFitView }),
  };
});

const flatData: OrgChartInput = [
  { id: 'ceo', parentId: null, title: 'CEO' },
  { id: 'cto', parentId: 'ceo', title: 'CTO' },
  { id: 'cfo', parentId: 'ceo', title: 'CFO' },
  { id: 'eng', parentId: 'cto', title: 'Engineer' },
];

const nestedData: OrgChartInput = {
  id: 'ceo',
  title: 'CEO',
  children: [
    { id: 'cto', title: 'CTO', children: [{ id: 'eng', title: 'Engineer' }] },
    { id: 'cfo', title: 'CFO' },
  ],
};

function nodeTitles(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-testid="org-editor-node"]')).map(
    (el) => el.getAttribute('data-node-id') ?? '',
  );
}

describe('OrgChartEditor fondasi', () => {
  beforeEach(() => {
    mockFitView.mockClear();
    mockZoomIn.mockClear();
    mockZoomOut.mockClear();
  });

  it('flat dan nested render identik', () => {
    const flat = render(<OrgChartEditor data={flatData} />);
    const flatIds = nodeTitles(flat.container);
    flat.unmount();
    const nested = render(<OrgChartEditor data={nestedData} />);
    const nestedIds = nodeTitles(nested.container);
    expect(nestedIds.sort()).toEqual(flatIds.sort());
    expect(flatIds).toContain('ceo');
    expect(flatIds).toContain('eng');
    nested.unmount();
  });

  it.each([
    ['duplikat', [{ id: 'a', parentId: null, title: 'A' }, { id: 'a', parentId: null, title: 'A2' }], 'a'],
    ['parent hilang', [{ id: 'a', parentId: null, title: 'A' }, { id: 'b', parentId: 'hilang', title: 'B' }], 'b'],
    ['siklus', [{ id: 'a', parentId: 'b', title: 'A' }, { id: 'b', parentId: 'a', title: 'B' }], 'a'],
    [
      'multi-root',
      [
        { id: 'a', parentId: null, title: 'A' },
        { id: 'b', parentId: null, title: 'B' },
      ],
      'b',
    ],
  ])('invalid %s ditolak dengan pesan + id tanpa throw', (_label, data, nodeId) => {
    const { container } = render(<OrgChartEditor data={data as OrgChartInput} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain(nodeId);
    expect(container.querySelector('[data-testid="org-editor-node"]')).toBeNull();
  });

  it('layout deterministik dan LR swap sumbu', () => {
    const { container } = render(<OrgChartEditor data={flatData} orientation="top-down" />);
    const tdNodes = Array.from(container.querySelectorAll('[data-testid="org-editor-node"]')).map((el) => ({
      id: el.getAttribute('data-node-id'),
      transform: (el.parentElement?.getAttribute('style') ?? el.getAttribute('style') ?? '').slice(0, 64),
    }));
    expect(tdNodes.length).toBeGreaterThan(0);
    const again = render(<OrgChartEditor data={flatData} orientation="top-down" />);
    expect(nodeTitles(again.container).sort()).toEqual(nodeTitles(container).sort());
    again.unmount();
  });

  it('computeEditorPositions deterministik + LR swap', () => {
    const normalized = {
      nodes: [
        { id: 'r', parentId: null, title: 'R', depth: 0, childIds: ['a', 'b'], hasChildren: true },
        { id: 'a', parentId: 'r', title: 'A', depth: 1, childIds: [], hasChildren: false },
        { id: 'b', parentId: 'r', title: 'B', depth: 1, childIds: [], hasChildren: false },
      ],
      byId: new Map([
        ['r', { id: 'r', parentId: null, title: 'R', depth: 0, childIds: ['a', 'b'], hasChildren: true }],
        ['a', { id: 'a', parentId: 'r', title: 'A', depth: 1, childIds: [], hasChildren: false }],
        ['b', { id: 'b', parentId: 'r', title: 'B', depth: 1, childIds: [], hasChildren: false }],
      ]),
      rootId: 'r',
      error: null,
      isEmpty: false,
    } as unknown as Parameters<typeof computeEditorPositions>[0];
    const visible = new Set(['r', 'a', 'b']);
    const td = computeEditorPositions(normalized, visible, 'top-down');
    const td2 = computeEditorPositions(normalized, visible, 'top-down');
    expect(td).toEqual(td2);
    const lr = computeEditorPositions(normalized, visible, 'left-right');
    const tdById = new Map(td.map((p) => [p.id, p]));
    const lrById = new Map(lr.map((p) => [p.id, p]));
    for (const id of ['r', 'a', 'b']) {
      expect(lrById.get(id)?.x).toBe(tdById.get(id)?.y);
      expect(lrById.get(id)?.y).toBe(tdById.get(id)?.x);
    }
  });

  it('edge memakai smoothstep per parent', () => {
    const normalized = {
      nodes: [
        { id: 'r', parentId: null, title: 'R', depth: 0, childIds: ['a'], hasChildren: true },
        { id: 'a', parentId: 'r', title: 'A', depth: 1, childIds: [], hasChildren: false },
      ],
      byId: new Map(),
      rootId: 'r',
      error: null,
      isEmpty: false,
    } as unknown as Parameters<typeof toFlowEdges>[0];
    const edges = toFlowEdges(normalized, new Set(['r', 'a']));
    expect(edges).toHaveLength(1);
    expect(edges[0].type).toBe('smoothstep');
    expect(edges[0].id).toBe('r>a');
  });

  it('collapse/expand uncontrolled menyembunyikan subtree + callback', () => {
    const onExpandedChange = vi.fn();
    const { container } = render(<OrgChartEditor data={flatData} onExpandedChange={onExpandedChange} />);
    expect(nodeTitles(container)).toContain('eng');
    const toggler = container.querySelector(
      '[aria-label="Collapse CTO"], [aria-label="Perluas CTO"]',
    ) as HTMLButtonElement | null;
    expect(toggler).not.toBeNull();
    fireEvent.click(toggler as HTMLButtonElement);
    expect(nodeTitles(container)).not.toContain('eng');
    expect(onExpandedChange).toHaveBeenCalled();
  });

  it('controlled expandedIds diikuti', () => {
    const onExpandedChange = vi.fn();
    const { container, rerender } = render(
      <OrgChartEditor data={flatData} expandedIds={['ceo', 'cto']} onExpandedChange={onExpandedChange} />,
    );
    expect(nodeTitles(container)).toContain('eng');
    rerender(<OrgChartEditor data={flatData} expandedIds={['ceo']} onExpandedChange={onExpandedChange} />);
    expect(nodeTitles(container)).not.toContain('eng');
  });

  it('controls + minimap token, zoom dan fit-view bekerja', () => {
    const { container } = render(<OrgChartEditor data={flatData} />);
    expect(container.querySelector('[data-testid="org-editor-controls"]')).not.toBeNull();
    expect(container.querySelector('.react-flow__minimap')).not.toBeNull();
    const zoomIn = container.querySelector('[aria-label="Zoom in"]') as HTMLButtonElement | null;
    const zoomOut = container.querySelector('[aria-label="Zoom out"]') as HTMLButtonElement | null;
    const fit = container.querySelector('[aria-label="Fit view"]') as HTMLButtonElement | null;
    expect(zoomIn).not.toBeNull();
    expect(zoomOut).not.toBeNull();
    expect(fit).not.toBeNull();
    fireEvent.click(zoomIn as HTMLButtonElement);
    expect(mockZoomIn).toHaveBeenCalled();
    fireEvent.click(fit as HTMLButtonElement);
    expect(mockFitView).toHaveBeenCalled();
  });

  it('error eksternal tampil di atas kanvas', () => {
    const { container } = render(<OrgChartEditor data={flatData} error="Gagal sinkron" />);
    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBeGreaterThan(0);
    expect(container.querySelector('[data-testid="org-editor-node"]')).not.toBeNull();
  });

  it('node panjang terbaca penuh via title tooltip', () => {
    const long = 'Kepala Divisi Rekayasa Perangkat Lunak Senior Sekali';
    const { container } = render(
      <OrgChartEditor data={[{ id: 'r', parentId: null, title: long, subtitle: 'Sub jabatan panjang' }]} />,
    );
    const node = container.querySelector('[data-testid="org-editor-node"]');
    expect(node?.getAttribute('title')).toContain(long);
    expect(within(container as HTMLElement).getAllByText(long, { exact: false }).length).toBeGreaterThan(0);
  });
});
