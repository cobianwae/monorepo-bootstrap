'use client';

// MindMap — kanvas dua sisi 012-01 (PRD 012, wireframe S-005.35) + tambah
// inline/hapus/undo 012-02 (FR-002/FR-006, M-011). Turunan ringan
// OrgChartStudio di atas `@xyflow/react` reuse: layout dua sisi seimbang K1
// (root sentral, anak root dibagi kanan-kiri proporsional lebar subtree —
// greedy deterministik, tie → kanan), node pill kompak (root 200×64, cabang
// 160×48 — K4), konektor bezier 1px token `border`, expand/collapse manual
// dengan badge "+N". 012-02: gagang "+" tambah anak/saudara (hover/fokus),
// inline-edit validasi kosong, hapus daun langsung + cabang via M-011
// (AlertDialog), controlled data/onChange sekali-per-commit, undo/redo ≤50
// (toolbar + Ctrl+Z/Y), live region, toast "Urungkan", context menu per node.
// Tanpa pencarian, pohon SR, drag-reparent (FR-010 ditunda K2/OQ#3), dan
// halaman showcase — scope 012-03 (design K2/K3).
// Catatan reuse (story task 1): `getAncestors` studio berkontrak field `title`,
// mind map memakai `label` (wireframe §2) — tidak direuse; util ancestor path
// (dipakai auto-expand pencarian) ditunda ke 012-03.
// Edge memakai inline style 1px `var(--border)` + type `default` (bezier)
// sehingga CSS edge global (smoothstep 1.5px studio) tidak perlu diubah.
// Semantik expanded mengikuti OrgChartStudio: `defaultExpandedIds` = id yang
// awalnya COLLAPSED; default (kosong) = semua induk ter-expand.

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Maximize,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Undo2,
} from 'lucide-react';
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
import { Input } from '../base/input';
import { EmptyState } from '../feedback/empty-state';
import { toast } from '../feedback/use-toast';
import { ToastAction } from '../feedback/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../feedback/alert-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../navigation/context-menu';
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
// Mutasi tambah/hapus 012-02 (FR-002/FR-006) — pure helper agar mudah diuji.
// ---------------------------------------------------------------------------

/** Batas undo/redo internal (FR-006; pola studio STUDIO_UNDO_LIMIT). */
export const MIND_UNDO_LIMIT = 50;

export function pushMindHistoryCapped(
  past: MindNodeFlat[][],
  snapshot: MindNodeFlat[],
  limit: number = MIND_UNDO_LIMIT,
): MindNodeFlat[][] {
  if (past.length >= limit) return [...past.slice(past.length - (limit - 1)), snapshot];
  return [...past, snapshot];
}

/** Hapus node beserta seluruh subtree-nya (v1: selalu hapus turunan — AC-03). */
export function applyMindDelete(flat: MindNodeFlat[], nodeId: string): MindNodeFlat[] {
  const doomed = new Set<string>([nodeId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const node of flat) {
      if (node.parentId !== null && doomed.has(node.parentId) && !doomed.has(node.id)) {
        doomed.add(node.id);
        grew = true;
      }
    }
  }
  return flat.filter((node) => !doomed.has(node.id));
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
  isEditing: boolean; // inline-edit aktif di pill ini (012-02)
  isNew: boolean; // node baru — sorotan ring sampai mutasi berikutnya
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onStartEdit: (nodeId: string) => void;
  onCommitInline: (nodeId: string, label: string) => void;
  onCancelInline: (nodeId: string) => void;
  onRequestDelete: (nodeId: string) => void;
};

/** Kumpulan handler node dalam satu objek agar memo flowNodes stabil. */
interface MindNodeHandlers {
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onStartEdit: (nodeId: string) => void;
  onCommitInline: (nodeId: string, label: string) => void;
  onCancelInline: (nodeId: string) => void;
  onRequestDelete: (nodeId: string) => void;
}

export type MindFlowNode = Node<MindNodeData, 'mindNode'>;
export type MindFlowEdge = Edge;

