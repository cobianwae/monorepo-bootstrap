'use client';

// Test co-located MindMap (012-01): AC-01 flat=nested + 4 invalid terstruktur,
// AC-02 layout dua sisi deterministik (Peluncuran Q1 + 50 node), AC-03 pill +
// badge "+N", AC-04 expand controlled/uncontrolled + keyboard +−0F.

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import {
  MindMap,
  computeMindMapPositions,
  normalizeMindInput,
  toMindFlowEdges,
  type MindInput,
  type MindNodeFlat,
} from './mind-map';

const mockFitView = vi.fn();
const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();
const mockSetViewport = vi.fn();
const mockSetCenter = vi.fn();

vi.mock('@xyflow/react', async (importOriginal) => {
  const xyflow = (await importOriginal()) as Record<string, unknown>;
  return {
    ...xyflow,
    useReactFlow: () => ({
      zoomIn: mockZoomIn,
      zoomOut: mockZoomOut,
      fitView: mockFitView,
      setViewport: mockSetViewport,
      setCenter: mockSetCenter,
      getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
    }),
  };
});

// "Peluncuran Q1" (PRD): root + 3 cabang + 3 level.
const flatData: MindInput = [
  { id: 'q1', parentId: null, label: 'Peluncuran Q1', accent: 'primary' },
  { id: 'riset', parentId: 'q1', label: 'Riset pasar', accent: 'success' },
  { id: 'produk', parentId: 'q1', label: 'Produk MVP', accent: 'info' },
  { id: 'marketing', parentId: 'q1', label: 'Marketing', accent: 'warning' },
  { id: 'kompetitor', parentId: 'riset', label: 'Analisis kompetitor' },
  { id: 'wawancara', parentId: 'riset', label: 'Wawancara pengguna' },
  { id: 'insight', parentId: 'wawancara', label: 'Insight awal' },
  { id: 'mvp', parentId: 'produk', label: 'Fitur inti' },
  { id: 'materi', parentId: 'marketing', label: 'Materi kampanye' },
];

const nestedData: MindInput = {
  id: 'q1',
  label: 'Peluncuran Q1',
  accent: 'primary',
  children: [
    {
      id: 'riset',
      label: 'Riset pasar',
      accent: 'success',
      children: [
        { id: 'kompetitor', label: 'Analisis kompetitor' },
        { id: 'wawancara', label: 'Wawancara pengguna', children: [{ id: 'insight', label: 'Insight awal' }] },
      ],
    },
    { id: 'produk', label: 'Produk MVP', accent: 'info', children: [{ id: 'mvp', label: 'Fitur inti' }] },
    { id: 'marketing', label: 'Marketing', accent: 'warning', children: [{ id: 'materi', label: 'Materi kampanye' }] },
  ],
};

function nodeIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-testid="mind-map-node"]')).map(
    (el) => el.getAttribute('data-node-id') ?? '',
  );
}

