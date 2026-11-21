'use client';

// MindMap — fondasi kanvas dua sisi 012-01 (PRD 012, wireframe S-005.35).
// Turunan ringan OrgChartStudio di atas `@xyflow/react` reuse: layout dua sisi
// seimbang K1 (root sentral, anak root dibagi kanan-kiri proporsional lebar
// subtree — greedy deterministik, tie → kanan), node pill kompak (root 200×64,
// cabang 160×48 — K4), konektor bezier 1px token `border`, expand/collapse
// manual dengan badge "+N". Tanpa tambah/edit/hapus, pencarian, undo, dan
// halaman showcase — scope 012-02/012-03 (design K2/K3).
// Catatan reuse (story task 1): `getAncestors` studio berkontrak field `title`,
// mind map memakai `label` (wireframe §2) — tidak direuse; util ancestor path
// (dipakai auto-expand pencarian) ditunda ke 012-03.
// Edge memakai inline style 1px `var(--border)` + type `default` (bezier)
// sehingga CSS edge global (smoothstep 1.5px studio) tidak perlu diubah.
// Semantik expanded mengikuti OrgChartStudio: `defaultExpandedIds` = id yang
// awalnya COLLAPSED; default (kosong) = semua induk ter-expand.

import * as React from 'react';
import { ChevronDown, ChevronRight, Maximize, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Badge } from '../base/badge';
import { Button } from '../base/button';
import { EmptyState } from '../feedback/empty-state';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../base/tooltip';

// ---------------------------------------------------------------------------
// Tipe publik (FR-001) — pola OrgChartStudio dengan field `label`
// ---------------------------------------------------------------------------

export type MindAccent = 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface MindNodeFlat {
  id: string;
  parentId: string | null; // null = root (tepat satu)
  label: string; // teks ide — wajib non-kosong
  accent?: MindAccent; // dot aksen 8px level-1 saja (wireframe §2)
  disabled?: boolean;
}

export interface MindNodeNested extends Omit<MindNodeFlat, 'parentId'> {
  children?: MindNodeNested[];
}

export type MindInput = MindNodeFlat[] | MindNodeNested;

export interface MindNodeNormalized extends MindNodeFlat {
  depth: number;
  childIds: string[];
  hasChildren: boolean;
  descendantCount: number; // untuk badge "+N" saat collapsed (FR-003)
}

export interface MindMapError {
  code: 'duplicate-id' | 'missing-parent' | 'cycle' | 'root-count';
  message: string;
  nodeId: string | null;
}

export interface MindNormalizedResult {
  nodes: MindNodeNormalized[];
  byId: Map<string, MindNodeNormalized>;
  rootId: string | null;
  error: MindMapError | null;
  isEmpty: boolean;
}

// ---------------------------------------------------------------------------
// Normalisasi + validasi terstruktur (pola 003/011, bukan throw — AC-01)
// ---------------------------------------------------------------------------

function flattenNested(root: MindNodeNested): MindNodeFlat[] {
  const flat: MindNodeFlat[] = [];
  const walk = (node: MindNodeNested, parentId: string | null): void => {
    const { children, ...rest } = node;
    flat.push({ ...rest, parentId });
    for (const child of children ?? []) {
      walk(child, node.id);
    }
  };
  walk(root, null);
  return flat;
}

function toMindFlatInput(data: MindInput): MindNodeFlat[] {
  return Array.isArray(data) ? [...data] : flattenNested(data);
}

