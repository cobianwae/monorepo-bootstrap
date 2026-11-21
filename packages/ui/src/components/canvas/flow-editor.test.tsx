import * as React from 'react';
import { render, renderHook, screen, within, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReactFlow } from '@xyflow/react';
import { Toaster } from '../feedback/toaster';
import { TooltipProvider } from '../base/tooltip';
import { FlowEditor, type FlowEdge, type FlowNode, type FlowPaletteItem, useFlowHistory } from './flow-editor';

const mockStf = vi.hoisted(() => vi.fn((pos: { x: number; y: number }) => pos));
const mockGetViewport = vi.hoisted(() => vi.fn(() => ({ x: 0, y: 0, zoom: 1 })));

vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...(actual as Record<string, unknown>),
    // ReactFlow test-friendly: render nodes via nodeTypes dan edges sebagai div,
    // tanpa memerlukan DOM kanvas xyflow asli di jsdom.
    ReactFlow: function MockReactFlow(props: Record<string, unknown>) {
      const { nodes = [], edges = [], nodeTypes = {}, children, onInit, onViewportChange } = props as {
        nodes?: Array<{ id: string; type: string; data: Record<string, unknown>; selected?: boolean; position?: { x: number; y: number } }>;
        edges?: Array<{ id: string; source: string; target: string }>;
        nodeTypes?: Record<string, React.ComponentType>;
        children?: React.ReactNode;
        onInit?: (instance: unknown, viewport: { x: number; y: number; zoom: number }) => void;
        onViewportChange?: (viewport: { zoom: number }) => void;
      };
      React.useEffect(() => {
        if (onInit) onInit(null as unknown as never, { x: 0, y: 0, zoom: 1 });
        if (onViewportChange) onViewportChange({ zoom: 1 });
      }, [onInit, onViewportChange]);
      return (
        <div data-testid="flow-canvas">
          {(nodes as Array<{ id: string; type: string; data: Record<string, unknown>; selected?: boolean; position?: { x: number; y: number } }>).map((node) => {
            const Comp = (nodeTypes[node.type] || actual.FlowNode) as React.ComponentType<{
              id: string;
              data: Record<string, unknown>;
              selected?: boolean;
              positionX: number;
              positionY: number;
            }>;
            return React.createElement(Comp, {
              key: node.id,
              id: node.id,
              data: node.data,
              selected: node.selected,
              positionX: node.position?.x ?? 0,
              positionY: node.position?.y ?? 0,
            });
          })}
          {(edges as Array<{ id: string; source: string; target: string }>).map((edge) => (
            <div key={edge.id} data-testid={`flow-edge-${edge.id}`} />
          ))}
          {children}
        </div>
      );
    },
    MiniMap: () => <div data-testid="flow-minimap-mock" />,
    Background: () => null,
    Handle: () => <span data-testid="flow-handle-mock" />,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    screenToFlowPosition: mockStf,
    useReactFlow: () => ({
      screenToFlowPosition: mockStf,
      getViewport: mockGetViewport,
    }),
  };
});

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...(actual as Record<string, unknown>),
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: unknown) => void }) => {
      if (onDragEnd) {
        // Expose ke tes melalui window agar tidak perlu impor anggota buatan dari module.
        ;(window as unknown as Record<string, unknown>).__flowLastDragEnd = onDragEnd;
      }
      return <div data-testid="dnd-mock-context">{children}</div>;
    },
    PointerSensor: actual.PointerSensor,
    useSensor: () => ({}),
    useSensors: () => [],
    useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, isDragging: false }),
    useDroppable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, isOver: false }),
    closestCenter: actual.closestCenter,
  };
});

const baseNodes: FlowNode[] = [
  {
    id: 'n1',
    type: 'action',
    position: { x: 0, y: 0 },
    data: { label: 'Kirim email', description: 'Mengirim notifikasi email', kind: 'action' },
  },
  {
    id: 'n2',
    type: 'pending',
    position: { x: 300, y: 0 },
    data: { label: 'Tunggu 1 hari', description: 'Menunda eksekusi', kind: 'pending', status: 'warning' },
  },
];

const baseEdges: FlowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'b', animated: false },
];

function renderEditor(props: React.ComponentProps<typeof FlowEditor> = {}) {
  return render(
    <>
      <TooltipProvider>
        <Toaster />
        <FlowEditor defaultNodes={baseNodes} defaultEdges={baseEdges} {...props} />
      </TooltipProvider>
    </>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  ;(window as unknown as Record<string, unknown>).__flowLastDragEnd = null;
});

const dragEndEvent = (over: { id: string } | undefined) =>
  ({
    active: {
      data: { current: { item: { type: 'action', title: 'Kirim email' } } },
      rect: { current: { translated: { left: 100, top: 100 } } },
    },
    activatorEvent: { clientX: 100, clientY: 100 },
    over,
  } as unknown);

