'use client';

// FlowEditor — fondasi canvas + node custom DS (story 005-01, PRD 005, design flow-editor).
// Wrapper di atas @xyflow/react 13.0.2 (sudah terdaftar; bukan dependency baru).
// Default CSS xyflow TIDAK diimpor — semua permukaan dipetakan ke token (design D1/D11).
// Kontrak deklaratif penuh (design D3): nodes/edges controlled + onNodesChange/onEdgesChange/
// onConnect/onSelectionChange; uncontrolled via defaultNodes/defaultEdges untuk demo.
// State matrix: loading (skeleton + aria-busy), empty (role="status" + CTA), error (role="alert" + retry).
// a11y (design D11): canvas role="application", handle hit-area ≥44px + ring primary,
// keyboard Enter spasi pilih node, Delete hapus, +/- zoom, 0 reset 100%, F fit view,
// daftar alternatif ul node+edge untuk screen reader.

import * as React from 'react';
import type { ComponentType } from 'react';
import {
  Background,
  Handle,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeChangeset,
  type Node,
  type NodeChange,
  type NodeChangeset,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type NodeTypes,
  type Position,
  type BackgroundVariant,
  type XYPosition,
} from '@xyflow/react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../navigation/context-menu';
import { Badge } from '../base/badge';
import { EmptyState } from '../feedback/empty-state';
import { Skeleton } from '../base/skeleton';
import { toast } from '../feedback/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../base/tooltip';
import { SkipLink } from '../layout/skip-link';

// ---------------------------------------------------------------------------
// Tipe publik (design §2)
// ---------------------------------------------------------------------------

export type FlowStatus = 'default' | 'running' | 'success' | 'warning' | 'error';

