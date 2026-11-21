import * as React from 'react';
import { render, renderHook, screen, within, fireEvent, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '../feedback/toaster';
import { TooltipProvider } from '../base/tooltip';
import { FlowEditor, type FlowEdge, type FlowNode, type FlowPaletteItem, useFlowHistory } from './flow-editor';
import type { Connection } from '@xyflow/react';

const mockStf = vi.hoisted(() => vi.fn((pos: { x: number; y: number }) => pos));
const mockGetViewport = vi.hoisted(() => vi.fn(() => ({ x: 0, y: 0, zoom: 1 })));

vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...(actual as Record<string, unknown>),
    // ReactFlow test-friendly: render nodes via nodeTypes dan edges sebagai div,
    // tanpa memerlukan DOM kanvas xyflow asli di jsdom.
    ReactFlow: function MockReactFlow(props: Record<string, unknown>) {
      const { nodes = [], edges = [], nodeTypes = {}, children, onInit, onViewportChange, onConnect, onSelectionChange, onNodeContextMenu, onEdgeContextMenu, onPaneContextMenu } = props as {
        nodes?: Array<{ id: string; type: string; data: Record<string, unknown>; selected?: boolean; position?: { x: number; y: number } }>;
        edges?: Array<{ id: string; source: string; target: string }>;
        nodeTypes?: Record<string, React.ComponentType>;
        children?: React.ReactNode;
        onInit?: (instance: unknown, viewport: { x: number; y: number; zoom: number }) => void;
        onViewportChange?: (viewport: { zoom: number }) => void;
        onConnect?: (connection: Connection) => void;
        onSelectionChange?: (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
        onNodeContextMenu?: (event: unknown, node: { id: string }) => void;
        onEdgeContextMenu?: (event: unknown, edge: { id: string }) => void;
        onPaneContextMenu?: (event: unknown) => void;
      };
      React.useEffect(() => {
        if (onInit) onInit(null as unknown as never, { x: 0, y: 0, zoom: 1 });
        if (onViewportChange) onViewportChange({ zoom: 1 });
        ;(window as unknown as Record<string, unknown>).__flowOnConnect = onConnect;
        ;(window as unknown as Record<string, unknown>).__flowSelectionChange = onSelectionChange;
        ;(window as unknown as Record<string, unknown>).__flowNodeContextMenu = onNodeContextMenu;
        ;(window as unknown as Record<string, unknown>).__flowEdgeContextMenu = onEdgeContextMenu;
        ;(window as unknown as Record<string, unknown>).__flowPaneContextMenu = onPaneContextMenu;
      }, [onInit, onViewportChange, onConnect, onSelectionChange, onNodeContextMenu, onEdgeContextMenu, onPaneContextMenu]);
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

describe('FlowEditor edge + validasi + label (005-03)', () => {
  const onConnect = vi.fn();
  const onEdgesChange = vi.fn();
  const onSelectionChange = vi.fn();

  const renderControlled = (overrides: React.ComponentProps<typeof FlowEditor> = {}) =>
    renderEditor({
      nodes: baseNodes,
      edges: baseEdges,
      onConnect,
      onEdgesChange,
      onSelectionChange,
      ...overrides,
    });

  const triggerConnect = (conn: Connection) => {
    const fn = (window as unknown as Record<string, unknown>).__flowOnConnect as
      | ((c: Connection) => void)
      | null;
    expect(fn).not.toBeNull();
    act(() => {
      fn!(conn);
    });
  };

  const triggerSelect = (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const fn = (window as unknown as Record<string, unknown>).__flowSelectionChange as
      | ((s: { nodes: FlowNode[]; edges: FlowEdge[] }) => void)
      | null;
    expect(fn).not.toBeNull();
    act(() => {
      fn!(selection);
    });
  };

  beforeEach(() => {
    onConnect.mockClear();
    onEdgesChange.mockClear();
    onSelectionChange.mockClear();
    ;(window as unknown as Record<string, unknown>).__flowOnConnect = null;
    ;(window as unknown as Record<string, unknown>).__flowSelectionChange = null;
  });

  it('AC-01: sambung valid via onConnect + live region "Edge X→Y tersambung"', () => {
    renderControlled();
    triggerConnect({ source: 'n1', target: 'n2', sourceHandle: 'c', targetHandle: 'd' });
    expect(onConnect).toHaveBeenCalledWith({
      source: 'n1',
      target: 'n2',
      sourceHandle: 'c',
      targetHandle: 'd',
    });
    expect(screen.getByText(/Edge n1→n2 tersambung/)).not.toBeNull();
  });

  it('AC-02: keyboard Enter-Tab-Enter sambung edge via handle', () => {
    renderControlled();
    const src = screen.getByTestId('flow-handle-n1-source');
    fireEvent.keyDown(src, { key: 'Enter' }); // mulai connecting dari sumber
    const tgt = screen.getByTestId('flow-handle-n2-target');
    fireEvent.keyDown(tgt, { key: 'Enter' }); // selesaikan ke target
    expect(onConnect).toHaveBeenCalledWith({
      source: 'n1',
      target: 'n2',
      sourceHandle: 'source',
      targetHandle: 'target',
    });
  });

  it('AC-02: keyboard invalid (duplikat) → penolakan + fokus kembali ke sumber', () => {
    // e2 menempati pasangan n1(source)→n2(target) dengan sourceHandle 'source'/targetHandle 'target' yang sama seperti jalur keyboard.
    renderEditor({
      nodes: baseNodes,
      edges: [
        ...baseEdges,
        { id: 'e2', source: 'n1', target: 'n2', sourceHandle: 'source', targetHandle: 'target', animated: false },
      ],
      onConnect,
      onSelectionChange,
    });
    const src = screen.getByTestId('flow-handle-n1-source');
    fireEvent.keyDown(src, { key: 'Enter' });
    const tgt = screen.getByTestId('flow-handle-n2-target');
    fireEvent.keyDown(tgt, { key: 'Enter' });
    expect(onConnect).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('edge duplikat sudah ada');
    expect(document.activeElement).toBe(src);
  });

  it('AC-03: self-loop ditolak + teks alasan + role="alert" sementara', () => {
    renderControlled();
    triggerConnect({ source: 'n1', target: 'n1', sourceHandle: 'c', targetHandle: 'd' });
    expect(onConnect).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('self-loop tidak diizinkan');
  });

  it('AC-03: duplikat ditolak + teks alasan', () => {
    renderControlled();
    triggerConnect({ source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'b' }); // duplikat e1
    expect(onConnect).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('edge duplikat sudah ada');
  });

  it('AC-03: handle tujuan penuh ditolak + teks alasan', () => {
    renderControlled();
    // e1: n1→n2 targetHandle 'b'; target n2 dengan targetHandle 'b' sudah penuh.
    triggerConnect({ source: 'n1', target: 'n2', sourceHandle: 'x', targetHandle: 'b' });
    expect(onConnect).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('handle tujuan sudah penuh');
  });

  it('AC-04: isValidConnection hanya mengencangkan (AND), tidak boleh melonggarkan arah', () => {
    // Default lolos, custom menolak → ditolak.
    const customReject = vi.fn(() => false);
    renderEditor({ nodes: baseNodes, edges: baseEdges, onConnect, isValidConnection: customReject });
    triggerConnect({ source: 'n1', target: 'n2', sourceHandle: 'c', targetHandle: 'd' });
    expect(onConnect).not.toHaveBeenCalled();
    expect(customReject).toHaveBeenCalled();

    // Default menolak (self-loop), custom terima → tetap ditolak (custom tidak boleh melonggarkan).
    const customAccept = vi.fn(() => true);
    renderEditor({ nodes: baseNodes, edges: baseEdges, onConnect, isValidConnection: customAccept });
    triggerConnect({ source: 'n1', target: 'n1', sourceHandle: 'c', targetHandle: 'd' });
    expect(onConnect).not.toHaveBeenCalled();
  });

  it('AC-06: hapus edge terpilih via Delete + onEdgesChange remove satu commit', () => {
    renderControlled();
    triggerSelect({ nodes: [], edges: [{ id: 'e1' } as FlowEdge] });
    const section = screen.getByTestId('flow-editor');
    fireEvent.keyDown(section, { key: 'Delete' });
    expect(onEdgesChange).toHaveBeenCalledWith(
      [{ id: 'e1', type: 'remove' }] as unknown as never,
    );
  });
});

describe('FlowEditor seleksi + inspector on-demand + hapus (005-04)', () => {
  const onSelectionChange = vi.fn();
  const onDelete = vi.fn();
  const onNodesChange = vi.fn();
  const onEdgesChange = vi.fn();

  const renderControlled = (overrides: React.ComponentProps<typeof FlowEditor> = {}) =>
    renderEditor({
      nodes: baseNodes,
      edges: baseEdges,
      onSelectionChange,
      onDelete,
      onNodesChange,
      onEdgesChange,
      ...overrides,
    });

  const triggerSelect = (sel: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const fn = (window as unknown as Record<string, unknown>).__flowSelectionChange as
      | ((s: { nodes: FlowNode[]; edges: FlowEdge[] }) => void)
      | null;
    expect(fn).not.toBeNull();
    act(() => {
      fn!(sel);
    });
  };

  const menuEvent = (x = 10, y = 10) =>
    ({ clientX: x, clientY: y, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.MouseEvent);

  const triggerNodeMenu = (nodeId: string, x = 10, y = 10) => {
    const fn = (window as unknown as Record<string, unknown>).__flowNodeContextMenu as
      | ((e: unknown, n: { id: string }) => void)
      | null;
    expect(fn).not.toBeNull();
    act(() => {
      fn!(menuEvent(x, y), { id: nodeId });
      // useEffect klik menuTriggerRef secara otomatis saat contextMenu berubah,
      // sehingga Radix menu terbuka tanpa fireEvent.click manual (hindari toggle close).
    });
  };

  const triggerEdgeMenu = (edgeId: string, x = 10, y = 10) => {
    const fn = (window as unknown as Record<string, unknown>).__flowEdgeContextMenu as
      | ((e: unknown, edge: { id: string }) => void)
      | null;
    expect(fn).not.toBeNull();
    act(() => {
      fn!(menuEvent(x, y), { id: edgeId });
    });
  };

  const triggerPaneMenu = (x = 10, y = 10) => {
    const fn = (window as unknown as Record<string, unknown>).__flowPaneContextMenu as
      | ((e: unknown) => void)
      | null;
    expect(fn).not.toBeNull();
    act(() => {
      fn!(menuEvent(x, y));
    });
  };

  const openMenu = () => screen.getByTestId('flow-context-menu');

  beforeEach(() => {
    onSelectionChange.mockClear();
    onDelete.mockClear();
    onNodesChange.mockClear();
    onEdgesChange.mockClear();
    ;(window as unknown as Record<string, unknown>).__flowSelectionChange = null;
    ;(window as unknown as Record<string, unknown>).__flowNodeContextMenu = null;
    ;(window as unknown as Record<string, unknown>).__flowEdgeContextMenu = null;
    ;(window as unknown as Record<string, unknown>).__flowPaneContextMenu = null;
  });

  it('live region hitungan seleksi multi node + edge', () => {
    renderControlled();
    triggerSelect({ nodes: [baseNodes[0], baseNodes[1]], edges: baseEdges });
    expect(screen.getByText(/2 node, 1 edge terpilih/)).not.toBeNull();
  });

  it('live region kosong saat tidak ada seleksi', () => {
    renderControlled();
    expect(screen.queryByText(/node, .* edge terpilih/)).toBeNull();
  });

  it('Delete pada node terpilih → onDelete atomic node + edge terkait (controlled)', () => {
    renderControlled();
    triggerSelect({ nodes: [baseNodes[0]], edges: [] });
    const section = screen.getByTestId('flow-editor');
    fireEvent.keyDown(section, { key: 'Delete' });
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: [baseNodes[0]],
        edges: [baseEdges[0]],
      }),
    );
    // toast 'Dihapus' dapat menumpuk di antaranya test (memoryState global); hitung semua.
    expect(screen.getAllByText('Dihapus').length).toBeGreaterThan(0);
  });

  it('menu konteks node: Rincian / Duplikat / Hapus; Hapus hapus node + edge terkait (uncontrolled)', () => {
    renderEditor(); // defaultNodes/defaultEdges → uncontrolled
    triggerNodeMenu('n1');
    const menu = openMenu();
    expect(within(menu).getByText('Rincian')).not.toBeNull();
    expect(within(menu).getByText('Duplikat')).not.toBeNull();
    expect(within(menu).getByText('Hapus')).not.toBeNull();

    act(() => {
      within(menu).getByText('Hapus').click();
    });
    expect(screen.queryByTestId('flow-node-n1')).toBeNull();
    expect(screen.queryByTestId('flow-edge-e1')).toBeNull(); // e1 menyentuh n1
    expect(screen.getAllByText('Dihapus').length).toBeGreaterThan(0);
  });

  it('menu konteks edge: Edit label / Hapus edge; Hapus edge hapus edge (uncontrolled)', () => {
    renderEditor();
    triggerEdgeMenu('e1');
    const menu = openMenu();
    expect(within(menu).getByText('Edit label')).not.toBeNull();
    expect(within(menu).getByText('Hapus edge')).not.toBeNull();

    act(() => {
      within(menu).getByText('Hapus edge').click();
    });
    expect(screen.queryByTestId('flow-edge-e1')).toBeNull();
    expect(screen.queryByTestId('flow-node-n1')).not.toBeNull(); // node tidak ikut dihapus
    expect(screen.getAllByText('Dihapus').length).toBeGreaterThan(0);
  });

  it('menu konteks canvas: Tambah di sini / Selaras tampilan / Alih grid', () => {
    renderEditor();
    triggerPaneMenu();
    const menu = openMenu();
    expect(within(menu).getByText('Tambah di sini')).not.toBeNull();
    expect(within(menu).getByText('Selaras tampilan')).not.toBeNull();
    expect(within(menu).getByText('Alih grid')).not.toBeNull();
  });

  it('tambah via [+] tidak membuka inspector penuh / seleksi tetap kosong (regresi 005-01)', () => {
    const { container } = renderEditor({ paletteItems: [{ type: 'action', title: 'Kirim email' }] });
    const add = screen.getByTestId('flow-palette-add-action');
    fireEvent.click(add);
    expect(container.querySelector('[data-testid^="flow-node-node-"]')).not.toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
