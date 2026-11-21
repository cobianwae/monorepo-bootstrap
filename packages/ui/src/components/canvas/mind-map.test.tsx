'use client';

// Test co-located MindMap (012-01): AC-01 flat=nested + 4 invalid terstruktur,
// AC-02 layout dua sisi deterministik (Peluncuran Q1 + 50 node), AC-03 pill +
// badge "+N", AC-04 expand controlled/uncontrolled + keyboard +−0F.
// 012-02: tambah gagang pointer+keyboard, inline-edit validasi kosong, hapus
// daun langsung + cabang M-011 + proteksi root, onChange sekali-per-commit,
// undo/redo (toolbar + Ctrl+Z/Y) dengan batas 50, empty CTA "Buat peta".

import * as React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Toaster } from '../feedback/toaster';

import {
  MindMap,
  applyMindDelete,
  computeMindMapPositions,
  normalizeMindInput,
  pushMindHistoryCapped,
  toMindFlowEdges,
  type MindInput,
  type MindNodeFlat,
} from './mind-map';
import { getContrastRatio, THEMES } from '@ds/tokens';

const mockFitView = vi.fn();
const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();
const mockSetViewport = vi.fn();
const mockSetCenter = vi.fn();
let mockViewport = { x: 0, y: 0, zoom: 1 };

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
      getViewport: () => mockViewport,
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

// Host terkontrol 012-02: mengikuti onChange agar alur controlled teruji
// (pola ControlledStudio).
function ControlledMind({ onChangeSpy }: { onChangeSpy?: (next: MindNodeFlat[]) => void }) {
  const [flat, setFlat] = React.useState<MindNodeFlat[]>(() => [...(flatData as MindNodeFlat[])]);
  return (
    <MindMap
      data={flat}
      onChange={(next) => {
        setFlat(next);
        onChangeSpy?.(next);
      }}
    />
  );
}