export interface FlowNodeData extends Record<string, unknown> {
  label: string; // judul — wajib non-kosong
  description?: string; // maks 2 baris di node
  kind?: string; // nama jenis dari palette
  status?: FlowStatus; // FR-016 could
  disabled?: boolean; // FR-016 could
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge & { label?: string };

export interface FlowSelection {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowPaletteItem {
  type: string; // kunci nodeTypes
  title: string; // mis. 'Kirim email'
  description?: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface FlowEditorProps {
  nodes?: FlowNode[]; // controlled; bila diisi wajib disertai handler
  edges?: FlowEdge[]; // controlled; bila diisi wajib disertai handler
  onNodesChange?: OnNodesChange<FlowNode>;
  onEdgesChange?: OnEdgesChange<FlowEdge>;
  onConnect?: OnConnect;
  onSelectionChange?: (selection: FlowSelection) => void; // wajib untuk inspector
  onDelete?: (selection: FlowSelection) => void; // hapus atomik node+edge (story 005-04)
  defaultNodes?: FlowNode[]; // uncontrolled demo
  defaultEdges?: FlowEdge[]; // uncontrolled demo
  nodeTypes?: Record<string, ComponentType<{ data: FlowNodeData; selected?: boolean }>>; // kontrak a11y D4
  paletteItems?: FlowPaletteItem[]; // bila diisi, FlowPalette dirender (story 005-02)
  onAddFromPalette?: (item: FlowPaletteItem, position: { x: number; y: number }) => void;
  isValidConnection?: (
    connection: {
      source: string;
      target: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    },
  ) => boolean;
  minimap?: boolean; // default true (FR-008)
  snapToGrid?: boolean; // default false (FR-009)
  gridSize?: number; // default 16
  loading?: boolean; // FR-013
  error?: string | null; // FR-013 eksternal
  onRetry?: () => void; // FR-013
  emptyActionLabel?: string; // default 'Tambah node pertama'
  onEmptyAction?: () => void;
  historyLimit?: number; // default 50 (FR-007)
  ariaLabel?: string; // default 'Editor alur'
  className?: string;
}

// ---------------------------------------------------------------------------
// Konteks koneksi keyboard edge (story 005-03 AC-02).
// Digunakan oleh FlowNode/FlowHandle tanpa perlu membungkus nodeTypes,
// sehingga elemen handle tidak ter-remount saat status connecting berubah
// dan referensi elemen untuk fokus-kembali tetap valid.
// ---------------------------------------------------------------------------

interface FlowConnectContextValue {
  connecting: { nodeId: string } | null;
  setConnecting: React.Dispatch<React.SetStateAction<{ nodeId: string } | null>>;
  registerHandleRefs: (nodeId: string, refs: { source: HTMLElement; target: HTMLElement }) => void;
  onHandleKeyDown: (nodeId: string, type: 'source' | 'target', key: string) => void;
}

const FlowConnectContext = React.createContext<FlowConnectContextValue | null>(null);

// ---------------------------------------------------------------------------
// useFlowHistory — kontrak untuk story 005-02–04 (implementasi penuh di 005-05)
// ---------------------------------------------------------------------------

export interface FlowSnapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface UseFlowHistory {
  push: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  undo: (current: FlowSnapshot) => FlowSnapshot | null;
  redo: (current: FlowSnapshot) => FlowSnapshot | null;
  canUndo: boolean;
  canRedo: boolean;
  historyLimit: number;
}

function cloneFlowNode(node: FlowNode): FlowNode {
  return { ...node, position: { ...node.position }, data: { ...node.data } };
}

function cloneFlowEdge(edge: FlowEdge): FlowEdge {
  return { ...edge };
}

function cloneFlowSnapshot(snapshot: FlowSnapshot): FlowSnapshot {
  return {
    nodes: snapshot.nodes.map(cloneFlowNode),
    edges: snapshot.edges.map(cloneFlowEdge),
  };
}

/**
 * Riwayat terbatas (bounded) default `historyLimit` 50.
 * - `push(nodes, edges)` menyimpan snapshot SEBELUM mutasi pengguna.
 * - `undo(current)`/`redo(current)` mengembalikan snapshot yang akan dipulihkan;
 *   `current` adalah state yang sedang aktif sehingga bisa dipindahkan ke stack
 *   lawan (redo/undo). FlowEditor yang menerapkannya melalui
 *   onNodesChange/onEdgesChange (controlled) atau state internal (uncontrolled).
 * - Flag `applying` mencegah push-balik saat undo/redo menerapkan snapshot
 *   (avoid loop). Cabang baru (push setelah undo) membersihkan redo stack.
 */
export function useFlowHistory({ historyLimit = 50 }: { historyLimit?: number } = {}): UseFlowHistory {
  const [undoStack, setUndoStack] = React.useState<FlowSnapshot[]>([]);
  const [redoStack, setRedoStack] = React.useState<FlowSnapshot[]>([]);
  const applying = React.useRef(false);

  const push = React.useCallback(
    (nodes: FlowNode[], edges: FlowEdge[]) => {
      if (applying.current) return;
      const snap: FlowSnapshot = {
        nodes: nodes.map(cloneFlowNode),
        edges: edges.map(cloneFlowEdge),
      };
      setUndoStack((prev) => {
        const next = [...prev, snap];
        if (next.length > historyLimit) next.shift();
        return next;
      });
      setRedoStack([]); // cabang baru membersihkan redo
    },
    [historyLimit],
  );

  const undo = React.useCallback(
    (current: FlowSnapshot): FlowSnapshot | null => {
      if (undoStack.length === 0) return null;
      applying.current = true;
      try {
        const restore = undoStack[undoStack.length - 1];
        setRedoStack((prev) => [...prev, cloneFlowSnapshot(current)]);
        setUndoStack((prev) => prev.slice(0, -1));
        return restore;
      } finally {
        applying.current = false;
      }
    },
    [undoStack],
  );

  const redo = React.useCallback(
    (current: FlowSnapshot): FlowSnapshot | null => {
      if (redoStack.length === 0) return null;
      applying.current = true;
      try {
        const restore = redoStack[redoStack.length - 1];
        setUndoStack((prev) => {
          const next = [...prev, cloneFlowSnapshot(current)];
          if (next.length > historyLimit) next.shift();
          return next;
        });
        setRedoStack((prev) => prev.slice(0, -1));
        return restore;
      } finally {
        applying.current = false;
      }
    },
    [redoStack, historyLimit],
  );

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return { push, undo, redo, canUndo, canRedo, historyLimit };
}

// ---------------------------------------------------------------------------
// Handle kustom — hit-area ≥44px (visual 12px + padding transparan) + a11y
// ---------------------------------------------------------------------------

interface FlowHandleProps {
  type: 'source' | 'target';
  position: 'left' | 'right';
  isConnectable?: boolean;
  dataTestId?: string;
  nodeId: string;
}

const FlowHandle = React.forwardRef<HTMLDivElement, FlowHandleProps>(
  ({ type, position, isConnectable = true, dataTestId, nodeId }, ref) => {
    const connectCtx = React.useContext(FlowConnectContext);
    const onHandleKeyDown = connectCtx?.onHandleKeyDown;
    const isConnectingSource = connectCtx?.connecting?.nodeId === nodeId;
    const sideClass = position === 'left' ? '-left-2.5' : '-right-2.5';
    return (
      <div
        ref={ref}
        data-testid={dataTestId}
        tabIndex={0}
        aria-label={type === 'source' ? `Handle keluaran ${nodeId}` : `Handle masuk ${nodeId}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void onHandleKeyDown?.(nodeId, type, event.key);
          }
        }}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 flex items-center justify-center',
          sideClass,
          'w-12 h-12 rounded-full bg-border shadow-sm cursor-pointer',
          'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
          isConnectingSource ? 'ring-2 ring-primary ring-offset-2' : '',
          isConnectable === false ? 'opacity-50 cursor-not-allowed' : '',
        )}
      >
        <Handle type={type} position={position as Position} className="h-3 w-3 rounded-full" />
      </div>
    );
  });
FlowHandle.displayName = 'FlowHandle';

// ---------------------------------------------------------------------------
// Node custom DS — ukuran deterministik 220×88, kontrak a11y D4
// ---------------------------------------------------------------------------

interface FlowNodeProps {
  data: FlowNodeData;
  id: string;
  selected: boolean;
  positionX: number;
  positionY: number;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  status?: FlowStatus;
}

function FlowNode({
  data,
  id,
  selected,
  positionX,
  positionY,
  onSelect,
  onDelete,
  status = 'default',
}: FlowNodeProps) {
  const connectCtx = React.useContext(FlowConnectContext);
  const registerHandleRefs = connectCtx?.registerHandleRefs;
  const sourceRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (registerHandleRefs && sourceRef.current && targetRef.current) {
      registerHandleRefs(id, { source: sourceRef.current, target: targetRef.current });
    }
  }, [id, registerHandleRefs, sourceRef, targetRef]);
  const isDisabled = data.disabled === true;
  const statusDot = {
    default: 'bg-muted',
    running: 'bg-primary animate-pulse',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  }[status];
  const statusText = {
    default: 'text-muted-foreground',
    running: 'text-primary-foreground',
    success: 'text-success-foreground',
    warning: 'text-warning-foreground',
    error: 'text-destructive-foreground',
  }[status];
  const statusLabel = {
    default: 'Siap',
    running: 'Berjalan',
    success: 'Sukses',
    warning: 'Peringatan',
    error: 'Gagal',
  }[status];

  return (
    <div
      data-testid={`flow-node-${id}`}
      className={cn(
        'absolute left-0 top-0 z-10 flex w-[220px] h-[88px] flex-col items-start gap-1 rounded-md border shadow-sm transition-colors duration-200',
        'border-border bg-card text-foreground',
        selected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50',
        isDisabled ? 'opacity-60' : '',
      )}
      style={{ transform: `translate(${positionX}px, ${positionY}px)` }}
      role="button"
      aria-selected={selected ? true : false}
      aria-label={`Node ${data.label}`}
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled || undefined}
      onClick={() => {
        if (isDisabled) return;
        void onSelect?.(id);
      }}
      onKeyDown={(event) => {
        if (isDisabled) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          void onSelect?.(id);
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault();
          void onDelete?.(id);
        }
      }}
    >
      <div className="flex w-full items-center gap-2 p-3 pr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'truncate w-full text-sm font-medium leading-none',
                isDisabled ? 'text-muted-foreground' : 'text-foreground',
              )}
              title={data.label}
            >
              {data.label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{data.label}</TooltipContent>
        </Tooltip>
        <Badge variant="outline" className="text-xs shrink-0 whitespace-nowrap" data-testid={`flow-node-badge-${id}`}>
          {data.kind ?? '-'}
        </Badge>
      </div>
      <div className="flex w-full flex-col gap-0.5 px-3 pt-0.5 pb-2">
        <p className={cn('text-xs text-muted-foreground line-clamp-2', isDisabled ? 'opacity-80' : '')}>
          {data.description ?? ''}
        </p>
        <div className="flex w-full items-end justify-between">
          <span
            className="flex items-center gap-1"
            data-testid={`flow-node-status-${id}`}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDot)} aria-hidden="true" />
            <span className={cn('text-micro', statusText)}>{statusLabel}</span>
          </span>
          {isDisabled ? <span className="text-micro text-muted-foreground">disabled</span> : null}
        </div>
      </div>
      {/* Handle kiri = input (target), kanan = output (source). Hit-area ≥44px via wrapper 48×48. */}
      <FlowHandle
        ref={targetRef}
        type="target" position="left"
        dataTestId={`flow-handle-${id}-target`}
        nodeId={id}
      />
      <FlowHandle
        ref={sourceRef}
        type="source" position="right"
        dataTestId={`flow-handle-${id}-source`}
        nodeId={id}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2 nodeTypes demo: aksi + penunda (FR-002)
// ---------------------------------------------------------------------------

function ActionNode(props: FlowNodeProps) {
  return <FlowNode {...props} status="default" />;
}

function PendingNode(props: FlowNodeProps) {
  return <FlowNode {...props} status="warning" />;
}

const defaultNodeTypes: Record<string, ComponentType<{ data: FlowNodeData; selected?: boolean }>> = {
  action: ActionNode as unknown as ComponentType<{ data: FlowNodeData; selected?: boolean }>,
  pending: PendingNode as unknown as ComponentType<{ data: FlowNodeData; selected?: boolean }>,
};

// ---------------------------------------------------------------------------
// FlowPalette — search + drag (@dnd-kit) + tombol [+] per item (story 005-02)
// ---------------------------------------------------------------------------

interface FlowPaletteProps {
  items: FlowPaletteItem[];
  onAdd: (item: FlowPaletteItem) => void; // [+] keyboard → posisi tengah viewport (ditangani host)
  className?: string;
}

export function FlowPalette({ items, onAdd, className }: FlowPaletteProps) {
  const [query, setQuery] = React.useState('');

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section data-testid="flow-palette" className={cn('flex flex-col gap-2', className ?? 'w-64')}>
      <label htmlFor="flow-palette-search" className="sr-only">
        Cari jenis node
      </label>
      <input
        id="flow-palette-search"
        data-testid="flow-palette-search"
        type="search"
        className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Cari jenis node…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div aria-live="polite" data-testid="flow-palette-live" className="sr-only">
        {filtered.length} jenis
      </div>
      <div className="flex flex-col gap-1">
        {filtered.map((item) => (
          <FlowPaletteItemRow key={item.type} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

interface FlowPaletteItemRowProps {
  item: FlowPaletteItem;
  onAdd: (item: FlowPaletteItem) => void;
}

function FlowPaletteItemRow({ item, onAdd }: FlowPaletteItemRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { item },
    attributes: { role: 'button', tabIndex: 0 },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid={`flow-palette-item-${item.type}`}
      className={cn(
        'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm',
        isDragging ? 'border-primary bg-primary/10 opacity-80' : 'border-border bg-card hover:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <span className="flex shrink-0 items-center justify-center w-5 h-5 rounded bg-muted text-muted-foreground text-xs">
        {item.icon ? React.createElement(item.icon as React.ComponentType) : '•'}
      </span>
      <span className="truncate">{item.title}</span>
      <button
        type="button"
        data-testid={`flow-palette-add-${item.type}`}
        className="flex shrink-0 items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Tambah ${item.title}`}
        onClick={() => void onAdd(item)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void onAdd(item);
          }
        }}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowControls — kontrol zoom/fit/lock, label Indonesia (AC-01)
// ---------------------------------------------------------------------------

interface FlowControlsProps {
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitView: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
}

function FlowControls({
  zoomLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  fitView,
  isLocked,
  onToggleLock,
}: FlowControlsProps) {
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  return (
    <div data-testid="flow-controls" className="absolute right-3 top-3 z-20 flex flex-col items-end gap-1 rounded-md border border-border bg-card p-1 shadow-sm">
      <div className="flex gap-1">
        <button type="button" aria-label="Perkecil" onClick={zoomOut} className={buttonClass} data-testid="flow-zoom-out">
          <span className="text-[10px] font-bold">−</span>
        </button>
        <span
          aria-live="polite"
          data-testid="flow-zoom-level"
          className="min-w-[36px] h-7 flex items-center justify-center text-xs text-foreground"
        >
          {Math.round(zoomLevel * 100)}%
        </span>
        <button type="button" aria-label="Perbesar" onClick={zoomIn} className={buttonClass} data-testid="flow-zoom-in">
          <span className="text-[10px] font-bold">+</span>
        </button>
      </div>
      <div aria-hidden="true" className="h-5 w-px bg-border mx-1" />
      <div className="flex gap-1">
        <button type="button" aria-label="Atur 100%" onClick={resetZoom} title="Atur 100% (1:1)" className={buttonClass} data-testid="flow-reset-zoom">
          <span className="text-[10px] font-mono">1:1</span>
        </button>
        <button type="button" aria-label="Selaras tampilan" onClick={fitView} title="Selaras tampilan (fit view)" className={buttonClass} data-testid="flow-fit-view">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21-3.582-4-8-4S0 4.79 0 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" />
          </svg>
        </button>
      </div>
      <div aria-hidden="true" className="h-5 w-px bg-border mx-1" />
      <div className="flex gap-1">
        <button
          type="button"
          aria-pressed={isLocked}
          aria-label={isLocked ? 'Buka kunci interaksi' : 'Kunci interaksi'}
          onClick={onToggleLock}
          className={cn(buttonClass, isLocked ? 'text-destructive' : '')}
          title={isLocked ? 'Buka kunci interaksi' : 'Kunci interaksi'}
          data-testid="flow-lock-interaction"
        >
          {isLocked ? '🔓' : '🔒'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowToolbar — pola undo/redo + toggle snap/grid (story 005-05 AC-03/AC-05).
// Zoom tetap milik FlowControls (tidak ada di sini).
// ---------------------------------------------------------------------------

interface FlowToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  minimapOpen?: boolean;
  onToggleMinimap?: () => void;
}

function FlowToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  snapToGrid,
  onToggleSnap,
  showGrid,
  onToggleGrid,
  minimapOpen = true,
  onToggleMinimap,
}: FlowToolbarProps) {
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  return (
    <div
      data-testid="flow-toolbar"
      className="absolute left-3 top-3 z-20 flex flex-col items-start gap-1 rounded-md border border-border bg-card p-1 shadow-sm"
    >
      <button
        type="button"
        aria-label="Urungkan"
        disabled={!canUndo}
        onClick={onUndo}
        className={buttonClass}
        data-testid="flow-toolbar-undo"
      >
        Urungkan
      </button>
      <button
        type="button"
        aria-label="Ulangi"
        disabled={!canRedo}
        onClick={onRedo}
        className={buttonClass}
        data-testid="flow-toolbar-redo"
      >
        Ulangi
      </button>
      <div aria-hidden="true" className="h-5 w-px bg-border mx-1" />
      <button
        type="button"
        aria-pressed={snapToGrid}
        aria-label={snapToGrid ? 'Matikan snap ke grid' : 'Nyalakan snap ke grid'}
        onClick={onToggleSnap}
        className={cn(buttonClass, snapToGrid ? 'bg-primary text-primary-foreground' : '')}
        data-testid="flow-toolbar-snap"
      >
        Snap
      </button>
      <button
        type="button"
        aria-pressed={showGrid}
        aria-label={showGrid ? 'Sembunyikan grid' : 'Tampilkan grid'}
        onClick={onToggleGrid}
        className={cn(buttonClass, showGrid ? '' : 'opacity-50')}
        data-testid="flow-toolbar-grid"
      >
        Grid
      </button>
      <div aria-hidden="true" className="h-5 w-px bg-border mx-1" />
      <button
        type="button"
        aria-pressed={minimapOpen}
        aria-label={minimapOpen ? 'Sembunyikan minimap' : 'Tampilkan minimap'}
        onClick={onToggleMinimap}
        className={cn(buttonClass, minimapOpen ? '' : 'opacity-50')}
        data-testid="flow-toggle-minimap"
      >
        Minimap
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowCanvasHost — ReactFlow + DndContext + drop ke canvas (story 005-02)
// useReactFlow valid karena berada di dalam ReactFlowProvider.
// ---------------------------------------------------------------------------

interface FlowCanvasHostProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange?: OnNodesChange<FlowNode>;
  onEdgesChange?: OnEdgesChange<FlowEdge>;
  onConnect?: OnConnect;
  onSelectionChange?: (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  onViewportChange?: (viewport: { zoom: number }) => void;
  defaultNodes?: FlowNode[];
  defaultEdges?: FlowEdge[];
  isValidConnection?: (
    connection: {
      source: string;
      target: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    },
  ) => boolean;
  nodeTypes: unknown;
  onAddFromPalette: (item: FlowPaletteItem, position: { x: number; y: number }) => void;
  onNodeContextMenu?: (event: React.MouseEvent, node: FlowNode) => void;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: FlowEdge) => void;
  onPaneContextMenu?: (event: React.MouseEvent) => void;
  snapToGrid: boolean;
  gridSize: number;
  minimap: boolean;
  minimapExplicit?: boolean;
  onToggleMinimap?: () => void;
  showGrid: boolean;
  isInteractionLocked: boolean;
  onToggleLock: () => void;
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitView: () => void;
  ariaLabel: string;
  paletteItems: FlowPaletteItem[];
}

function CanvasDropZone() {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
    data: { kind: 'canvas' },
  });
  return <div ref={setNodeRef} data-testid="flow-canvas-drop-zone" className="absolute inset-0" />;
}

type FlowCanvasApi = {
  screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
  getViewport: () => { x: number; y: number; zoom: number };
};

// CanvasApi memanggil useReactFlow() di dalam ReactFlowProvider (induk ReactFlow)
// dan menyimpan API ke ref yang dimiliki FlowCanvasHost, sehingga event handler
// drag/keyboard (di luar provider) bisa membacanya setelah mount.
function CanvasApi({ apiRef }: { apiRef: React.MutableRefObject<FlowCanvasApi | null> }) {
  const api = useReactFlow();
  React.useEffect(() => {
    apiRef.current = {
      screenToFlowPosition: api.screenToFlowPosition,
      getViewport: api.getViewport,
    };
  }, [api, apiRef]);
  return null;
}

function FlowCanvasHost({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  onViewportChange,
  defaultNodes,
  defaultEdges,
  isValidConnection,
  nodeTypes,
  onAddFromPalette,
  snapToGrid,
  gridSize,
  minimap,
  minimapExplicit = false,
  showGrid,
  isInteractionLocked,
  onToggleLock,
  zoomLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  fitView,
  ariaLabel,
  paletteItems,
  onNodeContextMenu,
  onEdgeContextMenu,
  onPaneContextMenu,
}: FlowCanvasHostProps) {
  const apiRef = React.useRef<FlowCanvasApi | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const item = (active.data.current as { item?: FlowPaletteItem } | undefined)?.item;
      if (!item) return;
      // Di luar canvas → batal (fokus tetap di palette).
      if (!over || over.id !== 'canvas') return;

      const rect = active.rect.current.translated;
      const activator = event.activatorEvent as PointerEvent | null;
      const clientX = activator?.clientX ?? rect?.left ?? 0;
      const clientY = activator?.clientY ?? rect?.top ?? 0;

      const screenToFlowPosition = apiRef.current?.screenToFlowPosition;
      if (!screenToFlowPosition) return;
      let pos: XYPosition = screenToFlowPosition({ x: clientX, y: clientY });
      if (snapToGrid && gridSize > 0) {
        pos = {
          x: Math.round(pos.x / gridSize) * gridSize,
          y: Math.round(pos.y / gridSize) * gridSize,
        };
      }

      void onAddFromPalette(item, pos);
    },
    [snapToGrid, gridSize, onAddFromPalette],
  );