export function normalizeMindInput(data: MindInput): MindNormalizedResult {
  const flat: MindNodeFlat[] = toMindFlatInput(data);

  if (flat.length === 0) {
    return { nodes: [], byId: new Map(), rootId: null, error: null, isEmpty: true };
  }

  const byIdFlat = new Map<string, MindNodeFlat>();
  for (const node of flat) {
    if (byIdFlat.has(node.id)) {
      return {
        nodes: [],
        byId: new Map(),
        rootId: null,
        error: {
          code: 'duplicate-id',
          message: `ID duplikat: "${node.id}" muncul lebih dari sekali.`,
          nodeId: node.id,
        },
        isEmpty: false,
      };
    }
    byIdFlat.set(node.id, node);
  }

  const roots = flat.filter((node) => node.parentId === null);
  if (roots.length !== 1) {
    const extra = roots[1] ?? null;
    return {
      nodes: [],
      byId: new Map(),
      rootId: null,
      error: {
        code: 'root-count',
        message: `Harus tepat satu root, ditemukan ${roots.length}.`,
        nodeId: extra ? extra.id : null,
      },
      isEmpty: false,
    };
  }
  const rootId = roots[0].id;

  for (const node of flat) {
    if (node.parentId !== null && !byIdFlat.has(node.parentId)) {
      return {
        nodes: [],
        byId: new Map(),
        rootId: null,
        error: {
          code: 'missing-parent',
          message: `Parent "${node.parentId}" dari node "${node.id}" tidak ditemukan.`,
          nodeId: node.id,
        },
        isEmpty: false,
      };
    }
  }

  const childIdsByParent = new Map<string, string[]>();
  for (const node of flat) {
    if (node.parentId !== null) {
      const list = childIdsByParent.get(node.parentId) ?? [];
      list.push(node.id);
      childIdsByParent.set(node.parentId, list);
    }
  }

  const depthById = new Map<string, number>();
  const visited = new Set<string>();
  const onStack = new Set<string>();
  let cycleId: string | null = null;

  const visit = (id: string, depth: number): void => {
    if (cycleId !== null) return;
    if (onStack.has(id)) {
      cycleId = id;
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    onStack.add(id);
    depthById.set(id, depth);
    for (const childId of childIdsByParent.get(id) ?? []) {
      visit(childId, depth + 1);
      if (cycleId !== null) return;
    }
    onStack.delete(id);
  };
  visit(rootId, 0);

  if (cycleId === null) {
    const unreachable = flat.find((node) => !visited.has(node.id));
    if (unreachable) cycleId = unreachable.id;
  }
  if (cycleId !== null) {
    return {
      nodes: [],
      byId: new Map(),
      rootId: null,
      error: {
        code: 'cycle',
        message: `Siklus terdeteksi pada node "${cycleId}".`,
        nodeId: cycleId,
      },
      isEmpty: false,
    };
  }

  const descendantCount = new Map<string, number>();
  const countDescendants = (id: string): number => {
    const cached = descendantCount.get(id);
    if (cached !== undefined) return cached;
    let total = 0;
    for (const childId of childIdsByParent.get(id) ?? []) {
      total += 1 + countDescendants(childId);
    }
    descendantCount.set(id, total);
    return total;
  };
  countDescendants(rootId);

  // Kanonisasi urutan: DFS dari root (urutan anak = urutan masuk) agar input
  // flat dan nested yang setara menghasilkan normalized.nodes — dan render —
  // yang identik (AC-01), terlepas dari urutan penulisan input.
  const rawById = new Map<string, MindNodeFlat>();
  for (const node of flat) rawById.set(node.id, node);
  const nodes: MindNodeNormalized[] = [];
  const walkOrder = (id: string): void => {
    const node = rawById.get(id);
    if (!node) return;
    const childIds = childIdsByParent.get(id) ?? [];
    nodes.push({
      ...node,
      depth: depthById.get(id) ?? 0,
      childIds,
      hasChildren: childIds.length > 0,
      descendantCount: descendantCount.get(id) ?? 0,
    });
    for (const childId of childIds) walkOrder(childId);
  };
  walkOrder(rootId);

  return {
    nodes,
    byId: new Map(nodes.map((node) => [node.id, node])),
    rootId,
    error: null,
    isEmpty: false,
  };
}

// ---------------------------------------------------------------------------
// Layout dua sisi seimbang K1 (deterministik, AC-02)
// ---------------------------------------------------------------------------

// Slot pill design §2 (K4): root 200×64, cabang 160×48, gap horizontal 32,
// gap vertikal 24 (stride cabang 72).
export const MIND_NODE_WIDTH_ROOT = 200;
export const MIND_NODE_HEIGHT_ROOT = 64;
export const MIND_NODE_WIDTH_BRANCH = 160;
export const MIND_NODE_HEIGHT_BRANCH = 48;
const MIND_GAP_X = 32;
const MIND_GAP_Y = 24;
const MIND_BRANCH_STRIDE = MIND_NODE_HEIGHT_BRANCH + MIND_GAP_Y;

export interface MindPosition {
  id: string;
  x: number;
  y: number;
  side: 'left' | 'right';
}

export function computeMindMapPositions(
  normalized: MindNormalizedResult,
  visibleIds: Set<string>,
): MindPosition[] {
  const positions: MindPosition[] = [];
  if (normalized.rootId === null || normalized.error !== null) return positions;
  const byId = normalized.byId;

  // Lebar subtree = jumlah daun terlihat (unit slot vertikal).
  const leafWidths = new Map<string, number>();
  const computeWidth = (id: string): number => {
    const cached = leafWidths.get(id);
    if (cached !== undefined) return cached;
    const node = byId.get(id);
    const visibleChildren = (node?.childIds ?? []).filter((childId) => visibleIds.has(childId));
    const width =
      visibleChildren.length === 0
        ? 1
        : Math.max(1, visibleChildren.reduce((sum, childId) => sum + computeWidth(childId), 0));
    leafWidths.set(id, width);
    return width;
  };

  const root = byId.get(normalized.rootId);
  if (!root) return positions;
  const rootChildIds = root.childIds.filter((childId) => visibleIds.has(childId));

  // Split-rule K1: greedy dalam urutan input — anak masuk ke sisi dengan
  // akumulasi lebar subtree lebih kecil; tie → kanan. Deterministik dan
  // proporsional lebar subtree (design K1, decided OQ#2).
  const rightIds: string[] = [];
  const leftIds: string[] = [];
  let rightWidth = 0;
  let leftWidth = 0;
  for (const childId of rootChildIds) {
    const width = computeWidth(childId);
    if (leftWidth < rightWidth) {
      leftIds.push(childId);
      leftWidth += width;
    } else {
      rightIds.push(childId);
      rightWidth += width;
    }
  }

  const columnX = (depth: number, side: 'left' | 'right'): number => {
    const offset =
      MIND_NODE_WIDTH_ROOT / 2 + MIND_GAP_X + (depth - 1) * (MIND_NODE_WIDTH_BRANCH + MIND_GAP_X);
    return side === 'right' ? offset : -(offset + MIND_NODE_WIDTH_BRANCH);
  };

  // y per sisi: in-order daun diberi slot berurutan; induk dipusatkan pada
  // rentang anak. Setelah selesai, satu sisi digeser agar pusat rentangnya
  // berimpit pusat vertikal root (y=0) — root sentral.
  const placeSide = (topIds: string[], side: 'left' | 'right'): void => {
    const yById = new Map<string, number>();
    let cursor = 0;
    const place = (id: string): number => {
      const node = byId.get(id);
      const visibleChildren = (node?.childIds ?? []).filter((childId) => visibleIds.has(childId));
      if (visibleChildren.length === 0) {
        const y = cursor;
        cursor += MIND_BRANCH_STRIDE;
        yById.set(id, y);
        return y + MIND_NODE_HEIGHT_BRANCH / 2;
      }
      const childCenters = visibleChildren.map((childId) => place(childId));
      const center = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
      yById.set(id, center - MIND_NODE_HEIGHT_BRANCH / 2);
      return center;
    };
    for (const id of topIds) place(id);

    const topCenters = topIds.map((id) => (yById.get(id) ?? 0) + MIND_NODE_HEIGHT_BRANCH / 2);
    const spanCenter = (Math.min(...topCenters) + Math.max(...topCenters)) / 2;
    const shift = -spanCenter;

    for (const [id, y] of yById) {
      const depth = byId.get(id)?.depth ?? 1;
      positions.push({ id, x: columnX(depth, side), y: y + shift, side });
    }
  };
  placeSide(rightIds, 'right');
  placeSide(leftIds, 'left');

  positions.push({
    id: root.id,
    x: -(MIND_NODE_WIDTH_ROOT / 2),
    y: -(MIND_NODE_HEIGHT_ROOT / 2),
    side: 'right', // root netral dua sisi; handle source kiri+kanan (lihat MindNode)
  });
  return positions;
}

// ---------------------------------------------------------------------------
// Pemetaan ke xyflow — node pill + edge bezier 1px token border (K4, FR-003)
// ---------------------------------------------------------------------------

export type MindNodeData = {
  node: MindNodeNormalized;
  side: 'left' | 'right';
  isExpanded: boolean;
  onToggle: (id: string) => void;
};

export type MindFlowNode = Node<MindNodeData, 'mindNode'>;
export type MindFlowEdge = Edge;

export function toMindFlowNodes(
  normalized: MindNormalizedResult,
  positions: MindPosition[],
  expandedSet: Set<string>,
  onToggle: (id: string) => void,
): MindFlowNode[] {
  const positionById = new Map(positions.map((position) => [position.id, position]));
  return normalized.nodes
    .filter((node) => positionById.has(node.id))
    .map((node) => {
      const position = positionById.get(node.id) ?? { id: node.id, x: 0, y: 0, side: 'right' as const };
      const isRoot = node.depth === 0;
      return {
        id: node.id,
        type: 'mindNode' as const,
        position: { x: position.x, y: position.y },
        width: isRoot ? MIND_NODE_WIDTH_ROOT : MIND_NODE_WIDTH_BRANCH,
        height: isRoot ? MIND_NODE_HEIGHT_ROOT : MIND_NODE_HEIGHT_BRANCH,
        data: {
          node,
          side: position.side,
          isExpanded: expandedSet.has(node.id),
          onToggle,
        },
      };
    });
}

export function toMindFlowEdges(
  normalized: MindNormalizedResult,
  positions: MindPosition[],
  visibleIds: Set<string>,
): MindFlowEdge[] {
  const sideById = new Map(positions.map((position) => [position.id, position.side]));
  const edges: MindFlowEdge[] = [];
  for (const node of normalized.nodes) {
    if (!visibleIds.has(node.id)) continue;
    for (const childId of node.childIds) {
      if (!visibleIds.has(childId)) continue;
      const childSide = sideById.get(childId) ?? 'right';
      edges.push({
        id: `${node.id}>${childId}`,
        source: node.id,
        target: childId,
        // Root memancar dua sisi; cabang keluar dari sisi luar pill.
        sourceHandle: node.depth === 0 ? (childSide === 'right' ? 'out-r' : 'out-l') : 'out',
        targetHandle: 'in',
        type: 'default', // bezier — konektor halus radial (wireframe §2, K4)
        style: { strokeWidth: 1, stroke: 'var(--border)' },
      });
    }
  }
  return edges;
}

// ---------------------------------------------------------------------------
// Node pill (anatomy wireframe §2): dot aksen level-1, expander, badge "+N",
// tooltip label penuh, handle xyflow tak-terlihat (pola CR-014)
// ---------------------------------------------------------------------------

const ACCENT_DOT_CLASS: Record<MindAccent, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

const mindPillVariants = cva(
  'relative flex items-center gap-1 rounded-full border bg-card text-card-foreground shadow-sm motion-safe:transition-colors hover:border-primary/60',
  {
    variants: {
      level: {
        root: 'h-16 w-[200px] border-2 border-primary/40 px-3',
        branch: 'h-12 w-[160px] border-border px-2.5',
      },
    },
    defaultVariants: {
      level: 'branch' as const,
    },
  },
);

const MIND_HIDDEN_HANDLE_CLASS = '!border-border !bg-background opacity-0';

function MindNode({ data }: { data: MindNodeData }) {
  const { node, side, isExpanded, onToggle } = data;
  const isRoot = node.depth === 0;
  const hiddenCount = isExpanded ? 0 : node.descendantCount;
  return (
    <div
      data-testid="mind-map-node"
      data-node-id={node.id}
      data-level={isRoot ? 'root' : 'branch'}
      data-side={side}
      aria-disabled={node.disabled || undefined}
      title={node.label}
      tabIndex={node.disabled ? -1 : 0}
      className={cn(
        mindPillVariants({ level: isRoot ? 'root' : 'branch' }),
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        node.disabled && 'pointer-events-none opacity-60',
      )}
    >
      {/* Jangkar garis xyflow — Handle tak-terlihat yang ditempeli edge
          (pola CR-014: tanpa ini edge gagal terbentuk). Root memancar dua
          sisi; cabang target menghadap root, source ke sisi luar. */}
      {isRoot ? (
        <>
          <Handle
            type="source"
            position={Position.Left}
            id="out-l"
            isConnectable={false}
            aria-hidden="true"
            className={MIND_HIDDEN_HANDLE_CLASS}
            style={{ pointerEvents: 'none' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="out-r"
            isConnectable={false}
            aria-hidden="true"
            className={MIND_HIDDEN_HANDLE_CLASS}
            style={{ pointerEvents: 'none' }}
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={side === 'right' ? Position.Left : Position.Right}
            id="in"
            isConnectable={false}
            aria-hidden="true"
            className={MIND_HIDDEN_HANDLE_CLASS}
            style={{ pointerEvents: 'none' }}
          />
          <Handle
            type="source"
            position={side === 'right' ? Position.Right : Position.Left}
            id="out"
            isConnectable={false}
            aria-hidden="true"
            className={MIND_HIDDEN_HANDLE_CLASS}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}
      {/* Dot aksen 8px level-1 saja (wireframe §2). */}
      {node.depth === 1 && node.accent ? (
        <span
          aria-hidden="true"
          data-testid={`mind-map-accent-${node.id}`}
          className={cn('h-2 w-2 shrink-0 rounded-full', ACCENT_DOT_CLASS[node.accent])}
        />
      ) : null}
      {node.hasChildren ? (
        <button
          type="button"
          aria-label={isExpanded ? `Lipat ${node.label}` : `Buka ${node.label}`}
          aria-expanded={isExpanded}
          data-testid={`mind-map-expander-${node.id}`}
          disabled={node.disabled}
          onClick={(event) => {
            event.stopPropagation();
            onToggle(node.id);
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'min-w-0 flex-1 line-clamp-2 break-words text-foreground',
              isRoot ? 'text-[15px] font-semibold leading-5' : 'text-[13px] leading-4',
            )}
          >
            {node.label}
          </span>
        </TooltipTrigger>
        <TooltipContent>{node.label}</TooltipContent>
      </Tooltip>
      {!isExpanded && node.hasChildren ? (
        <Badge
          variant="secondary"
          size="sm"
          aria-label={`${hiddenCount} ide tersembunyi`}
          data-testid={`mind-map-badge-${node.id}`}
          className="shrink-0"
        >
          +{hiddenCount}
        </Badge>
      ) : null}
    </div>
  );
}

const mindNodeTypes = { mindNode: MindNode };

// ---------------------------------------------------------------------------
// Controls + kanvas (pola studio D1/D11, FR-004; AC-04)
// ---------------------------------------------------------------------------

function MindControls({ zoomLabel, zoomDuration }: { zoomLabel: string; zoomDuration: number }) {
  const { zoomIn, zoomOut, fitView, getViewport, setViewport } = useReactFlow();
  // Hit-area kontrol ≥ 44px (FR-016 pola studio); reset = zoom 100% pada
  // posisi sekarang; fit = tampilkan semua node (AC-04).
  const buttonClass =
    'flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';
  return (
    <div
      data-testid="mind-map-controls"
      className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-sm"
    >
      <button type="button" aria-label="Perkecil" title="Perkecil" onClick={() => void zoomOut({ duration: zoomDuration })} className={buttonClass}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" data-testid="mind-map-zoom-level" className="min-w-12 text-center text-sm text-foreground">
        {zoomLabel}
      </span>
      <button type="button" aria-label="Perbesar" title="Perbesar" onClick={() => void zoomIn({ duration: zoomDuration })} className={buttonClass}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Atur ulang zoom 100%"
        title="Atur ulang zoom 100%"
        onClick={() => {
          const viewport = getViewport();
          void setViewport({ x: viewport.x, y: viewport.y, zoom: 1 }, { duration: zoomDuration });
        }}
        className={buttonClass}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Tampilkan semua node"
        title="Tampilkan semua node"
        onClick={() => void fitView({ padding: 0.2, duration: zoomDuration })}
        className={buttonClass}
      >
        <Maximize className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function MindCanvas({
  nodes,
  edges,
  ariaLabel,
  minimap,
  zoomLabel,
  zoomDuration,
  reducedMotion,
  keyboardZoom,
  onZoomLevel,
}: {
  nodes: MindFlowNode[];
  edges: MindFlowEdge[];
  ariaLabel: string;
  minimap: boolean;
  zoomLabel: string;
  zoomDuration: number;
  reducedMotion: boolean;
  keyboardZoom: (action: 'in' | 'out' | 'reset' | 'fit') => void;
  onZoomLevel: (zoom: number) => void;
}) {
  const { zoomIn, zoomOut, getViewport, setViewport } = useReactFlow();
  // Ctrl/Cmd+wheel = zoom; wheel polos tidak mencegat scroll halaman (AC-04).
  const handleWheel = React.useCallback(
    (event: React.WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      if (event.deltaY < 0) void zoomIn({ duration: zoomDuration });
      else void zoomOut({ duration: zoomDuration });
    },
    [zoomIn, zoomOut, zoomDuration],
  );

  // AC-04: keyboard `+ - 0 F` zoom; panah menggeser kanvas 40px (wireframe §5)
  // saat fokus di viewport (bukan di dalam pill — pill punya expander sendiri).
  const handleCanvasKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest?.('[data-node-id]')) return;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable === true) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const PAN_STEP = 40;
      const panViewport = (dx: number, dy: number): void => {
        const viewport = getViewport();
        void setViewport({ x: viewport.x + dx, y: viewport.y + dy, zoom: viewport.zoom });
      };
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        panViewport(0, PAN_STEP);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        panViewport(0, -PAN_STEP);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        panViewport(PAN_STEP, 0);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        panViewport(-PAN_STEP, 0);
      } else {
        const key = event.key.toLowerCase();
        if (key === '+' || key === '=') {
          event.preventDefault();
          keyboardZoom('in');
        } else if (key === '-') {
          event.preventDefault();
          keyboardZoom('out');
        } else if (key === '0') {
          event.preventDefault();
          keyboardZoom('reset');
        } else if (key === 'f') {
          event.preventDefault();
          keyboardZoom('fit');
        }
      }
    },
    [getViewport, setViewport, keyboardZoom],
  );

  return (
    <div
      data-testid="mind-map-viewport"
      className="relative h-[480px] w-full overflow-hidden rounded-md border border-border bg-background"
      onWheel={handleWheel}
      onKeyDown={handleCanvasKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mindNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={!reducedMotion}
        panOnDrag
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        aria-label={ariaLabel}
        onMove={(_event, viewport) => onZoomLevel(viewport.zoom)}
      >
        {minimap ? (
          <div data-testid="mind-map-minimap" className="contents">
            <MiniMap
              pannable
              zoomable
              aria-label="Minimap"
              className="!border-border !bg-card hidden md:block"
              maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
              nodeColor="var(--primary)"
            />
          </div>
        ) : null}
        <MindControls zoomLabel={zoomLabel} zoomDuration={zoomDuration} />
      </ReactFlow>
    </div>
  );
}

function MindCanvasInner({
  nodes,
  edges,
  ariaLabel,
  minimap,
  zoomLevel,
  setZoomLevel,
  zoomDuration,
  reducedMotion,
}: {
  nodes: MindFlowNode[];
  edges: MindFlowEdge[];
  ariaLabel: string;
  minimap: boolean;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  zoomDuration: number;
  reducedMotion: boolean;
}) {
  const { zoomIn, zoomOut, fitView, getViewport, setViewport } = useReactFlow();
  const keyboardZoom = React.useCallback(
    (action: 'in' | 'out' | 'reset' | 'fit') => {
      if (action === 'in') void zoomIn({ duration: zoomDuration });
      else if (action === 'out') void zoomOut({ duration: zoomDuration });
      else if (action === 'reset') {
        const viewport = getViewport();
        void setViewport({ x: viewport.x, y: viewport.y, zoom: 1 }, { duration: zoomDuration });
      } else void fitView({ padding: 0.2, duration: zoomDuration });
    },
    [fitView, getViewport, setViewport, zoomDuration, zoomIn, zoomOut],
  );
  return (
    <MindCanvas
      nodes={nodes}
      edges={edges}
      ariaLabel={ariaLabel}
      minimap={minimap}
      zoomLabel={`${Math.round(zoomLevel * 100)}%`}
      zoomDuration={zoomDuration}
      reducedMotion={reducedMotion}
      keyboardZoom={keyboardZoom}
      onZoomLevel={setZoomLevel}
    />
  );
}

// Hormati prefers-reduced-motion — durasi animasi 0 + pinch mati (pola studio).
function useMindReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// MindMap — komponen publik
// ---------------------------------------------------------------------------

export interface MindMapProps {
  data: MindInput; // satu root (FR-001)
  /** Semantik studio: id yang awalnya COLLAPSED; kosong = semua induk terbuka. */
  defaultExpandedIds?: string[];
  expandedIds?: string[]; // controlled penuh (AC-04)
  onExpandedChange?: (ids: string[]) => void;
  minimap?: boolean; // default true (≥md)
  ariaLabel?: string; // default 'Mind map'
  className?: string;
}

export function MindMap({
  data,
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  minimap = true,
  ariaLabel = 'Mind map',
  className,
}: MindMapProps) {
  const [internalFlat, setInternalFlat] = React.useState<MindNodeFlat[]>(() => toMindFlatInput(data));
  React.useEffect(() => {
    setInternalFlat(toMindFlatInput(data));
  }, [data]);

  const normalized = React.useMemo(() => normalizeMindInput(internalFlat), [internalFlat]);

  const controlledExpanded = expandedIds !== undefined;
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() => {
    const flat = toMindFlatInput(data);
    const parents = new Set(flat.filter((node) => node.parentId !== null).map((node) => node.parentId as string));
    return [...parents].filter((id) => !(defaultExpandedIds ?? []).includes(id));
  });
  const expandedSet = React.useMemo(
    () => new Set(controlledExpanded ? expandedIds : internalExpanded),
    [controlledExpanded, expandedIds, internalExpanded],
  );

  // Callback dipanggil dari event handler (expander/keyboard), bukan render —
  // depend langsung pada onExpandedChange tanpa pola ref agar stabil dan lolos
  // aturan react-hooks/refs.
  const toggleExpanded = React.useCallback(
    (id: string) => {
      const next = new Set(expandedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const nextIds = [...next];
      if (!controlledExpanded) setInternalExpanded(nextIds);
      onExpandedChange?.(nextIds);
    },
    [controlledExpanded, expandedSet, onExpandedChange],
  );

  // Node tanpa keturunan selalu terlihat; collapsed menyembunyikan subtree
  // + edge-nya (FR-003) — walk pola studio.
  const visibleIds = React.useMemo(() => {
    const visible = new Set<string>();
    const walk = (id: string): void => {
      visible.add(id);
      const node = normalized.byId.get(id);
      if (!node) return;
      if (!node.hasChildren || expandedSet.has(id)) {
        for (const childId of node.childIds) walk(childId);
      }
    };
    if (normalized.rootId) walk(normalized.rootId);
    return visible;
  }, [expandedSet, normalized]);

  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [errorCopied, setErrorCopied] = React.useState(false);
  const reducedMotion = useMindReducedMotion();
  const zoomDuration = reducedMotion ? 0 : 200;

  // Layout + mapping memo terhadap data + expanded (AC-02).
  const positions = React.useMemo(
    () => computeMindMapPositions(normalized, visibleIds),
    [normalized, visibleIds],
  );
  const flowNodes = React.useMemo(
    () => toMindFlowNodes(normalized, positions, expandedSet, toggleExpanded),
    [normalized, positions, expandedSet, toggleExpanded],
  );
  const flowEdges = React.useMemo(
    () => toMindFlowEdges(normalized, positions, visibleIds),
    [normalized, positions, visibleIds],
  );

  if (normalized.error !== null) {
    const { message, nodeId } = normalized.error;
    const detail = nodeId ? `${message} (node: ${nodeId})` : message;
    return (
      <div role="alert" className={cn('rounded-md border border-border bg-card p-4 text-sm text-foreground', className)}>
        <p>{message}</p>
        {nodeId ? <p className="mt-1 text-muted-foreground">Node terkait: {nodeId}</p> : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            void navigator.clipboard?.writeText(detail).catch(() => undefined);
            setErrorCopied(true);
          }}
        >
          {errorCopied ? 'Detail disalin' : 'Salin detail error'}
        </Button>
      </div>
    );
  }

  if (normalized.isEmpty) {
    // Empty state minimal 012-01; CTA "Buat peta" masuk bersama FR-002 (012-02).
    return (
      <div className={cn('w-full', className)}>
        <EmptyState
          role="status"
          title="Belum ada peta ide"
          description="Sediakan data flat (id/parentId) atau nested (children) dengan tepat satu root."
        />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        role="application"
        aria-label={ariaLabel}
        tabIndex={0}
        className={cn(
          'w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        <ReactFlowProvider>
          <MindCanvasInner
            nodes={flowNodes}
            edges={flowEdges}
            ariaLabel={ariaLabel}
            minimap={minimap}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            zoomDuration={zoomDuration}
            reducedMotion={reducedMotion}
          />
        </ReactFlowProvider>
      </div>
    </TooltipProvider>
  );
}
