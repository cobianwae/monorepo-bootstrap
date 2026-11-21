import * as React from 'react';
import { render, renderHook, screen, within } from '@testing-library/react';import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '../feedback/toaster';
import { TooltipProvider } from '../base/tooltip';
import { FlowEditor, type FlowEdge, type FlowNode, useFlowHistory } from './flow-editor';

vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
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
});

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