  const handleKeyboardAdd = React.useCallback(
    (item: FlowPaletteItem) => {
      const getViewport = apiRef.current?.getViewport;
      const screenToFlowPosition = apiRef.current?.screenToFlowPosition;
      if (!getViewport || !screenToFlowPosition) return;
      const viewport = getViewport();
      const pos = screenToFlowPosition({
        x: viewport.x + window.innerWidth / 2,
        y: viewport.y + window.innerHeight / 2,
      });
      void onAddFromPalette(item, pos);
    },
    [onAddFromPalette],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {paletteItems && paletteItems.length > 0 ? (
          <FlowPalette items={paletteItems} onAdd={handleKeyboardAdd} className="w-full md:w-64" />
        ) : null}

        <div
          id="flow-canvas"
          className="relative w-full h-[560px] min-h-[320px] overflow-hidden rounded-md border border-border bg-background"
          role="application"
        >
          <ReactFlowProvider>
            <ReactFlow
              aria-label={ariaLabel}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes as unknown as NodeTypes}
              defaultNodes={defaultNodes}
              defaultEdges={defaultEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              onViewportChange={onViewportChange}
              isValidConnection={isValidConnection}
              defaultEdgeOptions={{ type: 'default', animated: false }}
              minZoom={0.25}
              maxZoom={2}
              snapToGrid={snapToGrid}
              snapGrid={[gridSize, gridSize]}
              zoomOnScroll={false}
              zoomOnPinch
              panOnDrag
              nodesDraggable={!isInteractionLocked}
              nodesConnectable={!isInteractionLocked}
              elementsSelectable
              proOptions={{ hideAttribution: true }}
              fitView={false}
              fitViewOptions={{ padding: 0.2 }}
              onNodeClick={(_event, _node) => {
                // seleksi diatur melalui onSelectionChange xyflow; tidak ada state internal tambahan
              }}
              onNodeContextMenu={(event, node) => {
                event.preventDefault();
                void onNodeContextMenu?.(event as unknown as React.MouseEvent, node as FlowNode);
              }}
              onEdgeContextMenu={(event, edge) => {
                event.preventDefault();
                void onEdgeContextMenu?.(event as unknown as React.MouseEvent, edge as FlowEdge);
              }}
              onPaneContextMenu={(event) => {
                event.preventDefault();
                void onPaneContextMenu?.(event as unknown as React.MouseEvent);
              }}
            >
              {showGrid && (
                <Background variant={('dots' as unknown as BackgroundVariant)} gap={gridSize * 4} />
              )}
              {minimap ? (
                <div tabIndex={-1} data-testid="flow-minimap-wrap" aria-label="Minimap">
                  <MiniMap
                    data-testid="flow-minimap"
                    pannable
                    zoomable
                    className={
                      minimapExplicit
                        ? minimap
                          ? 'block !border-border !bg-card'
                          : 'hidden !border-border !bg-card'
                        : 'hidden md:block !border-border !bg-card'
                    }
                    maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
                    nodeColor="var(--primary)"
                  />
                </div>
              ) : null}
              <FlowControls
                zoomLevel={zoomLevel}
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                resetZoom={resetZoom}
                fitView={fitView}
                isLocked={isInteractionLocked}
                onToggleLock={onToggleLock}
              />
              <CanvasApi apiRef={apiRef} />
              <CanvasDropZone />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// FlowEditor
// ---------------------------------------------------------------------------

export function FlowEditor(props: FlowEditorProps) {
  const {
    nodes: nodesProp,
    edges: edgesProp,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    defaultNodes,
    defaultEdges,
    nodeTypes = defaultNodeTypes,
    paletteItems,
    onAddFromPalette,
    isValidConnection,
    minimap = true,
    snapToGrid = false,
    gridSize = 16,
    loading,
    error,
    onRetry,
    emptyActionLabel = 'Tambah node pertama',
    onEmptyAction,
    historyLimit = 50,
    ariaLabel = 'Editor alur',
    className,
    onDelete,
  } = props;

  const isControlled = nodesProp !== undefined && edgesProp !== undefined;
  const [internalNodes, setInternalNodes] = React.useState<FlowNode[]>(defaultNodes ?? []);
  const [internalEdges, setInternalEdges] = React.useState<FlowEdge[]>(defaultEdges ?? []);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [isInteractionLocked, setIsInteractionLocked] = React.useState(false);
  const [connecting, setConnecting] = React.useState<{ nodeId: string } | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = React.useState<string | null>(null);
  const [connectionAlert, setConnectionAlert] = React.useState<string | null>(null);
  const [selection, setSelection] = React.useState<FlowSelection>({ nodes: [], edges: [] });
  const [contextMenu, setContextMenu] = React.useState<{
    kind: 'node' | 'edge' | 'canvas';
    id: string | null;
    x: number;
    y: number;
  } | null>(null);
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Buka menu konteks saat contextMenu berubah. Dispatch contextmenu (right-click) agar
  // Radix ContextMenuTrigger membuka Content (Radix menanggapi contextmenu, bukan click).
  React.useEffect(() => {
    if (!contextMenu || !menuTriggerRef.current) return;
    const trigger = menuTriggerRef.current;
    trigger.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: contextMenu.x,
        clientY: contextMenu.y,
      }),
    );
  }, [contextMenu]);