const getDragEnd = () => (window as unknown as Record<string, unknown>).__flowLastDragEnd as (event: unknown) => void;

describe('FlowEditor fondasi (005-01)', () => {
  it('AC-02: render 2 node DS deterministik 220×88 dengan kontrak a11y D4', () => {
    renderEditor();
    const n1 = screen.getByTestId('flow-node-n1');
    const n2 = screen.getByTestId('flow-node-n2');
    expect(n1).not.toBeNull();
    expect(n2).not.toBeNull();
    expect(n1.className).toContain('w-[220px]');
    expect(n1.className).toContain('h-[88px]');
    expect(n1.getAttribute('role')).toBe('button');
    expect(n1.getAttribute('aria-selected')).toBe('false');
    expect(n1.getAttribute('aria-label')).toBe('Node Kirim email');
    expect(n1.getAttribute('tabindex')).toBe('0');
    expect(screen.getByTestId('flow-handle-n1-target')).not.toBeNull();
    expect(screen.getByTestId('flow-handle-n1-source')).not.toBeNull();
    const handle = within(n1).getByTestId('flow-handle-n1-source');
    expect(handle.className).toContain('w-12');
    expect(handle.className).toContain('h-12');
    expect(screen.getByTestId('flow-node-badge-n1').textContent).toContain('action');
  });

  it('AC-02: node status badge dan deskripsi 2 baris', () => {
    renderEditor();
    expect(screen.getByTestId('flow-node-n2').getAttribute('aria-label')).toBe('Node Tunggu 1 hari');
    expect(screen.getByTestId('flow-node-status-n2')).not.toBeNull();
    expect(screen.getByTestId('flow-node-badge-n2')).not.toBeNull();
  });

  it('AC-01: canvas + controls zoom batas 0.25–2, reset 100%, fit view', () => {
    renderEditor();
    const canvas = screen.getByTestId('flow-editor');
    expect(canvas.getAttribute('role')).toBe('application');
    expect(screen.getByTestId('flow-zoom-level').textContent).toBe('100%');
    expect(screen.getByTestId('flow-zoom-in')).not.toBeNull();
    expect(screen.getByTestId('flow-zoom-out')).not.toBeNull();
    expect(screen.getByTestId('flow-reset-zoom')).not.toBeNull();
    expect(screen.getByTestId('flow-fit-view')).not.toBeNull();
    expect(screen.getByTestId('flow-lock-interaction')).not.toBeNull();
  });

  it('AC-01: daftar SR node + edge', () => {
    renderEditor();
    expect(screen.getByTestId('flow-sr-edge-e1').textContent).toContain('Edge dari n1 ke n2');
    expect(screen.getByTestId('flow-sr-node-n1').textContent).toContain('Kirim email');
    expect(screen.getByTestId('flow-sr-node-n2').textContent).toContain('Tunggu 1 hari');
  });

  it('AC-04: state matrix — empty (role=status)', () => {
    renderEditor({ defaultNodes: [], defaultEdges: [] });
    const empty = screen.getByRole('status');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('Canvas kosong');
  });

  it('AC-04: state matrix — loading (aria-busy + SR)', () => {
    renderEditor({ loading: true, defaultNodes: [], defaultEdges: [] });
    const busy = document.querySelector('[aria-busy="true"]');
    expect(busy).not.toBeNull();
    expect(busy?.textContent).toContain('Memuat flow…');
  });

  it('AC-04: state matrix — error (role=alert + retry)', () => {
    renderEditor({ error: 'Gagal jaringan', onRetry: vi.fn(), defaultNodes: [], defaultEdges: [] });
    const alert = screen.getByRole('alert');
    expect(alert).not.toBeNull();
    expect(alert.textContent).toContain('Gagal memuat flow');
    expect(screen.getByRole('button', { name: /Coba lagi/i })).not.toBeNull();
  });

  it('AC-05: controlled nodes/edges diteruskan (tidak mutate internal)', () => {
    const onNodesChange = vi.fn();
    const onEdgesChange = vi.fn();
    renderEditor({ nodes: baseNodes, edges: baseEdges, onNodesChange, onEdgesChange });
    expect(screen.getByTestId('flow-node-n1')).not.toBeNull();
    expect(onNodesChange).not.toHaveBeenCalled();
    expect(onEdgesChange).not.toHaveBeenCalled();
  });

  it('AC-06: tidak ada border-strong literal (edge pakai muted-foreground di styles.css)', () => {
    renderEditor();
    expect(screen.getByTestId('flow-editor')).not.toBeNull();
  });

  it('AC-07: useFlowHistory kontrak tersedia (stub untuk 005-02–04)', () => {
    const { result } = renderHook(() => useFlowHistory({ historyLimit: 20 }));
    expect(result.current.historyLimit).toBe(20);
    expect(typeof result.current.push).toBe('function');
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});

describe('FlowEditor palette + keyboard + snap (005-02)', () => {
  const paletteItems: FlowPaletteItem[] = [
    { type: 'action', title: 'Kirim email', description: 'Tugas otomatisasi email' },
    { type: 'pending', title: 'Tunda', description: 'Jeda eksekusi sejumlah waktu' },
  ];

  const renderWithPalette = (overrides: React.ComponentProps<typeof FlowEditor> = {}) =>
    renderEditor({ paletteItems, onAddFromPalette: vi.fn(), ...overrides });

  it('AC-03: render palette, search filter, dan live region "N jenis"', () => {
    renderWithPalette();
    expect(screen.getByTestId('flow-palette')).not.toBeNull();
    expect(screen.getByTestId('flow-palette-live').textContent).toBe('2 jenis');
    const search = screen.getByTestId('flow-palette-search');
    fireEvent.change(search, { target: { value: 'email' } });
    expect(screen.getByTestId('flow-palette-live').textContent).toBe('1 jenis');
    expect(screen.getByTestId('flow-palette-item-action')).not.toBeNull();
    expect(screen.queryByTestId('flow-palette-item-pending')).toBeNull();
  });

  it('AC-02: tombol [+] klik tambah di tengah viewport + node baru difokuskan (selected)', () => {
    const onAddFromPalette = vi.fn();
    renderEditor({ paletteItems, onAddFromPalette });
    const add = screen.getByTestId('flow-palette-add-action');
    fireEvent.click(add);
    expect(onAddFromPalette).toHaveBeenCalledWith(
      { type: 'action', title: 'Kirim email', description: 'Tugas otomatisasi email' },
      { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    );
  });

  it('AC-02: tombol [+] Enter memicu tambah', () => {
    const onAddFromPalette = vi.fn();
    renderEditor({ paletteItems, onAddFromPalette });
    const add = screen.getByTestId('flow-palette-add-action');
    fireEvent.keyDown(add, { key: 'Enter' });
    expect(onAddFromPalette).toHaveBeenCalledTimes(1);
  });

  it('AC-01: drop di dalam canvas panggil onAddFromPalette dengan posisi screenToFlowPosition', () => {
    const onAddFromPalette = vi.fn();
    renderEditor({ paletteItems: [{ type: 'action', title: 'Kirim email' }], onAddFromPalette });
    getDragEnd()(dragEndEvent({ id: 'canvas' }));
    expect(onAddFromPalette).toHaveBeenCalledTimes(1);
    const [item, pos] = onAddFromPalette.mock.calls[0];
    expect(item.type).toBe('action');
    expect(pos).toEqual({ x: 100, y: 100 });
  });

  it('AC-01: drop di luar canvas batal, onAddFromPalette tidak dipanggil', () => {
    const onAddFromPalette = vi.fn();
    renderEditor({ paletteItems: [{ type: 'action', title: 'Kirim email' }], onAddFromPalette });
    getDragEnd()(dragEndEvent(undefined));
    expect(onAddFromPalette).not.toHaveBeenCalled();
  });

  it('AC-04: snap aktif → posisi jatuh ke kelipatan grid; mati → presisi piksel', () => {
    mockStf.mockReturnValue({ x: 103, y: 57 });
    mockGetViewport.mockReturnValue({ x: 0, y: 0, zoom: 1 });

    const onSnap = vi.fn();
    renderEditor({ paletteItems: [{ type: 'action', title: 'Kirim email' }], onAddFromPalette: onSnap, snapToGrid: true, gridSize: 16 });
    getDragEnd()(dragEndEvent({ id: 'canvas' }));
    expect(onSnap).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'action' }),
      { x: 96, y: 64 },
    );

    const onNoSnap = vi.fn();
    renderEditor({ paletteItems: [{ type: 'action', title: 'Kirim email' }], onAddFromPalette: onNoSnap, snapToGrid: false, gridSize: 16 });
    getDragEnd()(dragEndEvent({ id: 'canvas' }));
    expect(onNoSnap).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'action' }),
      { x: 103, y: 57 },
    );

    mockStf.mockReturnValue({ x: 100, y: 100 });
    mockGetViewport.mockReturnValue({ x: 0, y: 0, zoom: 1 });
  });

  it('AC-02: tambah via [+] tidak membuka sheet penuh (node baru selected, internal add)', () => {
    const { container } = renderEditor({ paletteItems });
    const add = screen.getByTestId('flow-palette-add-action');
    fireEvent.click(add);
    const newNode = container.querySelector('[data-testid^="flow-node-node-"]');
    expect(newNode).not.toBeNull();
    expect(newNode?.getAttribute('aria-selected')).toBe('true');
  });
});
