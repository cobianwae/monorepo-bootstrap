'use client';

// OrgChartStudio — fondasi kanvas 011-01 (PRD 011, design org-chart-studio).
// Satu komponen pengganti OrgChart + OrgChartEditor: satu layout balanced-tidy
// (design §3), satu viewport xyflow. Sengaja self-contained (tanpa import dari
// org-chart/org-chart-editor) agar tidak ada kode kanvas ganda membentuk
// ketergantungan ke legacy (FR-001, FR-015).
// Default CSS xyflow TIDAK diimpor mentah — semua permukaan dipetakan ke token
// (design D11): node/edge/minimap/controls memakai `card`/`border`/`primary`.
// Fondasi ini belum mencakup tambah/pindah/hapus/pencarian (scope 011-02–011-04);
// prop `onChange` diterima sesuai kontrak §2 dan mulai dipakai saat mutasi ada.

import * as React from 'react';
import { ChevronDown, ChevronRight, Maximize, Minus, Plus } from 'lucide-react';
import {
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../base/avatar';
import { Badge } from '../base/badge';
import { Button } from '../base/button';
import { Input } from '../base/input';
import { Label } from '../base/label';
import { Skeleton } from '../base/skeleton';
import { EmptyState } from '../feedback/empty-state';
import { ToastAction } from '../feedback/toast';
import { toast } from '../feedback/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../form/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../overlay/sheet';

export type OrgStudioAccent = 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface OrgStudioNodeFlat {
  id: string;
  parentId: string | null; // null = root (tepat satu)
  title: string; // nama — wajib non-kosong
  subtitle?: string; // jabatan
  badge?: string; // departemen
  avatarSrc?: string;
  accent?: OrgStudioAccent;
  disabled?: boolean;
}

export interface OrgStudioNodeNested extends Omit<OrgStudioNodeFlat, 'parentId'> {
  children?: OrgStudioNodeNested[];
}

export type OrgStudioInput = OrgStudioNodeFlat[] | OrgStudioNodeNested;

export interface OrgStudioNodeNormalized extends OrgStudioNodeFlat {
  depth: number;
  childIds: string[];
  hasChildren: boolean;
  descendantCount: number; // untuk M-008 "N turunan" (dipakai penuh di 011-03)
}

export interface OrgChartStudioProps {
  data: OrgStudioInput; // satu root (FR-001)
  onChange?: (next: OrgStudioNodeFlat[]) => void; // sekali per commit (FR-013)
  defaultExpandedIds?: string[]; // uncontrolled awal
  expandedIds?: string[]; // controlled penuh
  onExpandedChange?: (ids: string[]) => void;
  highlightedIds?: string[]; // FR-010 (presentasional; pencarian di 011-04)
  loading?: boolean; // FR-012
  error?: string | null; // FR-012 eksternal
  onSelect?: (node: OrgStudioNodeNormalized) => void;
  emptyActionLabel?: string; // default 'Buat root'
  onEmptyAction?: () => void;
  minimap?: boolean; // default true (≥md)
  ariaLabel?: string; // default 'Org chart studio'
  className?: string;
}

export interface OrgChartStudioError {
  code: 'duplicate-id' | 'missing-parent' | 'cycle' | 'root-count';
  message: string;
  nodeId: string | null;
}

// Slot kartu lega design §3 (D4): 240×84, gap 32, level 64 (top-down saja).
export const STUDIO_NODE_WIDTH = 240;
export const STUDIO_NODE_HEIGHT = 84;
const STUDIO_GAP = 32;
const STUDIO_LEVEL_GAP = 64;
const STUDIO_SLOT_WIDTH = STUDIO_NODE_WIDTH + STUDIO_GAP;
const STUDIO_LEVEL_HEIGHT = STUDIO_NODE_HEIGHT + STUDIO_LEVEL_GAP;

// ---------------------------------------------------------------------------
// Normalisasi + validasi terstruktur (pola 003/010, bukan throw — design D2)
// ---------------------------------------------------------------------------

export interface StudioNormalizedResult {
  nodes: OrgStudioNodeNormalized[];
  byId: Map<string, OrgStudioNodeNormalized>;
  rootId: string | null;
  error: OrgChartStudioError | null;
  isEmpty: boolean;
}

function flattenNested(root: OrgStudioNodeNested): OrgStudioNodeFlat[] {
  const flat: OrgStudioNodeFlat[] = [];
  const walk = (node: OrgStudioNodeNested, parentId: string | null): void => {
    const { children, ...rest } = node;
    flat.push({ ...rest, parentId });
    for (const child of children ?? []) {
      walk(child, node.id);
    }
  };
  walk(root, null);
  return flat;
}

function toFlatInput(data: OrgStudioInput): OrgStudioNodeFlat[] {
  return Array.isArray(data) ? [...data] : flattenNested(data);
}

export function normalizeStudioInput(data: OrgStudioInput): StudioNormalizedResult {
  const flat: OrgStudioNodeFlat[] = Array.isArray(data) ? [...data] : flattenNested(data);

  if (flat.length === 0) {
    return { nodes: [], byId: new Map(), rootId: null, error: null, isEmpty: true };
  }

  const byIdFlat = new Map<string, OrgStudioNodeFlat>();
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

  const nodes: OrgStudioNodeNormalized[] = flat.map((node) => {
    const childIds = childIdsByParent.get(node.id) ?? [];
    return {
      ...node,
      depth: depthById.get(node.id) ?? 0,
      childIds,
      hasChildren: childIds.length > 0,
      descendantCount: descendantCount.get(node.id) ?? 0,
    };
  });

  return {
    nodes,
    byId: new Map(nodes.map((node) => [node.id, node])),
    rootId,
    error: null,
    isEmpty: false,
  };
}

// Util reuse pola 003/010 (design §2): path ancestor untuk auto-expand pencarian.
export function getAncestors(nodes: OrgStudioNodeFlat[], id: string): string[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const ancestors: string[] = [];
  const seen = new Set<string>([id]);
  let current = byId.get(id);
  while (current?.parentId != null && !seen.has(current.parentId)) {
    seen.add(current.parentId);
    ancestors.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return ancestors.reverse();
}

// ---------------------------------------------------------------------------
// Layout balanced-tidy post-order (design §3 langkah 3, tanpa d3-hierarchy)
// Jalur migrasi d3-hierarchy hanya mengganti langkah ini; langkah 4 (pemetaan
// ke xyflow) tidak berubah.
// ---------------------------------------------------------------------------

export interface StudioPosition {
  id: string;
  x: number;
  y: number;
}

export function computeStudioPositions(
  normalized: StudioNormalizedResult,
  visibleIds: Set<string>,
): StudioPosition[] {
  const positions: StudioPosition[] = [];
  if (normalized.rootId === null || normalized.error !== null) return positions;

  const slotWidths = new Map<string, number>();
  const computeWidth = (id: string): number => {
    const cached = slotWidths.get(id);
    if (cached !== undefined) return cached;
    const node = normalized.byId.get(id);
    const visibleChildren = (node?.childIds ?? []).filter((childId) => visibleIds.has(childId));
    const width =
      visibleChildren.length === 0
        ? 1
        : Math.max(1, visibleChildren.reduce((sum, childId) => sum + computeWidth(childId), 0));
    slotWidths.set(id, width);
    return width;
  };
  computeWidth(normalized.rootId);

  const place = (id: string, leftSlot: number): void => {
    const node = normalized.byId.get(id);
    if (!node) return;
    const width = slotWidths.get(id) ?? 1;
    const centerSlot = leftSlot + width / 2;
    const x = centerSlot * STUDIO_SLOT_WIDTH - STUDIO_NODE_WIDTH / 2;
    const y = node.depth * STUDIO_LEVEL_HEIGHT;
    positions.push({ id, x, y });
    let cursor = leftSlot;
    for (const childId of node.childIds) {
      if (!visibleIds.has(childId)) continue;
      place(childId, cursor);
      cursor += slotWidths.get(childId) ?? 1;
    }
  };
  place(normalized.rootId, 0);
  return positions;
}

// ---------------------------------------------------------------------------
// Pemetaan ke xyflow (design §3 langkah 4)
// ---------------------------------------------------------------------------

export type StudioNodeData = {
  node: OrgStudioNodeNormalized;
  isExpanded: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isEditing: boolean; // kartu sedang mode inline-edit (FR-005)
  isNew: boolean; // kartu baru saja di-commit → sorotan (FR-005)
  onToggle: (id: string) => void;
  onSelectNode: ((node: OrgStudioNodeNormalized) => void) | undefined;
  onAddChild: (parentId: string) => void; // gagang bawah "+" (FR-005)
  onAddSibling: (nodeId: string) => void; // gagang samping "+" (FR-005)
  onOpenDetail: (node: OrgStudioNodeNormalized) => void; // panel S-005.34.01 (FR-006)
  onCommitInline: (nodeId: string, title: string) => void;
  onCancelInline: (nodeId: string) => void;
};

export type StudioFlowNode = Node<StudioNodeData, 'studioNode'>;
export type StudioFlowEdge = Edge;

export function toStudioFlowNodes(
  normalized: StudioNormalizedResult,
  positions: StudioPosition[],
  expandedSet: Set<string>,
  highlightedSet: Set<string>,
  selectedId: string | null,
  editingId: string | null,
  newNodeId: string | null,
  handlers: {
    onToggle: StudioNodeData['onToggle'];
    onSelectNode: StudioNodeData['onSelectNode'];
    onAddChild: StudioNodeData['onAddChild'];
    onAddSibling: StudioNodeData['onAddSibling'];
    onOpenDetail: StudioNodeData['onOpenDetail'];
    onCommitInline: StudioNodeData['onCommitInline'];
    onCancelInline: StudioNodeData['onCancelInline'];
  },
): StudioFlowNode[] {
  const positionById = new Map(positions.map((position) => [position.id, position]));
  return normalized.nodes
    .filter((node) => positionById.has(node.id))
    .map((node) => {
      const position = positionById.get(node.id) ?? { x: 0, y: 0 };
      const selected = selectedId !== null && selectedId === node.id;
      return {
        id: node.id,
        type: 'studioNode' as const,
        position: { x: position.x, y: position.y },
        width: STUDIO_NODE_WIDTH,
        height: STUDIO_NODE_HEIGHT,
        data: {
          node,
          isExpanded: expandedSet.has(node.id),
          isSelected: selected,
          isHighlighted: highlightedSet.has(node.id),
          isEditing: editingId === node.id,
          isNew: newNodeId === node.id,
          onToggle: handlers.onToggle,
          onSelectNode: handlers.onSelectNode,
          onAddChild: handlers.onAddChild,
          onAddSibling: handlers.onAddSibling,
          onOpenDetail: handlers.onOpenDetail,
          onCommitInline: handlers.onCommitInline,
          onCancelInline: handlers.onCancelInline,
        },
        selected,
      };
    });
}

export function toStudioFlowEdges(
  normalized: StudioNormalizedResult,
  visibleIds: Set<string>,
): StudioFlowEdge[] {
  const edges: StudioFlowEdge[] = [];
  for (const node of normalized.nodes) {
    if (!visibleIds.has(node.id)) continue;
    for (const childId of node.childIds) {
      if (!visibleIds.has(childId)) continue;
      edges.push({
        id: `${node.id}>${childId}`,
        source: node.id,
        target: childId,
        type: 'smoothstep',
        style: { strokeWidth: 1, stroke: 'var(--border)' },
      });
    }
  }
  return edges;
}

// ---------------------------------------------------------------------------
// Kartu StudioNode 240×84 (design D4)
// ---------------------------------------------------------------------------

const ACCENT_STRIP_CLASS: Record<OrgStudioAccent, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

const ACCENT_BADGE_VARIANT: Record<OrgStudioAccent, React.ComponentProps<typeof Badge>['variant']> = {
  primary: 'default',
  success: 'success',
  warning: 'warning',
  info: 'info',
  destructive: 'destructive',
};

function getInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

// Gagang "+" 011-02 (FR-005, D5): visual lingkaran 24px, hit-area 44px (FR-016).
function StudioAddHandle({
  testId,
  label,
  className,
  onAdd,
}: {
  testId: string;
  label: string;
  className?: string;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onAdd();
      }}
      className={cn(
        'absolute z-20 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground',
        'opacity-0 transition-opacity duration-200 group-hover/studio-node:opacity-100 group-focus-within/studio-node:opacity-100 focus:opacity-100 motion-reduce:transition-none',
        'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}

function StudioNode({ data }: { data: StudioNodeData }) {
  const {
    node,
    isExpanded,
    isSelected,
    isHighlighted,
    isEditing,
    isNew,
    onToggle,
    onSelectNode,
    onAddChild,
    onAddSibling,
    onOpenDetail,
    onCommitInline,
    onCancelInline,
  } = data;
  const badgeVariant = node.accent ? ACCENT_BADGE_VARIANT[node.accent] : 'secondary';
  const fullTitle = `${node.title}${node.subtitle ? ` — ${node.subtitle}` : ''}${node.badge ? ` (${node.badge})` : ''}`;
  const [draft, setDraft] = React.useState(node.title);
  const [draftInvalid, setDraftInvalid] = React.useState(false);
  // Sinkronkan draft saat mulai edit kartu ini; jangan reset saat commit
  // karena node.title berubah setelah commit.
  const handledRef = React.useRef(false);
  React.useEffect(() => {
    if (isEditing) {
      handledRef.current = false;
      setDraft(node.title);
      setDraftInvalid(false);
    }
  }, [isEditing, node.title]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);
  const commitDraft = React.useCallback(() => {
    const title = draft.trim();
    if (!title) {
      setDraftInvalid(true);
      inputRef.current?.focus();
      return;
    }
    // Tandai tertangani sebelum commit agar blur susulan tidak commit ganda.
    handledRef.current = true;
    onCommitInline(node.id, title);
  }, [draft, node.id, onCommitInline]);
  const canAddSibling = node.parentId !== null;
  return (
    <div
      data-testid="org-studio-node"
      data-node-id={node.id}
      data-selected={isSelected ? 'true' : undefined}
      data-highlighted={isHighlighted ? 'true' : undefined}
      data-new={isNew ? 'true' : undefined}
      title={isEditing ? undefined : fullTitle}
      tabIndex={0}
      onClick={() => {
        if (!isEditing) onSelectNode?.(node);
      }}
      onDoubleClick={() => {
        if (!isEditing) onOpenDetail(node);
      }}
      onKeyDown={(event) => {
        if (isEditing) return;
        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          onOpenDetail(node);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          onSelectNode?.(node);
        }
      }}
      className={cn(
        'group/studio-node relative flex h-[84px] w-[240px] items-center gap-2 rounded-md border bg-card pl-4 pr-2 text-card-foreground',
        'motion-safe:transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected || isHighlighted || isNew || isEditing
          ? 'border-primary ring-2 ring-ring'
          : 'border-border',
      )}
    >
      {isHighlighted ? (
        <span
          data-testid="org-studio-highlight-chip"
          className="absolute -top-2 left-2 z-10 rounded-sm bg-primary px-1 text-[10px] leading-4 text-primary-foreground"
        >
          Cocok
        </span>
      ) : null}
      {node.accent ? (
        <span
          aria-hidden="true"
          data-testid="org-studio-accent-strip"
          className={cn('absolute left-0 top-0 h-full w-[3px] rounded-l-md', ACCENT_STRIP_CLASS[node.accent])}
        />
      ) : null}
      {node.hasChildren && !isEditing ? (
        <button
          type="button"
          aria-label={isExpanded ? `Collapse ${node.title}` : `Perluas ${node.title}`}
          aria-expanded={isExpanded}
          onClick={(event) => {
            event.stopPropagation();
            onToggle(node.id);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Detail ${node.title}`}
        data-testid={`org-studio-detail-${node.id}`}
        disabled={isEditing}
        onClick={(event) => {
          event.stopPropagation();
          onOpenDetail(node);
        }}
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
      >
        <Avatar size="sm">
          {node.avatarSrc ? <AvatarImage src={node.avatarSrc} alt="" /> : null}
          <AvatarFallback>{getInitials(node.title)}</AvatarFallback>
        </Avatar>
      </button>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        {isEditing ? (
          <>
            <label htmlFor={`org-studio-inline-${node.id}`} className="sr-only">
              Nama node baru
            </label>
            <Input
              ref={inputRef}
              id={`org-studio-inline-${node.id}`}
              data-testid={`org-studio-inline-input-${node.id}`}
              value={draft}
              aria-invalid={draftInvalid || undefined}
              aria-describedby={draftInvalid ? `org-studio-inline-err-${node.id}` : undefined}
              placeholder="Nama baru"
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
              className="h-8 text-sm"
            />
            {draftInvalid ? (
              <span role="alert" id={`org-studio-inline-err-${node.id}`} className="text-xs text-destructive">
                Nama tidak boleh kosong.
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Enter simpan · Esc batal</span>
            )}
          </>
        ) : (
          <>
            <span className="truncate text-sm font-medium text-foreground" title={node.title}>
              {node.title}
            </span>
            {node.subtitle ? (
              <span className="line-clamp-2 break-words text-xs leading-4 text-muted-foreground">{node.subtitle}</span>
            ) : null}
          </>
        )}
      </div>
      {node.badge && !isEditing ? (
        <Badge variant={badgeVariant} size="sm" className="shrink-0">
          {node.badge}
        </Badge>
      ) : null}
      {!isEditing ? (
        <>
          <StudioAddHandle
            testId={`org-studio-add-child-${node.id}`}
            label={`Tambah bawahan untuk ${node.title}`}
            onAdd={() => onAddChild(node.id)}
            className="left-1/2 top-full -translate-x-1/2 -translate-y-1/2"
          />
          {canAddSibling ? (
            <StudioAddHandle
              testId={`org-studio-add-sibling-${node.id}`}
              label={`Tambah sejawat untuk ${node.title}`}
              onAdd={() => onAddSibling(node.id)}
              className="left-full top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const studioNodeTypes = { studioNode: StudioNode };

// ---------------------------------------------------------------------------
// Controls + kanvas (design D1/D11, FR-004)
// ---------------------------------------------------------------------------

function StudioControls({ zoomLabel }: { zoomLabel: string }) {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  return (
    <div
      data-testid="org-studio-controls"
      className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-sm"
    >
      <button type="button" aria-label="Zoom out" onClick={() => void zoomOut()} className={buttonClass}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" data-testid="org-studio-zoom-level" className="min-w-12 text-center text-sm text-foreground">
        {zoomLabel}
      </span>
      <button type="button" aria-label="Zoom in" onClick={() => void zoomIn()} className={buttonClass}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Reset zoom"
        onClick={() => void setViewport({ x: 0, y: 0, zoom: 1 })}
        className={buttonClass}
      >
        <Maximize className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Fit view" onClick={() => void fitView({ padding: 0.2 })} className={buttonClass}>
        <Maximize className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function StudioCanvas({
  nodes,
  edges,
  ariaLabel,
  minimap,
  zoomLabel,
  keyboardZoom,
  onZoomLevel,
}: {
  nodes: StudioFlowNode[];
  edges: StudioFlowEdge[];
  ariaLabel: string;
  minimap: boolean;
  zoomLabel: string;
  keyboardZoom: (action: 'in' | 'out' | 'reset' | 'fit') => void;
  onZoomLevel: (zoom: number) => void;
}) {
  const { zoomIn, zoomOut } = useReactFlow();
  // Ctrl/Cmd+wheel = zoom; wheel polos tidak mencegat scroll halaman (AC-04).
  const handleWheel = React.useCallback(
    (event: React.WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      if (event.deltaY < 0) void zoomIn();
      else void zoomOut();
    },
    [zoomIn, zoomOut],
  );

  return (
    <div
      className="relative h-[480px] w-full overflow-hidden rounded-md border border-border bg-background"
      onWheel={handleWheel}
      onKeyDown={(event) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
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
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={studioNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        zoomOnScroll={false}
        // Double-click dipakai untuk buka panel detail kartu (FR-006, D6);
        // zoom-on-double-click xyflow memakan event tersebut.
        zoomOnDoubleClick={false}
        zoomOnPinch
        panOnDrag
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        aria-label={ariaLabel}
        onMove={(_event, viewport) => onZoomLevel(viewport.zoom)}
      >
        {minimap ? (
          <MiniMap
            data-testid="org-studio-minimap"
            pannable
            zoomable
            aria-label="Minimap"
            className="!border-border !bg-card hidden md:block"
            maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
            nodeColor="var(--primary)"
          />
        ) : null}
        <StudioControls zoomLabel={zoomLabel} />
      </ReactFlow>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel detail S-005.34.01 (011-02, FR-006, D6): sheet kanan 320px,
// overlay di mobile; hanya terbuka bila diminta via [≡]/avatar/double-click/
// Shift+Enter — tidak pernah otomatis saat tambah.
// ---------------------------------------------------------------------------

export interface StudioDetailDraft {
  title: string;
  subtitle: string;
  badge: string;
  accent: OrgStudioAccent | null;
}

const ACCENT_OPTIONS: Array<{ value: OrgStudioAccent; label: string }> = [
  { value: 'primary', label: 'primary' },
  { value: 'success', label: 'success' },
  { value: 'warning', label: 'warning' },
  { value: 'info', label: 'info' },
  { value: 'destructive', label: 'destructive' },
];

function StudioDetailPanel({
  node,
  open,
  onOpenChange,
  parentTitle,
  childTitles,
  pathTitles,
  onSave,
}: {
  node: OrgStudioNodeNormalized | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTitle: string | null;
  childTitles: string[];
  pathTitles: string[];
  onSave: (nodeId: string, draft: StudioDetailDraft) => void;
}) {
  const [draft, setDraft] = React.useState<StudioDetailDraft>({
    title: node?.title ?? '',
    subtitle: node?.subtitle ?? '',
    badge: node?.badge ?? '',
    accent: node?.accent ?? null,
  });
  const [titleInvalid, setTitleInvalid] = React.useState(false);
  const badgeVariant = node?.accent ? ACCENT_BADGE_VARIANT[node.accent] : 'secondary';
  const isRoot = node?.parentId === null || node === null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" aria-describedby={undefined} className="w-80 overflow-y-auto sm:max-w-[320px]">
        <SheetHeader>
          <SheetTitle>{node ? `Detail ${node.title}` : 'Detail'}</SheetTitle>
          <SheetDescription>Panel detail on-demand. Tambah tidak pernah membuka panel ini.</SheetDescription>
        </SheetHeader>
        {node ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                {node.avatarSrc ? <AvatarImage src={node.avatarSrc} alt="" /> : null}
                <AvatarFallback>{getInitials(node.title)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-foreground">{node.title}</p>
                {node.subtitle ? <p className="truncate text-sm text-muted-foreground">{node.subtitle}</p> : null}
                {node.badge ? (
                  <Badge variant={badgeVariant} size="sm" className="mt-1">
                    {node.badge}
                  </Badge>
                ) : null}
              </div>
            </div>
            <dl className="space-y-1 text-sm" data-testid="org-studio-detail-meta">
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-foreground">Path:</dt>
                <dd className="break-words text-foreground" data-testid="org-studio-detail-path">
                  {pathTitles.join(' / ')}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-foreground">Atasan:</dt>
                <dd className="break-words text-foreground">{parentTitle ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-foreground">Anak:</dt>
                <dd className="break-words text-foreground">
                  {childTitles.length > 0 ? childTitles.join(', ') : '—'}
                </dd>
              </div>
            </dl>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.title.trim()) {
                  setTitleInvalid(true);
                  return;
                }
                onSave(node.id, draft);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="org-studio-detail-title">Nama</Label>
                <Input
                  id="org-studio-detail-title"
                  data-testid="org-studio-detail-title"
                  value={draft.title}
                  aria-invalid={titleInvalid || undefined}
                  onChange={(event) => {
                    setDraft((d) => ({ ...d, title: event.target.value }));
                    if (event.target.value.trim()) setTitleInvalid(false);
                  }}
                />
                {titleInvalid ? (
                  <p role="alert" className="text-sm text-destructive">
                    Nama tidak boleh kosong.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-studio-detail-subtitle">Jabatan</Label>
                <Input
                  id="org-studio-detail-subtitle"
                  data-testid="org-studio-detail-subtitle"
                  value={draft.subtitle}
                  onChange={(event) => setDraft((d) => ({ ...d, subtitle: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-studio-detail-badge">Badge</Label>
                <Input
                  id="org-studio-detail-badge"
                  data-testid="org-studio-detail-badge"
                  value={draft.badge}
                  onChange={(event) => setDraft((d) => ({ ...d, badge: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-studio-detail-accent">Accent</Label>
                <Select
                  value={draft.accent ?? 'none'}
                  onValueChange={(value) =>
                    setDraft((d) => ({
                      ...d,
                      accent: value === 'none' ? null : (value as OrgStudioAccent),
                    }))
                  }
                >
                  <SelectTrigger id="org-studio-detail-accent" data-testid="org-studio-detail-accent">
                    <SelectValue placeholder="Tanpa accent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa accent</SelectItem>
                    {ACCENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm" data-testid="org-studio-detail-save">
                  Simpan
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Tutup
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  title="Dialog pindah tersedia di 011-03"
                  data-testid="org-studio-detail-move"
                >
                  Pindah…
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled
                  title={isRoot ? 'Root tidak dapat dihapus' : 'Dialog hapus tersedia di 011-03'}
                  data-testid="org-studio-detail-delete"
                >
                  Hapus
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Dialog pindah/hapus hadir di 011-03; tombol pindah/hapus dinonaktifkan untuk sekarang.
              </p>
            </form>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------

export function OrgChartStudio({
  data,
  onChange,
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  highlightedIds = [],
  loading = false,
  error,
  onSelect,
  emptyActionLabel = 'Buat root',
  onEmptyAction,
  minimap = true,
  ariaLabel = 'Org chart studio',
  className,
}: OrgChartStudioProps) {
  // State deklaratif 011-02 (FR-013, D8): data internal ditegakkan dari prop
  // `data` dan dimutasi lewat satu commit point yang selalu memanggil
  // `onChange(next)` tepat sekali + push undo. Kontrol penuh (data+onChange)
  // tetap dipegang konsumen; komponen hanya memantulkan.
  const [internalFlat, setInternalFlat] = React.useState<OrgStudioNodeFlat[]>(() => toFlatInput(data));
  React.useEffect(() => {
    setInternalFlat(toFlatInput(data));
  }, [data]);
  // Semantik mengikuti OrgChartEditor: defaultExpandedIds = set id yang
  // awalnya COLLAPSED; default (kosong) = semua induk ter-expand.
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() => {
    const flat = Array.isArray(data) ? data : flattenNested(data);
    const parents = new Set(flat.filter((node) => node.parentId !== null).map((node) => node.parentId as string));
    return [...parents].filter((id) => !(defaultExpandedIds ?? []).includes(id));
  });
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [errorCopied, setErrorCopied] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  // 011-02: node pending inline-edit, sorotan node baru, panel detail, fokus.
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [newNodeId, setNewNodeId] = React.useState<string | null>(null);
  const [panelNodeId, setPanelNodeId] = React.useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = React.useState<string | null>(null);
  // History undo disimpan di ref (bukan state) agar callback toast yang dibuat
  // saat commit selalu membaca snapshot terbaru, bukan closure lama.
  const pastRef = React.useRef<OrgStudioNodeFlat[][]>([]);
  const pendingIdsRef = React.useRef<Set<string>>(new Set());
  const counterRef = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  // Callback konsumen disimpan di ref agar handler internal stabil: identitas
  // flowNodes tidak berubah tiap render hanya karena parent membuat arrow
  // function baru (loop store xyflow/MiniMap bila tidak stabil).
  const onChangeRef = React.useRef(onChange);
  const onSelectRef = React.useRef(onSelect);
  const onExpandedChangeRef = React.useRef(onExpandedChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  React.useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  React.useEffect(() => {
    onExpandedChangeRef.current = onExpandedChange;
  }, [onExpandedChange]);
  const emitChange = React.useCallback((next: OrgStudioNodeFlat[]) => {
    onChangeRef.current?.(next);
  }, []);

  const normalized = React.useMemo(() => normalizeStudioInput(internalFlat), [internalFlat]);

  const controlledExpanded = expandedIds !== undefined;
  const expandedSet = React.useMemo(
    () => new Set(controlledExpanded ? expandedIds : internalExpanded),
    [controlledExpanded, expandedIds, internalExpanded],
  );

  const toggleExpanded = React.useCallback(
    (id: string) => {
      const next = new Set(expandedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const nextIds = [...next];
      if (!controlledExpanded) setInternalExpanded(nextIds);
      onExpandedChangeRef.current?.(nextIds);
    },
    [controlledExpanded, expandedSet],
  );

  // Node tanpa keturunan selalu "expanded"; hanya induk yang bisa collapse.
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

  const highlightedSet = React.useMemo(() => new Set(highlightedIds), [highlightedIds]);

  // ---- 011-02: tambah 1-klik + panel detail + commit sekali (FR-005/006/013) ----
  const undo = React.useCallback(() => {
    const snapshot = pastRef.current[pastRef.current.length - 1];
    if (!snapshot) return;
    pastRef.current = pastRef.current.slice(0, -1);
    setInternalFlat(snapshot);
    emitChange(snapshot);
    setEditingId(null);
    setNewNodeId(null);
  }, [emitChange]);

  const commitWithUndo = React.useCallback(
    (snapshot: OrgStudioNodeFlat[], next: OrgStudioNodeFlat[], toastTitle: string) => {
      pastRef.current = [...pastRef.current.slice(-49), snapshot];
      setInternalFlat(next);
      emitChange(next);
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
    [emitChange, undo],
  );

  const ensureExpanded = React.useCallback(
    (parentId: string | null) => {
      if (!parentId || expandedSet.has(parentId)) return;
      const nextIds = [...expandedSet, parentId];
      if (!controlledExpanded) setInternalExpanded(nextIds);
      onExpandedChangeRef.current?.(nextIds);
    },
    [controlledExpanded, expandedSet],
  );

  const spawnPending = React.useCallback(
    (parentId: string) => {
      // Satu pending pada satu waktu: pending lama yang belum di-commit dibuang.
      const staleIds = [...pendingIdsRef.current];
      counterRef.current += 1;
      let candidate = `studio-baru-${counterRef.current}`;
      while (internalFlat.some((node) => node.id === candidate)) {
        counterRef.current += 1;
        candidate = `studio-baru-${counterRef.current}`;
      }
      pendingIdsRef.current = new Set([candidate]);
      setInternalFlat((prevFlat) => [
        ...prevFlat.filter((node) => !staleIds.includes(node.id)),
        { id: candidate, parentId, title: '' },
      ]);
      ensureExpanded(parentId);
      setSelectedId(candidate);
      setNewNodeId(null);
      setEditingId(candidate);
    },
    [ensureExpanded, internalFlat],
  );

  const handleCommitInline = React.useCallback(
    (nodeId: string, title: string) => {
      const isPending = pendingIdsRef.current.has(nodeId);
      // Snapshot undo = flat TANPA node pending, agar toast "Urungkan"
      // menghapus node yang baru ditambah.
      const snapshot = isPending ? internalFlat.filter((node) => node.id !== nodeId) : internalFlat;
      const next = internalFlat.map((node) => (node.id === nodeId ? { ...node, title } : node));
      pendingIdsRef.current.delete(nodeId);
      setEditingId(null);
      setNewNodeId(nodeId);
      commitWithUndo(snapshot, next, 'Ditambah');
      setFocusNodeId(nodeId);
    },
    [commitWithUndo, internalFlat],
  );

  const handleCancelInline = React.useCallback(
    (nodeId: string) => {
      const isPending = pendingIdsRef.current.has(nodeId);
      const parentId = internalFlat.find((node) => node.id === nodeId)?.parentId ?? null;
      if (isPending) {
        pendingIdsRef.current.delete(nodeId);
        // Node pending belum pernah di-commit via onChange → buang lokal saja.
        setInternalFlat((prevFlat) => prevFlat.filter((node) => node.id !== nodeId));
      }
      setEditingId(null);
      if (parentId) setFocusNodeId(parentId);
    },
    [internalFlat],
  );

  const openDetail = React.useCallback((node: OrgStudioNodeNormalized) => {
    setSelectedId(node.id);
    onSelectRef.current?.(node);
    setPanelNodeId(node.id);
  }, []);

  const handlePanelSave = React.useCallback(
    (nodeId: string, draft: StudioDetailDraft) => {
      const next = internalFlat.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              title: draft.title.trim(),
              subtitle: draft.subtitle.trim() ? draft.subtitle.trim() : undefined,
              badge: draft.badge.trim() ? draft.badge.trim() : undefined,
              accent: draft.accent ?? undefined,
            }
          : node,
      );
      commitWithUndo(internalFlat, next, 'Diperbarui');
    },
    [commitWithUndo, internalFlat],
  );

  const handleSelectNode = React.useCallback((node: OrgStudioNodeNormalized) => {
    setSelectedId(node.id);
    onSelectRef.current?.(node);
  }, []);

  const flowNodes = React.useMemo(
    () =>
      toStudioFlowNodes(
        normalized,
        computeStudioPositions(normalized, visibleIds),
        expandedSet,
        highlightedSet,
        selectedId,
        editingId,
        newNodeId,
        // eslint-disable-next-line react-hooks/refs -- handler stabil; ref hanya dibaca di event handler, bukan saat render
        {
          onToggle: toggleExpanded,
          onSelectNode: handleSelectNode,
          onAddChild: spawnPending,
          onAddSibling: (nodeId) => {
            const node = normalized.byId.get(nodeId);
            if (node?.parentId) spawnPending(node.parentId);
          },
          onOpenDetail: openDetail,
          onCommitInline: handleCommitInline,
          onCancelInline: handleCancelInline,
        },
      ),
    [
      expandedSet,
      highlightedSet,
      normalized,
      selectedId,
      editingId,
      newNodeId,
      toggleExpanded,
      visibleIds,
      spawnPending,
      openDetail,
      handleCommitInline,
      handleCancelInline,
      handleSelectNode,
    ],
  );

  const panelNode = panelNodeId ? (normalized.byId.get(panelNodeId) ?? null) : null;
  const panelParentTitle = panelNode?.parentId ? (normalized.byId.get(panelNode.parentId)?.title ?? null) : null;
  const panelChildTitles = panelNode ? panelNode.childIds.map((id) => normalized.byId.get(id)?.title ?? id) : [];
  const panelPathTitles = panelNode
    ? [...getAncestors(internalFlat, panelNode.id).map((id) => normalized.byId.get(id)?.title ?? id), panelNode.title]
    : [];

  // Fokus kartu target (setelah commit/Esc kembali ke parent).
  React.useEffect(() => {
    if (!focusNodeId || !rootRef.current) return;
    const target = Array.from(rootRef.current.querySelectorAll('[data-node-id]')).find(
      (el) => el.getAttribute('data-node-id') === focusNodeId,
    );
    if (target instanceof HTMLElement) target.focus();
    setFocusNodeId(null);
  }, [focusNodeId, flowNodes]);
  const flowEdges = React.useMemo(() => toStudioFlowEdges(normalized, visibleIds), [normalized, visibleIds]);

  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label={`${ariaLabel} loading`}
        className={cn(
          'relative flex min-h-[320px] w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-md border border-border bg-background p-8 md:min-h-[480px]',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-4" aria-hidden="true">
          <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
          <div className="h-8 w-px bg-border" />
          <div className="flex gap-4">
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
          </div>
          <div className="flex gap-4">
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
            <Skeleton data-testid="org-studio-skeleton-box" className="h-[84px] w-[240px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || normalized.error !== null) {
    const message = error ?? normalized.error?.message ?? 'Data organisasi tidak valid.';
    const nodeId = normalized.error?.nodeId;
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
    return (
      <div className={cn('w-full', className)}>
        <EmptyState
          role="status"
          title="Belum ada data organisasi"
          description="Sediakan data flat (id/parentId) atau nested (children) dengan tepat satu root."
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div
      role="application"
      aria-label={ariaLabel}
      tabIndex={0}
      ref={rootRef}
      className={cn(
        'w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <ReactFlowProvider>
        <StudioCanvasInner
          nodes={flowNodes}
          edges={flowEdges}
          ariaLabel={ariaLabel}
          minimap={minimap}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </ReactFlowProvider>
      <StudioDetailPanel
        key={panelNode?.id ?? 'closed'}
        node={panelNode}
        open={panelNode !== null}
        onOpenChange={(open) => {
          if (!open) setPanelNodeId(null);
        }}
        parentTitle={panelParentTitle}
        childTitles={panelChildTitles}
        pathTitles={panelPathTitles}
        onSave={handlePanelSave}
      />
    </div>
  );
}

function StudioCanvasInner({
  nodes,
  edges,
  ariaLabel,
  minimap,
  zoomLevel,
  setZoomLevel,
}: {
  nodes: StudioFlowNode[];
  edges: StudioFlowEdge[];
  ariaLabel: string;
  minimap: boolean;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
}) {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  const keyboardZoom = React.useCallback(
    (action: 'in' | 'out' | 'reset' | 'fit') => {
      if (action === 'in') void zoomIn();
      else if (action === 'out') void zoomOut();
      else if (action === 'reset') void setViewport({ x: 0, y: 0, zoom: 1 });
      else void fitView({ padding: 0.2 });
    },
    [fitView, setViewport, zoomIn, zoomOut],
  );
  return (
    <StudioCanvas
      nodes={nodes}
      edges={edges}
      ariaLabel={ariaLabel}
      minimap={minimap}
      zoomLabel={`${Math.round(zoomLevel * 100)}%`}
      keyboardZoom={keyboardZoom}
      onZoomLevel={setZoomLevel}
    />
  );
}