  const nodes = isControlled ? nodesProp : internalNodes;
  const edges = isControlled ? edgesProp : internalEdges;
  const empty = nodes.length === 0 && edges.length === 0;

  // useFlowHistory — implementasi penuh (story 005-05).
  const _history = useFlowHistory({ historyLimit });

  // Flag mencegah riwayat mencatat hasil penerapan undo/redo (loop mitigasi).
  const historyApplying = React.useRef(false);
  const [historyAnnounce, setHistoryAnnounce] = React.useState('');
  const [isSnapToGrid, setIsSnapToGrid] = React.useState(snapToGrid ?? false);
  const [showGrid, setShowGrid] = React.useState(true);
  const [showNodeList, setShowNodeList] = React.useState(false);
  // Minimap: default true (FR-008, design D10). State internal mengikuti prop
  // `minimap` sebagai nilai awal; toggle pengguna tidak mengubah API publik.
  const [minimapOpen, setMinimapOpen] = React.useState(minimap ?? true);
  // `minimapExplicit` ditetapkan saat pengguna menekan toggle minimap: di bawah
  // md minimap disembunyikan default (`hidden md:block`) dan toggle paksa tampil
  // atau sembunuhi lewat kelas `block`/`hidden` (AC-01).
  const [minimapExplicit, setMinimapExplicit] = React.useState(false);

