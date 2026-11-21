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
import { Skeleton } from '../base/skeleton';
import { EmptyState } from '../feedback/empty-state';

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
  onToggle: (id: string) => void;
  onSelectNode: ((node: OrgStudioNodeNormalized) => void) | undefined;
};

export type StudioFlowNode = Node<StudioNodeData, 'studioNode'>;
export type StudioFlowEdge = Edge;

export function toStudioFlowNodes(
  normalized: StudioNormalizedResult,
  positions: StudioPosition[],
  expandedSet: Set<string>,
  highlightedSet: Set<string>,
  selectedId: string | null,
  handlers: { onToggle: StudioNodeData['onToggle']; onSelectNode: StudioNodeData['onSelectNode'] },
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
          onToggle: handlers.onToggle,
          onSelectNode: handlers.onSelectNode,
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

function StudioNode({ data }: { data: StudioNodeData }) {
  const { node, isExpanded, isSelected, isHighlighted, onToggle, onSelectNode } = data;
  const badgeVariant = node.accent ? ACCENT_BADGE_VARIANT[node.accent] : 'secondary';
  const fullTitle = `${node.title}${node.subtitle ? ` — ${node.subtitle}` : ''}${node.badge ? ` (${node.badge})` : ''}`;
  return (
    <div
      data-testid="org-studio-node"
      data-node-id={node.id}
      data-selected={isSelected ? 'true' : undefined}
      data-highlighted={isHighlighted ? 'true' : undefined}
      title={fullTitle}
      tabIndex={0}
      onClick={() => onSelectNode?.(node)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onSelectNode?.(node);
        }
      }}
      className={cn(
        'relative flex h-[84px] w-[240px] items-center gap-2 rounded-md border bg-card pl-4 pr-2 text-card-foreground',
        'motion-safe:transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected || isHighlighted ? 'border-primary ring-2 ring-ring' : 'border-border',
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
      {node.hasChildren ? (
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
      <Avatar size="sm">
        {node.avatarSrc ? <AvatarImage src={node.avatarSrc} alt="" /> : null}
        <AvatarFallback>{getInitials(node.title)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <span className="truncate text-sm font-medium text-foreground" title={node.title}>
          {node.title}
        </span>
        {node.subtitle ? (
          <span className="line-clamp-2 break-words text-xs leading-4 text-muted-foreground">{node.subtitle}</span>
        ) : null}
      </div>
      {node.badge ? (
        <Badge variant={badgeVariant} size="sm" className="shrink-0">
          {node.badge}
        </Badge>
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
  // Fondasi 011-01: tanpa mutasi, `onChange` belum dipanggil. Prop tetap
  // diterima sesuai kontrak §2 agar wiring 011-02/03 tidak breaking.
  void onChange;
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

  const normalized = React.useMemo(() => normalizeStudioInput(data), [data]);

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
      onExpandedChange?.(nextIds);
    },
    [controlledExpanded, expandedSet, onExpandedChange],
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

  const flowNodes = React.useMemo(
    () =>
      toStudioFlowNodes(
        normalized,
        computeStudioPositions(normalized, visibleIds),
        expandedSet,
        highlightedSet,
        selectedId,
        {
          onToggle: toggleExpanded,
          onSelectNode: (node) => {
            setSelectedId(node.id);
            onSelect?.(node);
          },
        },
      ),
    [expandedSet, highlightedSet, normalized, onSelect, selectedId, toggleExpanded, visibleIds],
  );
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