describe('MindMap keyboard, SR dan states (012-03)', () => {
  it('CR-020: edit memusatkan cabang/root sesuai ukuran dan menjaga zoom nontrivial', () => {
    mockViewport = { x: -420, y: 175, zoom: 0.65 };
    try {
      const { container } = render(<MindMap data={flatData} />);
      const normalized = normalizeMindInput(flatData);
      const positions = computeMindMapPositions(normalized, new Set(normalized.nodes.map((node) => node.id)));
      fireEvent.keyDown(container.querySelector('[data-node-id="produk"]')!, { key: 'F2' });
      const position = positions.find((item) => item.id === 'produk')!;
      expect(mockSetCenter).toHaveBeenCalledWith(position.x + 80, position.y + 24, {
        zoom: 0.65, duration: expect.any(Number),
      });
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
      fireEvent.keyDown(container.querySelector('[data-node-id="q1"]')!, { key: 'F2' });
      const root = positions.find((item) => item.id === 'q1')!;
      expect(mockSetCenter).toHaveBeenCalledWith(root.x + 100, root.y + 32, {
        zoom: 0.65, duration: expect.any(Number),
      });
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
      fireEvent.keyDown(screen.getByTestId('mind-map-viewport'), { key: 'ArrowRight' });
      expect(mockSetViewport).toHaveBeenCalledWith({ x: -460, y: 175, zoom: 0.65 });
      fireEvent.keyDown(screen.getByTestId('mind-map-viewport'), { key: '0' });
      expect(mockSetViewport).toHaveBeenCalledWith({ x: -420, y: 175, zoom: 1 }, { duration: expect.any(Number) });
    } finally {
      mockViewport = { x: 0, y: 0, zoom: 1 };
    }
  });

  it('CR-020: fokus keyboard dipusatkan; reduced-motion menghapus animasi', () => {
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true, media: '(prefers-reduced-motion: reduce)', onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: () => false,
    });
    try {
      const { container, rerender } = render(<MindMap data={flatData} />);
      const root = container.querySelector('[data-node-id="q1"]')!;
      mockSetCenter.mockClear();
      fireEvent.keyDown(root, { key: 'ArrowDown' });
      expect(mockSetCenter).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), { zoom: 1, duration: 0 });
      const calls = mockSetCenter.mock.calls.length;
      rerender(<MindMap data={flatData} className="w-full" />);
      expect(mockSetCenter.mock.calls.length).toBe(calls);
      fireEvent.keyDown(container.querySelector('[data-node-id="riset"]')!, { key: 'F2' });
      expect(mockSetCenter.mock.calls.length).toBeGreaterThan(calls);
      expect(mockSetCenter).toHaveBeenLastCalledWith(expect.any(Number), expect.any(Number), { zoom: 1, duration: 0 });
    } finally {
      matchMedia.mockRestore();
    }
  });

  it('kiri/kanan mengunjungi saudara di sisi sama dan melewati node disabled', () => {
    const data: MindNodeFlat[] = [
      { id: 'root', parentId: null, label: 'Root' },
      { id: 'a', parentId: 'root', label: 'A' },
      { id: 'a1', parentId: 'a', label: 'A1' },
      { id: 'a2', parentId: 'a', label: 'A2', disabled: true },
      { id: 'a3', parentId: 'a', label: 'A3' },
    ];
    const { container } = render(<MindMap data={data} />);
    const pill = (id: string) => container.querySelector<HTMLElement>(`[data-node-id="${id}"]`)!;
    fireEvent.keyDown(pill('a1'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(pill('a3'));
    fireEvent.keyDown(pill('a3'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(pill('a1'));
    expect(pill('a2').tabIndex).toBe(-1);
  });

  it('shortcut canvas tidak mengambil pengetikan/undo input native', () => {
    const spy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={spy} />);
    const node = container.querySelector('[data-node-id="produk"]')!;
    fireEvent.keyDown(node, { key: 'F2' });
    const input = screen.getByRole('textbox', { name: 'Ubah ide Produk MVP' });
    fireEvent.keyDown(input, { key: '+', ctrlKey: false });
    fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
    fireEvent.keyDown(input, { key: 'Delete' });
    expect(mockZoomIn).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it('reduced motion mematikan durasi zoom dan tombol pan memakai langkah 40px', () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({
      matches: true, media: query, onchange: null, addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {}, dispatchEvent: () => true,
    });
    try {
      render(<MindMap data={flatData} />);
      fireEvent.keyDown(screen.getByTestId('mind-map-viewport'), { key: '0' });
      expect(mockSetViewport).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1 }, { duration: 0 });
      fireEvent.keyDown(screen.getByTestId('mind-map-viewport'), { key: 'ArrowRight' });
      expect(mockSetViewport).toHaveBeenCalledWith({ x: -40, y: 0, zoom: 1 });
    } finally { window.matchMedia = original; }
  });

  it('slot search setelah toolbar dan sebelum canvas dalam urutan DOM', () => {
    const { container } = render(<MindMap data={flatData} searchSlot={<input aria-label="Cari ide" />} />);
    const search = screen.getByRole('textbox', { name: 'Cari ide' });
    const toolbar = screen.getByTestId('mind-map-redo');
    const viewport = screen.getByTestId('mind-map-viewport');
    expect(toolbar.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(search.compareDocumentPosition(viewport) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(viewport.tabIndex).toBe(0);
    expect(container.querySelectorAll('[data-node-id][tabindex="0"]')).toHaveLength(1);
  });
  it('audit Pulse light/dark: teks ≥4.5 dan penanda visual ≥3', () => {
    const pulse = THEMES.find((theme) => theme.id === 'pulse')!;
    for (const mode of ['light', 'dark'] as const) {
      const card = mode === 'light' ? '#FFFFFF' : '#141620';
      const foreground = mode === 'light' ? '#18181B' : '#F4F4F5';
      const muted = pulse.pairs.find((pair) => pair.name === 'Muted Caption Text')!;
      const secondary = pulse.pairs.find((pair) => pair.name === 'Secondary Action Button')!;
      const primary = pulse.swatches.primary[`${mode}Hex`];
      expect(getContrastRatio(foreground, card)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(muted[`${mode}Fg`], card)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(secondary[`${mode}Fg`], secondary[`${mode}Bg`])).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(primary, card)).toBeGreaterThanOrEqual(3);
      expect(getContrastRatio(primary, pulse.swatches.surface[`${mode}Hex`])).toBeGreaterThanOrEqual(3);
      for (const name of ['Success Badge / Banner', 'Warning Banner', 'Info Notice']) {
        const pair = pulse.pairs.find((candidate) => candidate.name === name)!;
        expect(getContrastRatio(pair[`${mode}Bg`], card)).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it('Enter/F2 edit; Space lipat; panah parent/anak memindahkan fokus', async () => {
    const { container } = render(<MindMap data={flatData} />);
    const pill = (id: string) => container.querySelector<HTMLElement>(`[data-node-id="${id}"]`)!;
    fireEvent.keyDown(pill('riset'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(pill('q1'));
    fireEvent.keyDown(pill('q1'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(pill('riset'));
    fireEvent.keyDown(pill('riset'), { key: ' ' });
    expect(nodeIds(container)).not.toContain('kompetitor');
    fireEvent.keyDown(pill('riset'), { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(pill('kompetitor')));
    fireEvent.keyDown(pill('kompetitor'), { key: 'F2' });
    const input = screen.getByRole('textbox', { name: 'Ubah ide Analisis kompetitor' });
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.keyDown(pill('kompetitor'), { key: 'Enter' });
    expect(screen.getByRole('textbox', { name: 'Ubah ide Analisis kompetitor' })).toBeTruthy();
  });

  it('pohon SR tree/group/treeitem, roving tabindex dan keyboard standar', () => {
    const { container } = render(<MindMap data={flatData} />);
    container.querySelector('details')!.open = true;
    const tree = screen.getByRole('tree', { name: 'Pohon ide' });
    const items = () => within(tree).getAllByRole('treeitem');
    expect(items().filter((item) => item.tabIndex === 0)).toHaveLength(1);
    const root = items()[0];
    expect(root.getAttribute('aria-level')).toBe('1');
    expect(root.getAttribute('aria-expanded')).toBe('true');
    expect(within(tree).getAllByRole('group').length).toBeGreaterThan(0);
    fireEvent.keyDown(root, { key: 'End' });
    expect(document.activeElement).toBe(items().at(-1));
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement).toBe(root);
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(root.getAttribute('aria-expanded')).toBe('false');
    expect(items()).toHaveLength(1);
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('data-tree-id')).toBe('riset');
    expect(items().filter((item) => item.tabIndex === 0)).toHaveLength(1);
    fireEvent.click(within(tree).getByRole('button', { name: 'Edit Riset pasar' }));
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Ubah ide Riset pasar' }));
  });

  it('sorotan presentasional non-warna hilang setelah props dibersihkan', () => {
    const { container, rerender } = render(<MindMap data={flatData} highlightedIds={['produk']} />);
    const pill = () => container.querySelector('[data-node-id="produk"]')!;
    expect(pill().textContent).toContain('Cocok');
    expect(pill().className).toContain('border-dashed');
    rerender(<MindMap data={flatData} highlightedIds={[]} />);
    expect(pill().textContent).not.toContain('Cocok');
  });

  it('loading enam skeleton tanpa kontrol aktif; error eksternal mempertahankan diagram', () => {
    const { container, rerender } = render(<MindMap data={flatData} loading />);
    expect(screen.getAllByTestId('mind-map-skeleton')).toHaveLength(6);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<MindMap data={flatData} error="Simpan gagal, coba lagi." />);
    expect(screen.getByRole('alert').textContent).toContain('Simpan gagal');
    expect(nodeIds(container)).toHaveLength(9);
  });

  it('invalid menyebut penyebab/id dan hanya menyatakan disalin setelah clipboard berhasil', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      render(<MindMap data={[{ id: 'x', parentId: null, label: 'A' }, { id: 'x', parentId: null, label: 'B' }]} />);
      expect(screen.getByRole('alert').textContent).toContain('ID duplikat');
      fireEvent.click(screen.getByRole('button', { name: 'Salin detail error' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Detail disalin' })).toBeTruthy());
      expect(writeText.mock.calls[0][0]).toContain('node: x');
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });
});

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

  it('AC-03: edge bezier 1.5px + satu edge per pasangan parent-child + garis putus primary ke node cocok', () => {
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
      expect(edge.style).toEqual({ strokeWidth: 1.5, stroke: 'var(--border)' });
    }
    // Paritas studio 011-04: edge menuju node cocok memakai garis putus primary.
    const highlighted = toMindFlowEdges(normalized, positions, visible, ['wawancara']);
    expect(highlighted.find((edge) => edge.target === 'wawancara')?.style).toEqual({
      strokeWidth: 1.5,
      stroke: 'var(--primary)',
      strokeDasharray: '5 4',
    });
    expect(highlighted.find((edge) => edge.target === 'kompetitor')?.style).toEqual({
      strokeWidth: 1.5,
      stroke: 'var(--border)',
    });
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

describe('MindMap tambah/hapus/undo (012-02)', () => {
  beforeEach(() => {
    mockFitView.mockClear();
    mockZoomIn.mockClear();
    mockZoomOut.mockClear();
    mockSetViewport.mockClear();
    mockSetCenter.mockClear();
  });

  it('helper: pushMindHistoryCapped membatasi 50 dan applyMindDelete menghapus subtree', () => {
    let past: MindNodeFlat[][] = [];
    for (let i = 0; i < 60; i += 1) {
      past = pushMindHistoryCapped(past, [{ id: `s-${i}`, parentId: null, label: `S${i}` }]);
    }
    expect(past).toHaveLength(50);
    expect(past[0][0]?.id).toBe('s-10');

    const flat: MindNodeFlat[] = [...(flatData as MindNodeFlat[])];
    const next = applyMindDelete(flat, 'wawancara'); // subtree: wawancara + insight
    expect(next).toHaveLength(7);
    expect(next.some((node) => node.id === 'wawancara')).toBe(false);
    expect(next.some((node) => node.id === 'insight')).toBe(false);
    expect(next.some((node) => node.id === 'riset')).toBe(true);
  });

  it('AC-01: klik gagang tambah anak → node baru inline-edit fokus, commit onChange sekali (pointer)', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    const handle = container.querySelector('[data-testid="mind-map-add-child-riset"]') as HTMLElement;
    expect(handle).not.toBeNull();
    expect(handle.getAttribute('aria-label')).toBe('Tambah anak Riset pasar');
    expect(handle.tagName).toBe('BUTTON'); // keyboard-activatable native
    fireEvent.click(handle);

    const input = container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
    expect(nodeIds(container)).toContain('ide-baru-1'); // node baru tampil di layout
    expect(onChangeSpy).not.toHaveBeenCalled(); // pending belum commit

    fireEvent.change(input, { target: { value: 'Go to market' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as MindNodeFlat[];
    const added = next.find((node) => node.id === 'ide-baru-1');
    expect(added?.parentId).toBe('riset');
    expect(added?.label).toBe('Go to market');
    expect(container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]')).toBeNull();
  });

  it('AC-01: Enter saat gagang fokus memicu tambah (keyboard)', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    const handle = container.querySelector('[data-testid="mind-map-add-child-riset"]') as HTMLElement;
    fireEvent.keyDown(handle, { key: 'Enter' });
    expect(container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]')).not.toBeNull();
    fireEvent.change(container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]') as HTMLInputElement, {
      target: { value: 'Survei cepat' },
    });
    fireEvent.keyDown(container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]') as HTMLElement, {
      key: 'Enter',
    });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('AC-01: gagang saudara menambah node ke parent yang sama', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    const handle = container.querySelector('[data-testid="mind-map-add-sibling-mvp"]') as HTMLElement;
    expect(handle.getAttribute('aria-label')).toBe('Tambah saudara Fitur inti');
    fireEvent.click(handle);
    const input = container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Fitur pendukung' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const next = onChangeSpy.mock.calls[0][0] as MindNodeFlat[];
    expect(next.find((node) => node.id === 'ide-baru-1')?.parentId).toBe('produk');
  });

  it('AC-02: Esc membuang node baru tanpa onChange dan fokus kembali ke parent', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.click(container.querySelector('[data-testid="mind-map-add-child-riset"]')!);
    const input = container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]')!;
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(nodeIds(container)).not.toContain('ide-baru-1');
    expect(document.activeElement?.getAttribute('data-node-id')).toBe('riset');
  });

  it('AC-02: kosong ditolak inline (aria-invalid + pesan, tetap edit); blur valid menyimpan', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.click(container.querySelector('[data-testid="mind-map-add-child-riset"]')!);
    const input = container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('[data-testid="mind-map-inline-err-ide-baru-1"]')?.textContent).toContain(
      'tidak boleh kosong',
    );
    expect(container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]')).not.toBeNull();
    expect(onChangeSpy).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Sprint nol' } });
    fireEvent.blur(input); // blur valid = simpan
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('AC-02: context menu Edit → inline-edit node lama → Esc kembalikan label + fokus', async () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.contextMenu(container.querySelector('[data-node-id="mvp"]')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    const input = await screen.findByTestId('mind-map-inline-input-mvp') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('Fitur inti');
    fireEvent.change(input, { target: { value: 'Draft baru' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="mind-map-inline-input-mvp"]')).toBeNull();
    expect(container.querySelector('[data-node-id="mvp"]')?.textContent).toContain('Fitur inti');
    expect(document.activeElement?.getAttribute('data-node-id')).toBe('mvp');
  });

  it('AC-02: commit edit node lama mengumumkan Diperbarui via live region', async () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.contextMenu(container.querySelector('[data-node-id="mvp"]')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    const input = await screen.findByTestId('mind-map-inline-input-mvp') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Fitur inti v2' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as MindNodeFlat[];
    expect(next.find((node) => node.id === 'mvp')?.label).toBe('Fitur inti v2');
    expect(container.querySelector('[data-testid="mind-map-announcement"]')?.textContent).toContain('Diperbarui');
  });

  it('AC-03: Delete pada daun hapus langsung + satu onChange + live region, tanpa dialog', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.keyDown(container.querySelector('[data-node-id="kompetitor"]') as HTMLElement, { key: 'Delete' });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as MindNodeFlat[];
    expect(next.some((node) => node.id === 'kompetitor')).toBe(false);
    expect(container.querySelector('[data-node-id="kompetitor"]')).toBeNull();
    expect(container.querySelector('[data-testid="mind-map-announcement"]')?.textContent).toContain(
      'Analisis kompetitor',
    );
    expect(document.body.querySelector('[data-testid="mind-map-delete-confirm"]')).toBeNull();
    expect(document.activeElement?.getAttribute('data-node-id')).toBe('riset'); // fokus ke parent
  });

  it('AC-03: Delete pada cabang buka M-011 dengan label + N turunan; konfirmasi hapus subtree', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.keyDown(container.querySelector('[data-node-id="riset"]') as HTMLElement, { key: 'Delete' });
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Hapus "Riset pasar" + 3 turunan?');
    fireEvent.click(document.body.querySelector('[data-testid="mind-map-delete-confirm"]')!);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const next = onChangeSpy.mock.calls[0][0] as MindNodeFlat[];
    for (const id of ['riset', 'kompetitor', 'wawancara', 'insight']) {
      expect(next.some((node) => node.id === id)).toBe(false);
    }
    expect(container.querySelector('[data-testid="mind-map-delete-confirm"]')).toBeNull();
  });

  it('AC-03: Delete pada root ditolak + penjelasan; context menu Hapus root disabled', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.keyDown(container.querySelector('[data-node-id="q1"]') as HTMLElement, { key: 'Delete' });
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-testid="mind-map-delete-confirm"]')).toBeNull();
    expect(container.querySelector('[data-testid="mind-map-announcement"]')?.textContent).toContain(
      'Root tidak bisa dihapus',
    );

    fireEvent.contextMenu(container.querySelector('[data-node-id="q1"]')!);
    const hapus = screen.getByRole('menuitem', { name: 'Hapus' });
    expect(hapus.getAttribute('data-disabled')).not.toBeNull();
  });

  it('AC-04: undo/redo toolbar + shortcut Ctrl+Z/Ctrl+Y memanggil onChange tiap langkah', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.keyDown(container.querySelector('[data-node-id="kompetitor"]') as HTMLElement, { key: 'Delete' });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-node-id="kompetitor"]')).toBeNull();

    fireEvent.click(container.querySelector('[data-testid="mind-map-undo"]')!);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect((onChangeSpy.mock.calls[1][0] as MindNodeFlat[]).some((node) => node.id === 'kompetitor')).toBe(true);
    expect(container.querySelector('[data-node-id="kompetitor"]')).not.toBeNull();

    const app = container.querySelector('[role="application"]') as HTMLElement;
    fireEvent.keyDown(app, { key: 'y', ctrlKey: true });
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect((onChangeSpy.mock.calls[2][0] as MindNodeFlat[]).some((node) => node.id === 'kompetitor')).toBe(false);
    expect(container.querySelector('[data-node-id="kompetitor"]')).toBeNull();
    fireEvent.keyDown(app, { key: 'z', ctrlKey: true });
    expect(onChangeSpy).toHaveBeenCalledTimes(4);
    expect(container.querySelector('[data-node-id="kompetitor"]')).not.toBeNull();
  });

  it('AC-03: Esc menutup M-011 tanpa mutasi dan mengembalikan fokus ke cabang', async () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    const branch = container.querySelector('[data-node-id="produk"]') as HTMLElement;
    branch.focus();
    fireEvent.keyDown(branch, { key: 'Delete' });
    expect(screen.getByRole('alertdialog')).not.toBeNull();
    expect(screen.getByRole('alertdialog').contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(branch));
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('AC-01: menu tambah anak menunggu fokus menu dilepas sebelum membuka input', async () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.contextMenu(container.querySelector('[data-node-id="produk"]')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Tambah anak' }));
    const input = await screen.findByTestId('mind-map-inline-input-ide-baru-1');
    expect(document.activeElement).toBe(input);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('AC-04: undo saat ada draft tidak memasukkan node pending ke redo', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.keyDown(container.querySelector('[data-node-id="kompetitor"]')!, { key: 'Delete' });
    fireEvent.click(screen.getByTestId('mind-map-add-root'));
    fireEvent.click(screen.getByTestId('mind-map-undo'));
    fireEvent.click(screen.getByTestId('mind-map-redo'));
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect((onChangeSpy.mock.calls[2][0] as MindNodeFlat[]).some((node) => node.id.startsWith('ide-baru-'))).toBe(false);
  });

  it('AC-04: batas undo 50 — setelah habis tombol Urungkan disabled', async () => {
    const onChangeSpy = vi.fn();
    // Edit satu node agar uji batas history tidak mengukur biaya render 60 pill.
    const { container } = render(
      <MindMap data={[{ id: 'root', parentId: null, label: 'Awal' }]} onChange={onChangeSpy} />,
    );
    for (let i = 0; i < 51; i += 1) {
      fireEvent.contextMenu(container.querySelector('[data-node-id="root"]')!);
      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      const input = await screen.findByTestId('mind-map-inline-input-root');
      fireEvent.change(input, { target: { value: `Ide ${i + 1}` } });
      fireEvent.keyDown(input, { key: 'Enter' });
    }
    expect(onChangeSpy).toHaveBeenCalledTimes(51);
    const undoButton = () => container.querySelector('[data-testid="mind-map-undo"]') as HTMLButtonElement;
    for (let i = 0; i < 50; i += 1) {
      fireEvent.click(undoButton());
    }
    expect(onChangeSpy).toHaveBeenCalledTimes(101);
    const undone = onChangeSpy.mock.calls[100][0] as MindNodeFlat[];
    expect(undone).toEqual([{ id: 'root', parentId: null, label: 'Ide 1' }]);
    expect(undoButton().disabled).toBe(true);
  }, 20000);

  it('AC-01: empty state CTA "Buat peta" → root langsung inline-edit', () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<MindMap data={[]} onChange={onChangeSpy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buat peta' }));
    const input = container.querySelector('[data-testid="mind-map-inline-input-ide-baru-1"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: 'Peta besar' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy.mock.calls[0][0]).toEqual([{ id: 'ide-baru-1', parentId: null, label: 'Peta besar' }]);
  });

  it('AC-04: aksi Urungkan pada toast memulihkan daun dan memanggil onChange sekali', async () => {
    const onChangeSpy = vi.fn();
    const { container } = render(
      <>
        <ControlledMind onChangeSpy={onChangeSpy} />
        <Toaster />
      </>,
    );
    fireEvent.keyDown(container.querySelector('[data-node-id="kompetitor"]')!, { key: 'Delete' });
    const title = await screen.findByText('Dihapus', { exact: true });
    const toastItem = title.closest('li');
    expect(toastItem).not.toBeNull();
    fireEvent.click(within(toastItem!).getByRole('button', { name: 'Urungkan' }));
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(nodeIds(container)).toContain('kompetitor');
  });

  it('AC-03: menu Hapus daun melepas fokus menu sebelum fokus dipindah ke parent', async () => {
    const onChangeSpy = vi.fn();
    const { container } = render(<ControlledMind onChangeSpy={onChangeSpy} />);
    fireEvent.contextMenu(container.querySelector('[data-node-id="kompetitor"]')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }));
    await waitFor(() => {
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(document.activeElement?.getAttribute('data-node-id')).toBe('riset');
    });
    expect(nodeIds(container)).not.toContain('kompetitor');
  });
});