  React.useEffect(() => {
    setMinimapOpen(minimap ?? true);
    // Prop `minimap` (dikontrol halaman showcase) menjadi kebenaran utama:
    // reset pengecualian toggle agar perilaku responsif <md konsisten.
    setMinimapExplicit(false);
  }, [minimap]);

  const handleUndo = React.useCallback(() => {
    const snap = _history.undo({ nodes, edges });
    if (!snap) return;
    historyApplying.current = true;
    try {
      if (isControlled) {
        void onNodesChange?.(computeNodeChanges(nodes, snap.nodes));
        void onEdgesChange?.(computeEdgeChanges(edges, snap.edges));
      } else {
        setInternalNodes(snap.nodes);
        setInternalEdges(snap.edges);
      }
      setHistoryAnnounce('Perubahan dibatalkan');
      void toast({ title: 'Dibatalkan', description: 'Langkah sebelumnya dikembalikan.', duration: 3000 });
    } finally {
      historyApplying.current = false;
    }
  }, [_history, isControlled, nodes, edges, onNodesChange, onEdgesChange]);

  const handleRedo = React.useCallback(() => {
    const snap = _history.redo({ nodes, edges });
    if (!snap) return;
    historyApplying.current = true;
    try {
      if (isControlled) {
        void onNodesChange?.(computeNodeChanges(nodes, snap.nodes));
        void onEdgesChange?.(computeEdgeChanges(edges, snap.edges));
      } else {
        setInternalNodes(snap.nodes);
        setInternalEdges(snap.edges);
      }
      setHistoryAnnounce('Perubahan diulang');
      void toast({ title: 'Dilakukan Ulang', description: 'Langkah sebelumnya diterapkan kembali.', duration: 3000 });
    } finally {
      historyApplying.current = false;
    }
  }, [_history, isControlled, nodes, edges, onNodesChange, onEdgesChange]);

  const handleNodesChange = React.useCallback(
    (changes: NodeChangeset<FlowNode>) => {
      const structural = (changes as unknown as NodeChange<FlowNode>[]).some(
        (c) => c.type === 'position' || c.type === 'remove' || c.type === 'add',
      );
      if (structural && !historyApplying.current) {
        _history.push(nodes, edges);
      }
      if (isControlled) {
        void onNodesChange?.(changes);
        return;
      }
      setInternalNodes((prev) => {
        let next = prev;
        for (const change of (changes as unknown as NodeChange[])) {
          if (change.type === 'position') {
            next = next.map((n) =>
              n.id === change.id ? { ...n, position: { ...n.position, ...change.position } } : n,
            );
          } else if (change.type === 'select') {
            next = next.map((n) => (n.id === change.id ? { ...n, selected: change.selected } : n));
          } else if (change.type === 'remove') {
            next = next.filter((n) => n.id !== change.id);
          }
        }
        return next;
      });
    },
    [isControlled, onNodesChange, nodes, edges, _history],
  );

