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
import { Badge } from '../base/badge';
import { EmptyState } from '../feedback/empty-state';
import { Skeleton } from '../base/skeleton';
import { toast } from '../feedback/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../base/tooltip';

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
// useFlowHistory — kontrak untuk story 005-02–04 (implementasi penuh di 005-05)
// ---------------------------------------------------------------------------

export interface UseFlowHistory {
  push: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLimit: number;
}

/**
 * Stub/kontrak useFlowHistory. Story 005-02–04 boleh mock kontrak ini;
 * implementasi penuh (snapshot klon struktural, batas historyLimit, undo/redo
 * tanpa push-balik) dikerjakan di story 005-05.
 */
export function useFlowHistory({ historyLimit = 50 }: { historyLimit?: number } = {}): UseFlowHistory {
  return {
    push: React.useCallback((_nodes: FlowNode[], _edges: FlowEdge[]) => {
      // no-op stub — diimplementasi penuh di 005-05
    }, []),
    undo: React.useCallback(() => {
      // no-op stub
    }, []),
    redo: React.useCallback(() => {
      // no-op stub
    }, []),
    canUndo: false,
    canRedo: false,
    historyLimit,
  };
}

// ---------------------------------------------------------------------------
// Handle kustom — hit-area ≥44px (visual 12px + padding transparan) + a11y
// ---------------------------------------------------------------------------

interface FlowHandleProps {
  type: 'source' | 'target';
  position: 'left' | 'right';
  isConnectable?: boolean;
  dataTestId?: string;
}

function FlowHandle({ type, position, isConnectable = true, dataTestId }: FlowHandleProps) {
  const sideClass = position === 'left' ? '-left-2.5' : '-right-2.5';
  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 flex items-center justify-center',
        sideClass,
        'w-12 h-12 rounded-full bg-border shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer',
        isConnectable === false ? 'opacity-50 cursor-not-allowed' : '',
      )}
    >
      <Handle type={type} position={position as Position} className="h-3 w-3 rounded-full" />
    </div>
  );
}

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
  const isDisabled = data.disabled === true;
  const statusBadge = {
    default: 'bg-muted text-muted-foreground',
    running: 'bg-primary text-primary-foreground animate-pulse',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-destructive text-destructive-foreground',
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
            className={cn('text-micro text-muted-foreground', statusBadge)}
            data-testid={`flow-node-status-${id}`}
          >
            {status}
          </span>
          {isDisabled ? <span className="text-micro text-muted-foreground">disabled</span> : null}
        </div>
      </div>
      {/* Handle kiri = input (target), kanan = output (source). Hit-area ≥44px via wrapper 48×48. */}
      <FlowHandle type="target" position="left" dataTestId={`flow-handle-${id}-target`} />
      <FlowHandle type="source" position="right" dataTestId={`flow-handle-${id}-source`} />
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
}

export function FlowPalette({ items, onAdd }: FlowPaletteProps) {
  const [query, setQuery] = React.useState('');

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section data-testid="flow-palette" className="flex w-64 flex-col gap-2">
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
  snapToGrid: boolean;
  gridSize: number;
  minimap: boolean;
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
  isInteractionLocked,
  onToggleLock,
  zoomLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  fitView,
  ariaLabel,
  paletteItems,
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
      <div className="flex gap-4">
        {paletteItems && paletteItems.length > 0 ? (
          <FlowPalette items={paletteItems} onAdd={handleKeyboardAdd} />
        ) : null}

        <div
          className="relative w-full h-[560px] overflow-hidden rounded-md border border-border bg-background"
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
            >
              <Background variant={('dots' as unknown as BackgroundVariant)} gap={gridSize * 4} />
              {minimap ? (
                <MiniMap
                  data-testid="flow-minimap"
                  pannable
                  zoomable
                  aria-label="Minimap"
                  className="hidden md:block !border-border !bg-card"
                  maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
                  nodeColor="var(--primary)"
                />
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
  } = props;

  const isControlled = nodesProp !== undefined && edgesProp !== undefined;
  const [internalNodes, setInternalNodes] = React.useState<FlowNode[]>(defaultNodes ?? []);
  const [internalEdges, setInternalEdges] = React.useState<FlowEdge[]>(defaultEdges ?? []);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [isInteractionLocked, setIsInteractionLocked] = React.useState(false);

  const nodes = isControlled ? nodesProp : internalNodes;
  const edges = isControlled ? edgesProp : internalEdges;
  const empty = nodes.length === 0 && edges.length === 0;

  // useFlowHistory dikaitkan untuk menarik batas history (kontrak untuk 005-02–04; full di 005-05).
  const _history = useFlowHistory({ historyLimit });
  void _history;

  const handleNodesChange = React.useCallback(
    (changes: NodeChangeset<FlowNode>) => {
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
    [isControlled, onNodesChange],
  );

  const handleEdgesChange = React.useCallback(
    (changes: EdgeChangeset<FlowEdge>) => {
      if (isControlled) {
        void onEdgesChange?.(changes);
        return;
      }
      setInternalEdges((prev) =>
        prev.filter((e) => !((changes as unknown as { type: string; id: string }[]).some((c) => c.type === 'remove' && c.id === e.id))),
      );
    },
    [isControlled, onEdgesChange],
  );

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (source === target) {
        void toast({ title: 'Koneksi ditolak', description: 'Self-loop tidak diizinkan.', duration: 3000 });
        return;
      }
      const duplicate = edges.some(
        (e) =>
          e.source === source &&
          e.target === target &&
          e.sourceHandle === sourceHandle &&
          e.targetHandle === targetHandle,
      );
      if (duplicate) {
        void toast({ title: 'Koneksi ditolak', description: 'Edge duplikat sudah ada.', duration: 3000 });
        return;
      }
      if (isValidConnection && !isValidConnection({ source, target, sourceHandle, targetHandle })) {
        return;
      }
      if (isControlled) {
        void onConnect?.(connection);
        return;
      }
      const newEdge: FlowEdge = {
        id: `edge-${crypto.randomUUID()}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        animated: false,
      };
      setInternalEdges((prev) => [...prev, newEdge]);
    },
    [isControlled, edges, onConnect, isValidConnection],
  );

  const handleSelectionChange = React.useCallback(
    (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
      void onSelectionChange?.({ nodes: selection.nodes, edges: selection.edges });
    },
    [onSelectionChange],
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
      _history.push(nodes, edges);
    },
    [_history, onAddFromPalette, nodes, edges],
  );

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
    >
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
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          minimap={minimap}
          isInteractionLocked={isInteractionLocked}
          onToggleLock={() => setIsInteractionLocked((prev) => !prev)}
          zoomLevel={zoomLevel}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          fitView={() => {}}
          ariaLabel={ariaLabel}
          paletteItems={paletteItems ?? []}
        />
      )}

      {/* Live region zoom level */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {zoomLabel}
      </div>

      {/* Daftar alternatif screen reader (node + edge) */}
      <div className="sr-only" aria-label="Daftar node dan edge">
        <ul>
          {nodes.map((node) => (
            <li key={node.id} data-testid={`flow-sr-node-${node.id}`}>
              {node.data.label}
            </li>
          ))}
          {edges.map((edge) => (
            <li key={edge.id} data-testid={`flow-sr-edge-${edge.id}`}>
              Edge dari {edge.source} ke {edge.target}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