describe('MindMap fondasi (012-01)', () => {
  beforeEach(() => {
    mockFitView.mockClear();
    mockZoomIn.mockClear();
    mockZoomOut.mockClear();
    mockSetViewport.mockClear();
    mockSetCenter.mockClear();
  });

  it('AC-01: flat dan nested render identik (urutan anak stabil)', () => {
    const flat = render(<MindMap data={flatData} />);
    const flatIds = nodeIds(flat.container);
    flat.unmount();
    const nested = render(<MindMap data={nestedData} />);
    const nestedIds = nodeIds(nested.container);
    expect(nestedIds).toEqual(flatIds);
    // Urutan kanonik DFS dari root (normalisasi mengkanonisasi urutan).
    expect(flatIds).toEqual([
      'q1',
      'riset',
      'kompetitor',
      'wawancara',
      'insight',
      'produk',
      'mvp',
      'marketing',
      'materi',
    ]);
    nested.unmount();
    const flatNorm = normalizeMindInput(flatData);
    const nestedNorm = normalizeMindInput(nestedData);
    const visible = new Set(flatIds);
    expect(computeMindMapPositions(nestedNorm, visible)).toEqual(computeMindMapPositions(flatNorm, visible));
  });

  it.each([
    ['duplikat', [{ id: 'a', parentId: null, label: 'A' }, { id: 'a', parentId: null, label: 'A2' }], 'a'],
    ['parent hilang', [{ id: 'a', parentId: null, label: 'A' }, { id: 'b', parentId: 'hilang', label: 'B' }], 'b'],
    // Siklus a↔b tak terjangkau dari root r — terdeteksi via fallback unreachable,
    // nodeId = node pertama yang tak dikunjungi (urutan input).
    ['siklus', [{ id: 'r', parentId: null, label: 'R' }, { id: 'a', parentId: 'b', label: 'A' }, { id: 'b', parentId: 'a', label: 'B' }], 'a'],
    [
      'root berlebih',
      [
        { id: 'a', parentId: null, label: 'A' },
        { id: 'b', parentId: null, label: 'B' },
      ],
      'b',
    ],
  ])('AC-01: invalid %s ditolak terstruktur (penyebab + id pertama, tanpa throw)', (_label, data, nodeId) => {
    const norm = normalizeMindInput(data as MindInput);
    expect(norm.error).not.toBeNull();
    expect(norm.error?.nodeId).toBe(nodeId);
    expect(norm.rootId).toBeNull();

    const { container } = render(<MindMap data={data as MindInput} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain(nodeId);
    expect(container.querySelector('[data-testid="mind-map-node"]')).toBeNull();
  });

  it('AC-02: layout dua sisi deterministik — split-rule K1 proporsional lebar subtree', () => {
    const normalized = normalizeMindInput(flatData);
    expect(normalized.error).toBeNull();
    const visible = new Set([
      'q1',
      'riset',
      'produk',
      'marketing',
      'kompetitor',
      'wawancara',
      'insight',
      'mvp',
      'materi',
    ]);
    const first = computeMindMapPositions(normalized, visible);
    const second = computeMindMapPositions(normalized, visible);
    expect(first).toEqual(second);

    // Snapshot deterministik penuh: root sentral di pusat (0,0); tiap sisi
    // digeser agar pusat rentangnya berimpit pusat vertikal root (riset=2
    // daun → kanan; produk+marketing 1+1=2 → kiri; tie pertama → kanan).
    // Urutan array = urutan push algoritma: kanan (in-order daun→induk), kiri, root.
    expect(first).toEqual([
      { id: 'kompetitor', x: 324, y: -60, side: 'right' }, // kolom depth-2 kanan
      { id: 'insight', x: 516, y: 12, side: 'right' },
      { id: 'wawancara', x: 324, y: 12, side: 'right' },
      { id: 'riset', x: 132, y: -24, side: 'right' },
      { id: 'mvp', x: -484, y: -60, side: 'left' },
      { id: 'produk', x: -292, y: -60, side: 'left' },
      { id: 'materi', x: -484, y: 12, side: 'left' },
      { id: 'marketing', x: -292, y: 12, side: 'left' },
      { id: 'q1', x: -100, y: -32, side: 'right' },
    ]);
    const byId = new Map(first.map((p) => [p.id, p]));
    const root = byId.get('q1');
    expect(root?.x).toBe(-100); // pusat x = 0 (root 200px)
    expect(root?.y).toBe(-32); // pusat y = 0 (root 64px)
    expect(byId.get('riset')?.side).toBe('right');
    expect(byId.get('produk')?.side).toBe('left');
    expect(byId.get('marketing')?.side).toBe('left');
  });

  it('AC-02: 50 node tetap seimbang dua sisi dan deterministik', () => {
    const data: MindNodeFlat[] = [{ id: 'root', parentId: null, label: 'Peta 50' }];
    for (let b = 0; b < 7; b += 1) {
      data.push({ id: `b${b}`, parentId: 'root', label: `Cabang ${b}` });
      for (let l = 0; l < 6; l += 1) {
        data.push({ id: `b${b}-l${l}`, parentId: `b${b}`, label: `Ide ${b}-${l}` });
      }
    }
    expect(data).toHaveLength(50);
    const normalized = normalizeMindInput(data);
    expect(normalized.error).toBeNull();
    const visible = new Set(data.map((node) => node.id));
    const first = computeMindMapPositions(normalized, visible);
    const second = computeMindMapPositions(normalized, visible);
    expect(first).toEqual(second);
    expect(first).toHaveLength(50);

    // Lebar tiap cabang sama (6 daun): greedy → kanan 4 cabang, kiri 3.
    const kolomKanan = first.filter((p) => p.side === 'right' && p.x === 132);
    const kolomKiri = first.filter((p) => p.side === 'left' && p.x === -292);
    expect(kolomKanan).toHaveLength(4);
    expect(kolomKiri).toHaveLength(3);
    // Selisih sisi ≤ lebar satu cabang (proporsional seimbang).
    expect(Math.abs(kolomKanan.length - kolomKiri.length) * 6).toBeLessThanOrEqual(6);
  });

  it('AC-03: edge bezier 1px token border + satu edge per pasangan parent-child', () => {
    const normalized = normalizeMindInput(flatData);
    const visible = new Set([
      'q1',
      'riset',
      'produk',
      'marketing',
      'kompetitor',
      'wawancara',
      'insight',
      'mvp',
      'materi',
    ]);
    const positions = computeMindMapPositions(normalized, visible);
    const edges = toMindFlowEdges(normalized, positions, visible);
    expect(edges).toHaveLength(8);
    for (const edge of edges) {
      expect(edge.type).toBe('default'); // bezier (K4)
      expect(edge.style).toEqual({ strokeWidth: 1, stroke: 'var(--border)' });
    }
    // Root memancar dua sisi: anak kanan via out-r, anak kiri via out-l.
    const rootEdges = edges.filter((edge) => edge.source === 'q1');
    expect(rootEdges.find((edge) => edge.target === 'riset')?.sourceHandle).toBe('out-r');
    expect(rootEdges.find((edge) => edge.target === 'produk')?.sourceHandle).toBe('out-l');
  });

  it('AC-03: collapsed menyembunyikan subtree + edge dan badge "+N" tampil', () => {
    const { container } = render(<MindMap data={flatData} />);
    expect(nodeIds(container)).toHaveLength(9);

    const expander = container.querySelector('[data-testid="mind-map-expander-riset"]');
    expect(expander?.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(expander!);

    // Subtree riset (kompetitor, wawancara, insight) + edge-nya hilang.
    expect(nodeIds(container)).toHaveLength(6);
    expect(nodeIds(container)).not.toContain('insight');
    expect(expander?.getAttribute('aria-expanded')).toBe('false');

    const badge = container.querySelector('[data-testid="mind-map-badge-riset"]');
    expect(badge?.textContent).toBe('+3');
    expect(badge?.getAttribute('aria-label')).toBe('3 ide tersembunyi');
  });

  it('AC-04: expand uncontrolled — toggle internal tanpa prop expandedIds', () => {
    const onExpandedChange = vi.fn();
    const { container } = render(<MindMap data={flatData} onExpandedChange={onExpandedChange} />);
    fireEvent.click(container.querySelector('[data-testid="mind-map-expander-produk"]')!);
    expect(nodeIds(container)).toHaveLength(8);
    // Set awal: q1, riset, produk, marketing, wawancara (semua induk terbuka);
    // toggle produk mengeluarkan produk dari set (urutan insertion).
    expect(onExpandedChange).toHaveBeenCalledWith(['q1', 'riset', 'wawancara', 'marketing']);
  });

  it('AC-04: expand controlled — onExpandedChange dipanggil, render mengikuti prop', () => {
    const onExpandedChange = vi.fn();
    const { container } = render(
      <MindMap
        data={flatData}
        expandedIds={['q1', 'riset', 'produk', 'marketing', 'wawancara']}
        onExpandedChange={onExpandedChange}
      />,
    );
    expect(nodeIds(container)).toHaveLength(9);
    fireEvent.click(container.querySelector('[data-testid="mind-map-expander-riset"]')!);
    // Prop tetap → render tidak berubah; konsumen yang memutuskan.
    expect(nodeIds(container)).toHaveLength(9);
    expect(onExpandedChange).toHaveBeenCalledWith(['q1', 'produk', 'marketing', 'wawancara']);
  });

  it('AC-04: keyboard + − 0 F memicu zoom/fit di kanvas', () => {
    const { container } = render(<MindMap data={flatData} />);
    const viewport = container.querySelector('[data-testid="mind-map-viewport"]') as HTMLElement;
    fireEvent.keyDown(viewport, { key: '+' });
    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(viewport, { key: '-' });
    expect(mockZoomOut).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(viewport, { key: '0' });
    expect(mockSetViewport).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
    fireEvent.keyDown(viewport, { key: 'f' });
    expect(mockFitView).toHaveBeenCalledTimes(1);
  });

  it('AC-04: live region level zoom + controls + minimap token-mapped tampil', () => {
    const { container } = render(<MindMap data={flatData} />);
    const zoom = container.querySelector('[data-testid="mind-map-zoom-level"]');
    expect(zoom?.getAttribute('aria-live')).toBe('polite');
    expect(zoom?.textContent).toBe('100%');
    expect(container.querySelector('[data-testid="mind-map-controls"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="mind-map-minimap"]')).not.toBeNull();
    expect(container.querySelector('[role="application"]')?.getAttribute('aria-label')).toBe('Mind map');
  });

  it('AC-01: dataset kosong → empty state tanpa node', () => {
    const { container } = render(<MindMap data={[]} />);
    expect(container.querySelector('[data-testid="mind-map-node"]')).toBeNull();
    expect(container.textContent).toContain('Belum ada peta ide');
  });
});