  const handleEdgesChange = React.useCallback(
    (changes: EdgeChangeset<FlowEdge>) => {
      const structural = (changes as unknown as Array<{ type: string }>).some(
        (c) => c.type === 'add' || c.type === 'remove',
      );
      if (structural && !historyApplying.current) {
        _history.push(nodes, edges);
      }
      if (isControlled) {
        void onEdgesChange?.(changes);
        return;
      }
      setInternalEdges((prev) =>
        prev.filter((e) => !((changes as unknown as { type: string; id: string }[]).some((c) => c.type === 'remove' && c.id === e.id))),
      );
    },
    [isControlled, onEdgesChange, nodes, edges, _history],
  );

// ---------------------------------------------------------------------------
// Validasi koneksi edge (design §3 langkah 2, story 005-03 AC-03 / AC-04)
// ---------------------------------------------------------------------------

type ConnectionRejectReason = 'self-loop' | 'duplikat' | 'handle-penuh' | 'custom';

const connectionRejectMessage: Record<ConnectionRejectReason, string> = {
  'self-loop': 'Sambungan ditolak: self-loop tidak diizinkan.',
  'duplikat': 'Sambungan ditolak: edge duplikat sudah ada.',
  'handle-penuh': 'Sambungan ditolak: handle tujuan sudah penuh.',
  custom: 'Sambungan ditolak: aturan kustom menolak koneksi.',
};

/**
 * Validasi koneksi default. Hasil akhir = default AND custom (AC-04): aturan
 * kustom konsumen hanya boleh MENGENCAT, tidak boleh melonggarkan aturan default
 * (self-loop, duplikat, handle penuh, arah).
 */
function validateConnection(
  connection: Connection,
  edges: FlowEdge[],
  isValidConnection: FlowEditorProps['isValidConnection'],
): { ok: true } | { ok: false; reason: ConnectionRejectReason } {
  const { source, target, sourceHandle, targetHandle } = connection;

  // Self-loop: node menyambung ke dirinya sendiri.
  if (source === target) {
    return { ok: false, reason: 'self-loop' };
  }

  // Arah: sumber (output handle) → tujuan (input handle). xyflow melalui UI
  // hanya menyambung source handle ke target handle; arah terbalik tidak dapat
  // diinisiasi lewat handle, dan self-loop sudah ditolak di atas.

  // Duplikat pasangan (source, sourceHandle, target, targetHandle) sudah ada.
  const duplicate = edges.some(
    (e) =>
      e.source === source &&
      e.target === target &&
      e.sourceHandle === sourceHandle &&
      e.targetHandle === targetHandle,
  );
  if (duplicate) {
    return { ok: false, reason: 'duplikat' };
  }

  // Handle tujuan penuh: satu target handle hanya boleh satu koneksi (maxConnections: 1).
  const targetFull = edges.some((e) => e.target === target && e.targetHandle === targetHandle);
  if (targetFull) {
    return { ok: false, reason: 'handle-penuh' };
  }

  // Aturan kustom konsumen hanya boleh menambahkan penolakan (AND).
  if (isValidConnection && !isValidConnection({ source, target, sourceHandle, targetHandle })) {
    return { ok: false, reason: 'custom' };
  }

  return { ok: true };
}

/**
 * Menghasilkan changeset node yang mengubah `current` menjadi `target` (full
 * replace per node, add untuk id baru, remove untuk id yang hilang). Digunakan
 * oleh undo/redo pada mode controlled agar state konsumen kembali persis.
 */
function computeNodeChanges(current: FlowNode[], target: FlowNode[]): NodeChangeset<FlowNode> {
  const currentById = new Map(current.map((n) => [n.id, n]));
  const targetById = new Map(target.map((n) => [n.id, n]));
  const changes: Array<NodeChange<FlowNode>> = [];

  for (const n of current) {
    if (!targetById.has(n.id)) changes.push({ id: n.id, type: 'remove' });
  }
  for (const n of target) {
    if (!currentById.has(n.id)) changes.push({ id: n.id, type: 'add', item: n } as NodeChange<FlowNode>);
    else changes.push({ id: n.id, type: 'replace', item: n } as NodeChange<FlowNode>);
  }
  return changes as unknown as NodeChangeset<FlowNode>;
}

/**
 * Menghasilkan changeset edge yang mengubah `current` menjadi `target`.
 */
function computeEdgeChanges(current: FlowEdge[], target: FlowEdge[]): EdgeChangeset<FlowEdge> {
  const currentById = new Map(current.map((e) => [e.id, e]));
  const targetById = new Map(target.map((e) => [e.id, e]));
  const changes: Array<EdgeChange<FlowEdge>> = [];

  for (const e of current) {
    if (!targetById.has(e.id)) changes.push({ id: e.id, type: 'remove' });
  }
  for (const e of target) {
    if (!currentById.has(e.id)) changes.push({ id: e.id, type: 'add', item: e } as EdgeChange<FlowEdge>);
    else changes.push({ id: e.id, type: 'replace', item: e } as EdgeChange<FlowEdge>);
  }
  return changes as unknown as EdgeChangeset<FlowEdge>;
}

const handleConnect = React.useCallback(
  (connection: Connection): boolean => {
    const { source, target } = connection;
    const validation = validateConnection(connection, edges, isValidConnection);
    if (!validation.ok) {
      const message = connectionRejectMessage[validation.reason];
      void toast({ title: 'Koneksi ditolak', description: message, duration: 4000 });
      setConnectionAlert(message);
      setConnectionSuccess(null);
      return false;
    }

    setConnectionAlert(null);
    setConnectionSuccess(`Edge ${source}→${target} tersambung`);

    if (isControlled) {
      void onConnect?.(connection);
      return true;
    }

    const newEdge: FlowEdge = {
      id: `edge-${crypto.randomUUID()}`,
      source,
      target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      animated: false,
    };
    setInternalEdges((prev) => [...prev, newEdge]);
    if (!historyApplying.current) _history.push(nodes, edges);
    return true;
  },
  // validateConnection dan connectionRejectMessage adalah konstanta modul-level (stabil), tidak perlu dalam daftar dependensi.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [isControlled, edges, onConnect, isValidConnection, nodes, _history],
);

// Clear alert penolakan setelah durasi agar role="alert" sementara (AC-03).
React.useEffect(() => {
  if (!connectionAlert) return;
  const timer = setTimeout(() => setConnectionAlert(null), 4000);
  return () => clearTimeout(timer);
}, [connectionAlert]);

  const handleSelectionChange = React.useCallback(
    (next: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
      setSelection(next);
      setSelectedEdgeId(next.edges[0]?.id ?? null);
      void onSelectionChange?.({ nodes: next.nodes, edges: next.edges });
    },
    [onSelectionChange],
  );

  const removeSelectedEdge = React.useCallback(() => {
    if (!selectedEdgeId) return;
    if (isControlled) {
      void onEdgesChange?.([{ id: selectedEdgeId, type: 'remove' }] as unknown as EdgeChangeset<FlowEdge>);
      if (!historyApplying.current) _history.push(nodes, edges);
    } else {
      setInternalEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
      if (!historyApplying.current) _history.push(nodes, edges);
    }
    setSelectedEdgeId(null);
  }, [selectedEdgeId, isControlled, onEdgesChange, nodes, edges, _history]);

  // Hapus atomik node terpilih + semua edge yang menyentuhnya dalam satu commit + toast (AC-04).
  // `sel` boleh di-override (mis. dari menu konteks) agar tidak bergantung closure `selection` yang stale.
  const handleDeleteSelected = React.useCallback((sel?: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const { nodes: selNodes, edges: selEdges } = sel ?? selection;
    if (selNodes.length === 0 && selEdges.length === 0) return;
    const nodeIds = new Set(selNodes.map((n) => n.id));
    const edgesToRemove = new Set<FlowEdge>();
    selEdges.forEach((e) => edgesToRemove.add(e));
    edges.forEach((e) => {
      if (nodeIds.has(e.source) || nodeIds.has(e.target)) edgesToRemove.add(e);
    });
    const edgeList = [...edgesToRemove];

    if (isControlled) {
      void onDelete?.({ nodes: selNodes, edges: edgeList });
    } else {
      setInternalNodes((prev) => prev.filter((n) => !nodeIds.has(n.id)));
      setInternalEdges((prev) => prev.filter((e) => !edgeList.includes(e)));
      _history.push(nodes, edges);
    }
    setSelection({ nodes: [], edges: [] });
    setSelectedEdgeId(null);
    void toast({ title: 'Dihapus', description: `${selNodes.length} node, ${edgeList.length} edge dihapus — Urungkan`, duration: 4000 });
  }, [selection, edges, isControlled, onDelete, nodes, _history]);