export function toMindFlowNodes(
  normalized: MindNormalizedResult,
  positions: MindPosition[],
  expandedSet: Set<string>,
  onToggle: (id: string) => void,
  interaction?: {
    editingId: string | null;
    newNodeId: string | null;
    handlers: MindNodeHandlers;
  },
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
          isEditing: interaction?.editingId === node.id,
          isNew: interaction?.newNodeId === node.id,
          onAddChild: () => undefined,
          onAddSibling: () => undefined,
          onStartEdit: () => undefined,
          onCommitInline: () => undefined,
          onCancelInline: () => undefined,
          onRequestDelete: () => undefined,
          ...interaction?.handlers,
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

// Gagang "+" 012-02 (FR-002, wireframe §2; pola StudioAddHandle): muncul saat
// hover/fokus pill (group/mind-node), hit-area 44px, tidak memicu pan kanvas
// (nodrag nopan). Enter/Space ditangani eksplisit (AC-01 pointer + keyboard).
function MindAddHandle({
  testId,
  label,
  className,
  onAdd,
}: {
  testId: string;
  label: string;
  className: string;
  onAdd: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          aria-label={label}
          title={label}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault(); // cegah aktivasi native ganda
            onAdd();
          }}
          className={cn(
            'nodrag nopan absolute z-20 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground opacity-0 motion-safe:transition-opacity hover:text-primary focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover/mind-node:opacity-100 group-focus-within/mind-node:opacity-100 motion-reduce:transition-none',
            className,
          )}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function MindNode({ data }: { data: MindNodeData }) {
  const {
    node,
    side,
    isExpanded,
    isEditing,
    isNew,
    onToggle,
    onAddChild,
    onAddSibling,
    onStartEdit,
    onCommitInline,
    onCancelInline,
    onRequestDelete,
  } = data;
  const isRoot = node.depth === 0;
  const canAddSibling = !isRoot;
  const hiddenCount = isExpanded ? 0 : node.descendantCount;

  // Inline-edit 012-02 (AC-02): draft + validasi kosong + guard blur ganda
  // (pola kartu studio). Esc di node baru membuang node; di node lama
  // memulihkan label lama.
  const [draft, setDraft] = React.useState(node.label);
  const [draftInvalid, setDraftInvalid] = React.useState(false);
  const handledRef = React.useRef(false);
  const afterMenuCloseRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    if (isEditing) {
      handledRef.current = false;
      setDraft(node.label);
      setDraftInvalid(false);
    }
  }, [isEditing, node.label]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);
  const commitDraft = React.useCallback(() => {
    const label = draft.trim();
    if (!label) {
      setDraftInvalid(true);
      inputRef.current?.focus();
      return;
    }
    // Tandai tertangani sebelum commit agar blur susulan tidak commit ganda.
    handledRef.current = true;
    onCommitInline(node.id, label);
  }, [draft, node.id, onCommitInline]);

  // Posisi gagang (wireframe §2): gagang luar (tambah anak) di sisi luar pill;
  // gagang sejajar (tambah saudara) di sisi menghadap root. Root hanya gagang
  // tambah anak.
  const atOuter = side === 'right' ? 'left-full' : 'left-0';
  const atRootFacing = side === 'right' ? 'left-0' : 'left-full';
  const handleAlign = 'top-1/2 -translate-x-1/2 -translate-y-1/2';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-testid="mind-map-node"
          data-node-id={node.id}
          data-level={isRoot ? 'root' : 'branch'}
          data-side={side}
          aria-disabled={node.disabled || undefined}
          title={node.label}
          tabIndex={node.disabled ? -1 : 0}
          onKeyDown={(event) => {
            // AC-03: Delete/Backspace pada pill fokus memicu alur hapus
            // (daun langsung, cabang M-011, root ditolak). Abaikan saat edit.
            if (isEditing || node.disabled) return;
            const target = event.target as HTMLElement | null;
            const tag = target?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable === true) {
              return;
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
              event.preventDefault();
              onRequestDelete(node.id);
            }
          }}
          className={cn(
            mindPillVariants({ level: isRoot ? 'root' : 'branch' }),
            'group/mind-node focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            isNew && 'ring-2 ring-primary',
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
          {isEditing ? (
            <div className="relative min-w-0 flex-1">
              <label htmlFor={`mind-map-inline-${node.id}`} className="sr-only">
                {isNew ? 'Label ide baru' : `Ubah ide ${node.label}`}
              </label>
              <Input
                ref={inputRef}
                id={`mind-map-inline-${node.id}`}
                data-testid={`mind-map-inline-input-${node.id}`}
                value={draft}
                aria-invalid={draftInvalid || undefined}
                aria-describedby={draftInvalid ? `mind-map-inline-err-${node.id}` : undefined}
                placeholder={isNew ? 'Ide baru' : 'Ubah ide'}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (event.target.value.trim()) setDraftInvalid(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitDraft();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    handledRef.current = true;
                    onCancelInline(node.id);
                  }
                }}
                onBlur={() => {
                  // Enter/Esc yang sudah menangani: abaikan blur susulan agar
                  // commit tidak ganda saat input ter-unmount.
                  if (handledRef.current) return;
                  commitDraft();
                }}
                className="h-7 border-0 bg-transparent px-1 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </div>
          ) : (
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
          )}
          {/* Hint/pesan inline di bawah pill (wireframe §2) — absolut agar
              tidak mengubah layout pill. */}
          {isEditing ? (
            draftInvalid ? (
              <span
                role="alert"
                id={`mind-map-inline-err-${node.id}`}
                data-testid={`mind-map-inline-err-${node.id}`}
                className="absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-card px-1 text-[11px] text-destructive shadow-sm"
              >
                Label tidak boleh kosong.
              </span>
            ) : (
              <span className="absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-card px-1 text-[11px] text-muted-foreground shadow-sm">
                Enter simpan · Esc batal
              </span>
            )
          ) : null}
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
          {!isEditing && !node.disabled ? (
            <>
              <MindAddHandle
                testId={`mind-map-add-child-${node.id}`}
                label={`Tambah anak ${node.label}`}
                className={cn(atOuter, handleAlign)}
                onAdd={() => onAddChild(node.id)}
              />
              {canAddSibling ? (
                <MindAddHandle
                  testId={`mind-map-add-sibling-${node.id}`}
                  label={`Tambah saudara ${node.label}`}
                  className={cn(atRootFacing, handleAlign)}
                  onAdd={() => onAddSibling(node.id)}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </ContextMenuTrigger>
      {/* Menu konteks per pill (wireframe §3) — setara aksi pointer gagang. */}
      <ContextMenuContent onCloseAutoFocus={(event) => {
        const action = afterMenuCloseRef.current;
        if (action) {
          event.preventDefault();
          afterMenuCloseRef.current = null;
          action();
        }
      }}>
        <ContextMenuItem disabled={node.disabled} data-testid={`mind-map-menu-add-child-${node.id}`} onSelect={() => {
          afterMenuCloseRef.current = () => onAddChild(node.id);
        }}>
          Tambah anak
        </ContextMenuItem>
        {canAddSibling ? (
          <ContextMenuItem disabled={node.disabled} data-testid={`mind-map-menu-add-sibling-${node.id}`} onSelect={() => {
            afterMenuCloseRef.current = () => onAddSibling(node.id);
          }}>
            Tambah saudara
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem disabled={node.disabled} data-testid={`mind-map-menu-edit-${node.id}`} onSelect={() => {
          afterMenuCloseRef.current = () => onStartEdit(node.id);
        }}>
          Edit
        </ContextMenuItem>
        {node.hasChildren ? (
          <ContextMenuItem disabled={node.disabled} data-testid={`mind-map-menu-toggle-${node.id}`} onSelect={() => onToggle(node.id)}>
            {isExpanded ? 'Lipat' : 'Buka'}
          </ContextMenuItem>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem
          data-testid={`mind-map-menu-delete-${node.id}`}
          variant="destructive"
          disabled={isRoot || node.disabled}
          onSelect={() => {
            afterMenuCloseRef.current = () => onRequestDelete(node.id);
          }}
        >
          Hapus
        </ContextMenuItem>
        {isRoot ? (
          <p className="max-w-56 px-2 py-1 text-xs text-muted-foreground">
            Root tidak bisa dihapus — hapus cabangnya dulu.
          </p>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
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
  /** Emit flat penuh sekali per commit tambah/edit/hapus — FR-006 (AC-04). */
  onChange?: (flat: MindNodeFlat[]) => void;
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
  onChange,
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

  // ---- 012-02: tambah inline + hapus M-011 + undo/redo (FR-002/FR-006) ----
  // History undo/redo di ref (bukan state) agar callback toast yang dibuat
  // saat commit selalu membaca snapshot terbaru; `historyLen` adalah cermin
  // panjang stack untuk disable tombol toolbar (ref tidak dibaca saat render).
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [newNodeId, setNewNodeId] = React.useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = React.useState<string | null>(null);
  const [deleteNodeId, setDeleteNodeId] = React.useState<string | null>(null);
  const [historyLen, setHistoryLen] = React.useState({ past: 0, future: 0 });
  const [announcement, setAnnouncement] = React.useState('');
  const pastRef = React.useRef<MindNodeFlat[][]>([]);
  const futureRef = React.useRef<MindNodeFlat[][]>([]);
  const pendingIdsRef = React.useRef<Set<string>>(new Set());
  const counterRef = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canUndo = historyLen.past > 0;
  const canRedo = historyLen.future > 0;
  const syncHistoryLen = React.useCallback(() => {
    setHistoryLen({ past: pastRef.current.length, future: futureRef.current.length });
  }, []);
  const internalFlatRef = React.useRef(internalFlat);
  React.useEffect(() => {
    internalFlatRef.current = internalFlat;
  }, [internalFlat]);
  // Callback konsumen disimpan di ref agar handler internal stabil (pola
  // studio): identitas flowNodes tidak berubah tiap render hanya karena
  // parent membuat arrow function baru.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const emitChange = React.useCallback((next: MindNodeFlat[]) => {
    onChangeRef.current?.(next);
  }, []);

  const undo = React.useCallback(() => {
    const snapshot = pastRef.current[pastRef.current.length - 1];
    if (!snapshot) return;
    futureRef.current = pushMindHistoryCapped(futureRef.current, internalFlatRef.current.filter((node) => !pendingIdsRef.current.has(node.id)));
    pendingIdsRef.current.clear();
    pastRef.current = pastRef.current.slice(0, -1);
    setInternalFlat(snapshot);
    emitChange(snapshot);
    setEditingId(null);
    setNewNodeId(null);
    setAnnouncement('Perubahan dibatalkan.');
    syncHistoryLen();
  }, [emitChange, syncHistoryLen]);

  const redo = React.useCallback(() => {
    const snapshot = futureRef.current[futureRef.current.length - 1];
    if (!snapshot) return;
    pastRef.current = pushMindHistoryCapped(pastRef.current, internalFlatRef.current.filter((node) => !pendingIdsRef.current.has(node.id)));
    pendingIdsRef.current.clear();
    futureRef.current = futureRef.current.slice(0, -1);
    setInternalFlat(snapshot);
    emitChange(snapshot);
    setEditingId(null);
    setNewNodeId(null);
    setAnnouncement('Perubahan diulang.');
    syncHistoryLen();
  }, [emitChange, syncHistoryLen]);

  // AC-04: tiap mutasi = satu onChange(flat penuh) + satu push undo (≤50) +
  // toast "Urungkan" ≤5 dtk + live region.
  const commitWithUndo = React.useCallback(
    (snapshot: MindNodeFlat[], next: MindNodeFlat[], toastTitle: string) => {
      pastRef.current = pushMindHistoryCapped(pastRef.current, snapshot);
      futureRef.current = [];
      setInternalFlat(next);
      emitChange(next);
      syncHistoryLen();
      setAnnouncement(`${toastTitle}.`);
      toast({
        title: toastTitle,
        description: 'Urungkan bila salah.',
        duration: 5000,
        action: (
          <ToastAction altText="Urungkan" onClick={undo}>
            Urungkan
          </ToastAction>
        ),
      });
    },
    [emitChange, syncHistoryLen, undo],
  );

  const ensureExpanded = React.useCallback(
    (parentId: string | null) => {
      if (!parentId || expandedSet.has(parentId)) return;
      const nextIds = [...expandedSet, parentId];
      if (!controlledExpanded) setInternalExpanded(nextIds);
      onExpandedChange?.(nextIds);
    },
    [controlledExpanded, expandedSet, onExpandedChange],
  );

  // Node pending belum di-commit → belum emitChange; commit memakai snapshot
  // tanpa node pending agar undo menghapus node baru (pola studio).
  const spawnPending = React.useCallback(
    (parentId: string | null) => {
      // Satu pending pada satu waktu: pending lama yang belum di-commit dibuang.
      const staleIds = [...pendingIdsRef.current];
      counterRef.current += 1;
      let candidate = `ide-baru-${counterRef.current}`;
      while (internalFlat.some((node) => node.id === candidate)) {
        counterRef.current += 1;
        candidate = `ide-baru-${counterRef.current}`;
      }
      pendingIdsRef.current = new Set([candidate]);
      setInternalFlat((prevFlat) => [
        ...prevFlat.filter((node) => !staleIds.includes(node.id)),
        { id: candidate, parentId, label: '' },
      ]);
      ensureExpanded(parentId);
      setNewNodeId(candidate);
      setEditingId(candidate);
    },
    [ensureExpanded, internalFlat],
  );

  const handleCommitInline = React.useCallback(
    (nodeId: string, label: string) => {
      const isPending = pendingIdsRef.current.has(nodeId);
      const snapshot = isPending ? internalFlat.filter((node) => node.id !== nodeId) : internalFlat;
      const next = internalFlat.map((node) => (node.id === nodeId ? { ...node, label } : node));
      pendingIdsRef.current.delete(nodeId);
      setEditingId(null);
      setNewNodeId(nodeId);
      commitWithUndo(snapshot, next, isPending ? 'Ditambah' : 'Diperbarui');
      setFocusNodeId(nodeId);
    },
    [commitWithUndo, internalFlat],
  );

  const handleStartEdit = React.useCallback((nodeId: string) => {
    setEditingId(nodeId);
  }, []);

  // Esc (AC-02): node baru dibuang (fokus kembali ke parent); node lama
  // kembali ke label sebelumnya (fokus kembali ke node).
  const handleCancelInline = React.useCallback(
    (nodeId: string) => {
      const isPending = pendingIdsRef.current.has(nodeId);
      const parentId = internalFlat.find((node) => node.id === nodeId)?.parentId ?? null;
      if (isPending) {
        pendingIdsRef.current.delete(nodeId);
        // Node pending belum pernah di-commit via onChange → buang lokal saja.
        setInternalFlat((prevFlat) => prevFlat.filter((node) => node.id !== nodeId));
        if (parentId) setFocusNodeId(parentId);
      } else {
        setFocusNodeId(nodeId);
      }
      setEditingId(null);
    },
    [internalFlat],
  );

  // AC-03: daun hapus langsung; cabang buka M-011; root ditolak + penjelasan.
  const confirmDelete = React.useCallback(
    (nodeId: string) => {
      const flat = internalFlatRef.current;
      const target = flat.find((node) => node.id === nodeId);
      if (!target || target.parentId === null) return; // root diproteksi
      const next = applyMindDelete(flat, nodeId);
      commitWithUndo(flat, next, 'Dihapus');
      const descendantCount = normalized.byId.get(nodeId)?.descendantCount ?? 0;
      setAnnouncement(
        descendantCount > 0
          ? `Ide ${target.label} dihapus beserta ${descendantCount} turunan.`
          : `Ide ${target.label} dihapus.`,
      );
      setDeleteNodeId(null);
      if (target.parentId) setFocusNodeId(target.parentId);
    },
    [commitWithUndo, normalized],
  );

  const handleRequestDelete = React.useCallback(
    (nodeId: string) => {
      const node = normalized.byId.get(nodeId);
      if (!node) return;
      if (node.depth === 0) {
        setAnnouncement('Root tidak bisa dihapus — hapus cabangnya dulu.');
        return;
      }
      if (node.descendantCount === 0) {
        confirmDelete(nodeId); // daun: hapus langsung tanpa dialog
        return;
      }
      setDeleteNodeId(nodeId); // cabang: buka M-011
    },
    [confirmDelete, normalized],
  );

  // Shortcut global Ctrl/Cmd+Z / Ctrl+Y / Ctrl+Shift+Z (AC-04): abaikan saat
  // fokus di field input.
  const handleRootKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const inField =
        tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable === true;
      if (!inField && (event.ctrlKey || event.metaKey) && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
          return;
        }
        if (key === 'y' || (key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    },
    [redo, undo],
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
  // Handler node dalam satu objek agar memo flowNodes stabil (pola studio).
  const handlers = React.useMemo(
    () => ({
      onToggle: toggleExpanded,
      onAddChild: spawnPending,
      onAddSibling: (nodeId: string) => {
        const node = normalized.byId.get(nodeId);
        if (node?.parentId) spawnPending(node.parentId);
      },
      onStartEdit: handleStartEdit,
      onCommitInline: handleCommitInline,
      onCancelInline: handleCancelInline,
      onRequestDelete: handleRequestDelete,
    }),
    [
      toggleExpanded,
      spawnPending,
      normalized,
      handleStartEdit,
      handleCommitInline,
      handleCancelInline,
      handleRequestDelete,
    ],
  );
  const flowNodes = React.useMemo(
    // eslint-disable-next-line react-hooks/refs -- handler hanya disimpan sebagai data; ref dibaca saat event, bukan render (pola studio).
    () => toMindFlowNodes(normalized, positions, expandedSet, toggleExpanded, { editingId, newNodeId, handlers }),
    [normalized, positions, expandedSet, toggleExpanded, editingId, newNodeId, handlers],
  );
  const flowEdges = React.useMemo(
    () => toMindFlowEdges(normalized, positions, visibleIds),
    [normalized, positions, visibleIds],
  );

  // Fokus pill target (setelah commit/Esc/hapus kembali ke node/parent).
  React.useEffect(() => {
    if (!focusNodeId || !rootRef.current) return;
    const target = Array.from(rootRef.current.querySelectorAll('[data-node-id]')).find(
      (el) => el.getAttribute('data-node-id') === focusNodeId,
    );
    if (target instanceof HTMLElement) target.focus();
    setFocusNodeId(null);
  }, [focusNodeId, flowNodes]);

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
    // Empty state + CTA "Buat peta" (FR-002, wireframe §4): buat root lalu
    // langsung inline-edit.
    return (
      <div className={cn('w-full', className)}>
        <EmptyState
          role="status"
          title="Belum ada peta ide"
          description="Mulai dari satu ide pusat, lalu tambah cabang lewat gagang +."
          actionLabel="Buat peta"
          onAction={() => spawnPending(null)}
        />
      </div>
    );
  }

  const deleteNode = deleteNodeId ? (normalized.byId.get(deleteNodeId) ?? null) : null;
  const deleteDescendantCount = deleteNode?.descendantCount ?? 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        role="application"
        aria-label={ariaLabel}
        tabIndex={0}
        ref={rootRef}
        onKeyDown={handleRootKeyDown}
        className={cn(
          'w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        {/* Toolbar kanan (wireframe §1): tambah anak root + undo/redo. Fit/
            reset zoom tetap di Controls di atas kanvas. */}
        <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Tambah anak root"
            data-testid="mind-map-add-root"
            onClick={() => {
              if (normalized.rootId) spawnPending(normalized.rootId);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah anak root
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="mind-map-undo"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Urungkan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="mind-map-redo"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 className="h-4 w-4" aria-hidden="true" />
            Ulangi
          </Button>
        </div>
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
        {/* Status strip bawah (wireframe §1): jumlah ide + zoom + live region
            status mutasi (AC-04). */}
        <div
          data-testid="mind-map-status"
          role="status"
          aria-live="polite"
          className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"
        >
          <span>
            {positions.length} ide tampil · zoom {Math.round(zoomLevel * 100)}%
          </span>
          <span data-testid="mind-map-announcement">{announcement}</span>
        </div>
        {/* M-011 (AC-03): konfirmasi hapus cabang — label + N turunan, v1
            selalu hapus subtree. Esc/batal menutup tanpa mengubah data. */}
        {deleteNode ? (
          <AlertDialog open onOpenChange={(open) => { if (!open) setDeleteNodeId(null); }}>
            <AlertDialogContent onCloseAutoFocus={(event) => {
              event.preventDefault();
              const targetId = internalFlatRef.current.some((node) => node.id === deleteNode.id)
                ? deleteNode.id : deleteNode.parentId;
              if (!targetId) return;
              const target = Array.from(rootRef.current?.querySelectorAll('[data-node-id]') ?? [])
                .find((element) => element.getAttribute('data-node-id') === targetId);
              if (target instanceof HTMLElement) target.focus();
            }}>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {deleteDescendantCount > 0
                    ? `Hapus "${deleteNode.label}" + ${deleteDescendantCount} turunan?`
                    : `Hapus "${deleteNode.label}"?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteDescendantCount > 0
                    ? `Ide "${deleteNode.label}" beserta ${deleteDescendantCount} turunannya akan dihapus dari peta.`
                    : `Ide "${deleteNode.label}" akan dihapus dari peta.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="mind-map-delete-cancel">Batal</AlertDialogCancel>
                <AlertDialogAction data-testid="mind-map-delete-confirm" onClick={() => confirmDelete(deleteNode.id)}>
                  Ya, hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