  // Fokus pada node/edge dari daftar SR (AC-03): seleksi elemen + fokus DOM bila tersedia.
  const focusNode = React.useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      const next: FlowSelection = { nodes: [node], edges: [] };
      setSelection(next);
      void onSelectionChange?.(next);
      if (typeof document !== 'undefined') {
        const el = document.querySelector<HTMLElement>(`[data-testid="flow-node-${id}"]`);
        el?.focus();
      }
      setHistoryAnnounce(`Fokus pada node ${node.data.label}`);
    },
    [nodes, onSelectionChange],
  );

  const focusEdge = React.useCallback(
    (id: string) => {
      const edge = edges.find((e) => e.id === id);
      if (!edge) return;
      const next: FlowSelection = { nodes: [], edges: [edge] };
      setSelection(next);
      void onSelectionChange?.(next);
      if (typeof document !== 'undefined') {
        const el = document.querySelector<HTMLElement>(`[data-testid="flow-edge-${id}"]`);
        el?.focus();
      }
      setHistoryAnnounce(`Fokus pada edge ${edge.source} → ${edge.target}`);
    },
    [edges, onSelectionChange],
  );

  const removeSingleNode = React.useCallback(
    (node: FlowNode) => {
      const related = edges.filter((e) => e.source === node.id || e.target === node.id);
      handleDeleteSelected({ nodes: [node], edges: related });
      setHistoryAnnounce(`Node ${node.data.label} dihapus`);
    },
    [edges, handleDeleteSelected],
  );

  const removeSingleEdge = React.useCallback(
    (edge: FlowEdge) => {
      handleDeleteSelected({ nodes: [], edges: [edge] });
      setHistoryAnnounce(`Edge ${edge.source} → ${edge.target} dihapus`);
    },
    [handleDeleteSelected],
  );

  const openContextMenu = React.useCallback(
    (kind: 'node' | 'edge' | 'canvas', id: string | null, x: number, y: number) => {
      setContextMenu({ kind, id, x, y });
    },
    [],
  );
  const closeContextMenu = React.useCallback(() => setContextMenu(null), []);

  const handleNodeContextMenu = React.useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      openContextMenu('node', node.id, event.clientX, event.clientY);
    },
    [openContextMenu],
  );
  const handleEdgeContextMenu = React.useCallback(
    (event: React.MouseEvent, edge: FlowEdge) => {
      openContextMenu('edge', edge.id, event.clientX, event.clientY);
    },
    [openContextMenu],
  );
  const handlePaneContextMenu = React.useCallback(
    (event: React.MouseEvent) => {
      const kind =
        selection.nodes.length === 1
          ? 'node'
          : selection.edges.length === 1
            ? 'edge'
            : 'canvas';
      const id =
        kind === 'node'
          ? selection.nodes[0].id
          : kind === 'edge'
            ? selectedEdgeId
            : null;
      openContextMenu(kind, id, event.clientX, event.clientY);
    },
    [selection, selectedEdgeId, openContextMenu],
  );

  const handleDeleteMenuNode = React.useCallback(() => {
    const { id: nodeId } = contextMenu ?? {};
    if (!nodeId) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    handleDeleteSelected({ nodes: [node], edges: [] });
    setSelection({ nodes: [], edges: [] });
  }, [contextMenu, nodes, handleDeleteSelected]);

  const handleDeleteMenuEdge = React.useCallback(() => {
    const { id: edgeId } = contextMenu ?? {};
    if (!edgeId) return;
    if (isControlled) {
      void onEdgesChange?.([{ id: edgeId, type: 'remove' }] as unknown as EdgeChangeset<FlowEdge>);
      _history.push(nodes, edges);
    } else {
      setInternalEdges((prev) => prev.filter((e) => e.id !== edgeId));
      _history.push(nodes, edges);
    }
    setSelectedEdgeId(null);
    closeContextMenu();
    void toast({ title: 'Dihapus', description: 'Edge dihapus — Urungkan', duration: 3000 });
  }, [contextMenu, isControlled, onEdgesChange, nodes, edges, _history, closeContextMenu]);

  const handleRefs = React.useRef<Map<string, { source: HTMLElement; target: HTMLElement }>>(new Map());
  const registerHandleRefs = React.useCallback(
    (nodeId: string, refs: { source: HTMLElement; target: HTMLElement }) => {
      handleRefs.current.set(nodeId, refs);
    },
    [],
  );

  const handleHandleKeyDown = React.useCallback(
    (nodeId: string, type: 'source' | 'target', key: string) => {
      if (key !== 'Enter' && key !== 'Escape') return;
      if (key === 'Escape') {
        setConnecting(null);
        return;
      }
      // key === 'Enter'
      if (type === 'source') {
        setConnecting({ nodeId });
        return;
      }
      // type === 'target': coba sambungkan dari handle sumber yang sedang connecting.
      if (connecting && connecting.nodeId !== nodeId) {
        const connection: Connection = {
          source: connecting.nodeId,
          target: nodeId,
          sourceHandle: 'source',
          targetHandle: 'target',
        };
        const connected = handleConnect(connection);
        setConnecting(null);
        if (!connected) {
          // Fokus kembali ke handle sumber saat penolakan (AC-02).
          handleRefs.current.get(connecting.nodeId)?.source.focus();
        }
      }
    },
    [connecting, handleConnect],
  );

  const handleEditorKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        if (event.shiftKey) {
          if (_history.canRedo) {
            event.preventDefault();
            handleRedo();
            return;
          }
        } else if (_history.canUndo) {
          event.preventDefault();
          handleUndo();
          return;
        }
      }
      // Ctrl+Y alias redo.
      if (event.key === 'y' && (event.ctrlKey || event.metaKey) && _history.canRedo) {
        event.preventDefault();
        handleRedo();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedEdgeId) {
          event.preventDefault();
          removeSelectedEdge();
          void toast({ title: 'Dihapus', description: 'Edge dihapus — Urungkan', duration: 3000 });
          return;
        }
        if (selection.nodes.length > 0) {
          event.preventDefault();
          handleDeleteSelected();
          return;
        }
      }
    },
    [selectedEdgeId, removeSelectedEdge, selection.nodes.length, handleDeleteSelected, _history, handleUndo, handleRedo],
  );

  const handleAddFromPalette = React.useCallback(
    (item: FlowPaletteItem, position: { x: number; y: number }) => {
      const node: FlowNode = {
        id: `node-${crypto.randomUUID()}`,
        type: item.type,
        position,
        data: { label: item.title, description: item.description, kind: item.type },
        selected: true,
      };
      if (onAddFromPalette) {
        void onAddFromPalette(item, position);
        return;
      }
      setInternalNodes((prev) => [...prev, node]);
      if (!historyApplying.current) _history.push(nodes, edges);
    },
    [_history, onAddFromPalette, nodes, edges],
  );

  const toggleSnap = React.useCallback(() => setIsSnapToGrid((prev) => !prev), []);
  const toggleGrid = React.useCallback(() => setShowGrid((prev) => !prev), []);
  const toggleMinimap = React.useCallback(() => {
    setMinimapExplicit(true);
    setMinimapOpen((prev) => !prev);
  }, []);

  const zoomIn = React.useCallback(() => setZoomLevel((z) => Math.min(z + 0.25, 2)), []);
  const zoomOut = React.useCallback(() => setZoomLevel((z) => Math.max(z - 0.25, 0.25)), []);
  const resetZoom = React.useCallback(() => setZoomLevel(1), []);

  React.useEffect(() => {
    if (!isControlled) return;
    setInternalNodes(nodesProp);
    setInternalEdges(edgesProp);
  }, [isControlled, nodesProp, edgesProp]);

  const zoomLabel = `${Math.round(zoomLevel * 100)}%`;

  return (
    <section
      data-testid="flow-editor"
      className={cn('relative w-full', className)}
      aria-label={ariaLabel}
      role="application"
      onKeyDown={handleEditorKeyDown}
    >
      {/* Skip-link ke kanvas untuk navigasi keyboard (AC-01). */}
      <SkipLink targetId="flow-canvas">Lewati ke kanvas</SkipLink>

      {/* Toolbar pola — undo/redo + snap/grid (story 005-05 AC-03/AC-05). */}
      <FlowToolbar
        canUndo={_history.canUndo}
        canRedo={_history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        snapToGrid={isSnapToGrid}
        onToggleSnap={toggleSnap}
        showGrid={showGrid}
        onToggleGrid={toggleGrid}
        minimapOpen={minimapOpen}
        onToggleMinimap={toggleMinimap}
      />

      {/* State matrix — loading */}
      {loading && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-md border border-border bg-background/80 backdrop-blur-sm"
          aria-busy="true"
        >
          <Skeleton className="w-48 h-12 mb-3" />
          <p className="sr-only">Memuat flow…</p>
        </div>
      )}

      {/* State matrix — empty */}
      {!loading && !error && empty && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6" role="status" aria-live="polite">
          <EmptyState
            title="Canvas kosong"
            description="Mulai dengan menambahkan node pertama."
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        </div>
      )}

      {/* State matrix — error */}
      {!loading && error && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6"
          role="alert"
          aria-live="assertive"
        >
          <EmptyState
            variant="error"
            title="Gagal memuat flow"
            description={error}
            actionLabel="Coba lagi"
            onAction={onRetry}
          />
        </div>
      )}

      {!loading && (
        <FlowConnectContext.Provider value={{ connecting, setConnecting, registerHandleRefs, onHandleKeyDown: handleHandleKeyDown }}>
          <FlowCanvasHost
            nodes={nodes}
            edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={handleSelectionChange}
          onViewportChange={({ zoom }: { zoom: number }) => setZoomLevel(zoom)}
          defaultNodes={defaultNodes}
          defaultEdges={defaultEdges}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          onAddFromPalette={handleAddFromPalette}
          snapToGrid={isSnapToGrid}
          gridSize={gridSize}
          minimap={minimapOpen}
          minimapExplicit={minimapExplicit}
          showGrid={showGrid}
          isInteractionLocked={isInteractionLocked}
          onToggleLock={() => setIsInteractionLocked((prev) => !prev)}
          zoomLevel={zoomLevel}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          fitView={() => {}}
          ariaLabel={ariaLabel}
          paletteItems={paletteItems ?? []}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeContextMenu={handleEdgeContextMenu}
          onPaneContextMenu={handlePaneContextMenu}
          onToggleMinimap={toggleMinimap}
          />
        </FlowConnectContext.Provider>
      )}

      {/* Live region zoom level */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {zoomLabel}
      </div>

      {/* Live region undo/redo (AC-03). */}
      {historyAnnounce && (
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {historyAnnounce}
        </div>
      )}

      {/* Live region sukses sambung edge (AC-01) */}
      {connectionSuccess && (
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {connectionSuccess}
        </div>
      )}

      {/* Alert penolakan koneksi sementara (AC-03) */}
      {connectionAlert && (
        <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
          {connectionAlert}
        </div>
      )}

      {/* Daftar alternatif screen reader (node + edge) — toggle terlihat + tombol per baris (AC-03). */}
      <div className="space-y-2">
        <button
          type="button"
          aria-expanded={showNodeList}
          aria-controls="flow-node-edge-list"
          onClick={() => setShowNodeList((prev) => !prev)}
          data-testid="flow-sr-toggle"
          className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {showNodeList ? 'Sembunyikan daftar node & edge' : 'Tampilkan daftar node & edge'}
        </button>
        <div
          id="flow-node-edge-list"
          role="region"
          aria-label="Daftar node dan edge"
          className={cn(
            'rounded-md border border-border bg-card p-3 text-sm text-foreground',
            showNodeList ? '' : 'sr-only',
          )}
        >
          <ul className="flex flex-col gap-1">
            {nodes.map((node) => {
              const connectionCount = edges.filter(
                (e) => e.source === node.id || e.target === node.id,
              ).length;
              return (
                <li
                  key={node.id}
                  data-testid={`flow-sr-node-${node.id}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span>
                    {node.data.label}, {connectionCount} koneksi
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => focusNode(node.id)}
                      data-testid={`flow-sr-focus-node-${node.id}`}
                      className="rounded-sm border border-border px-2 py-0.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Fokus
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSingleNode(node)}
                      data-testid={`flow-sr-hapus-node-${node.id}`}
                      className="rounded-sm border border-destructive/40 px-2 py-0.5 text-xs text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Hapus
                    </button>
                  </span>
                </li>
              );
            })}
            {edges.map((edge) => (
              <li
                key={edge.id}
                data-testid={`flow-sr-edge-${edge.id}`}
                className="flex items-center justify-between gap-2"
              >
                <span>
                  {edge.source} → {edge.target}, label: {edge.label ?? '—'}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => focusEdge(edge.id)}
                    data-testid={`flow-sr-focus-edge-${edge.id}`}
                    className="rounded-sm border border-border px-2 py-0.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Fokus
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSingleEdge(edge)}
                    data-testid={`flow-sr-hapus-edge-${edge.id}`}
                    className="rounded-sm border border-destructive/40 px-2 py-0.5 text-xs text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Live region hitungan seleksi (AC-02) */}
      {(selection.nodes.length > 0 || selection.edges.length > 0) && (
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {selection.nodes.length} node, {selection.edges.length} edge terpilih
        </div>
      )}

      {/* Menu konteks node/edge/canvas (story 005-04) */}
      {contextMenu && (
        <div style={{ position: 'absolute', left: contextMenu.x, top: contextMenu.y, zIndex: 60 }}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button
                ref={menuTriggerRef}
                data-testid="flow-context-trigger"
                type="button"
                style={{
                  position: 'absolute',
                  opacity: 0,
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  margin: 0,
                  width: 0,
                  height: 0,
                }}
              />
            </ContextMenuTrigger>
            <ContextMenuContent data-testid="flow-context-menu">
              {contextMenu.kind === 'node' ? (
                <>
                  <ContextMenuItem onClick={closeContextMenu} data-testid="flow-menu-node-rincian">
                    Rincian
                  </ContextMenuItem>
                  <ContextMenuItem onClick={closeContextMenu} data-testid="flow-menu-node-duplik">
                    Duplikat
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={handleDeleteMenuNode}
                    variant="destructive"
                    data-testid="flow-menu-node-hapus"
                  >
                    Hapus
                  </ContextMenuItem>
                </>
              ) : contextMenu.kind === 'edge' ? (
                <>
                  <ContextMenuItem onClick={closeContextMenu} data-testid="flow-menu-edge-edit">
                    Edit label
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={handleDeleteMenuEdge}
                    variant="destructive"
                    data-testid="flow-menu-edge-hapus"
                  >
                    Hapus edge
                  </ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem onClick={closeContextMenu} data-testid="flow-menu-canvas-tambah">
                    Tambah di sini
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={closeContextMenu}
                    data-testid="flow-menu-canvas-selaraskan"
                  >
                    Selaras tampilan
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={closeContextMenu}
                    data-testid="flow-menu-canvas-grid"
                  >
                    Alih grid
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      )}
    </section>
  );
}
