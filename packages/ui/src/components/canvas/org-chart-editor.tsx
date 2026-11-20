'use client';

// Fondasi kanvas editable OrgChartEditor di atas `@xyflow/react` (design D1).
// Default CSS xyflow TIDAK diimpor mentah — semua permukaan dipetakan ke token
// (design D8, FR-014): node/edge/minimap/controls memakai `card`/`border`/
// `primary` agar light & dark parity terjaga.

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
import { Skeleton } from '../base/skeleton';
import { EmptyState } from '../feedback/empty-state';
import {
  getAncestors,
  type OrgChartInput,
  type OrgChartOrientation,
  type OrgNodeFlat,
  type OrgNodeNormalized,
} from '../data-display/org-chart';

export { getAncestors };
export type { OrgChartInput, OrgChartOrientation, OrgNodeNormalized };

export type OrgChartEditorAccent = 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export type OrgChartEditorNode = OrgNodeFlat;

export interface OrgChartEditorProps {
  data: OrgChartInput;
  onChange?: (next: OrgNodeFlat[]) => void;
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  orientation?: OrgChartOrientation;
  highlightedIds?: string[];
  loading?: boolean;
  error?: string | null;
  onSelect?: (node: OrgNodeNormalized) => void;
  renderNodeExtra?: (node: OrgNodeNormalized) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export interface OrgChartEditorError {
  code: 'duplicate-id' | 'missing-parent' | 'cycle' | 'root-count';
  message: string;
  nodeId: string | null;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;
const GAP = 32;
const LEVEL_GAP = 56;
const SLOT_WIDTH = NODE_WIDTH + GAP;
const LEVEL_HEIGHT = NODE_HEIGHT + LEVEL_GAP;

interface NormalizedEditorResult {
  nodes: OrgNodeNormalized[];
  byId: Map<string, OrgNodeNormalized>;
  rootId: string | null;
  error: OrgChartEditorError | null;
  isEmpty: boolean;
}

function flattenNested(root: Exclude<OrgChartInput, OrgNodeFlat[]>): OrgNodeFlat[] {
  const flat: OrgNodeFlat[] = [];
  const walk = (node: unknown, parentId: string | null): void => {
    const record = node as { id: string; children?: unknown[] } & Record<string, unknown>;
    const { children, ...rest } = record;
    flat.push({ ...(rest as unknown as OrgNodeFlat), parentId });
    for (const child of (children ?? []) as unknown[]) {
      walk(child, record.id);
    }
  };
  walk(root as unknown, null);
  return flat;
}

function normalizeEditorInput(data: OrgChartInput): NormalizedEditorResult {
  const flat: OrgNodeFlat[] = Array.isArray(data) ? [...data] : flattenNested(data);

  if (flat.length === 0) {
    return { nodes: [], byId: new Map(), rootId: null, error: null, isEmpty: true };
  }

  const byId = new Map<string, OrgNodeFlat>();
  for (const node of flat) {
    if (byId.has(node.id)) {
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
    byId.set(node.id, node);
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
    if (node.parentId !== null && !byId.has(node.parentId)) {
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

  const nodes: OrgNodeNormalized[] = flat.map((node) => {
    const childIds = childIdsByParent.get(node.id) ?? [];
    return { ...node, depth: depthById.get(node.id) ?? 0, childIds, hasChildren: childIds.length > 0 };
  });

  return { nodes, byId: new Map(nodes.map((node) => [node.id, node])), rootId, error: null, isEmpty: false };
}

export interface EditorPosition {
  id: string;
  x: number;
  y: number;
}

export function computeEditorPositions(
  normalized: NormalizedEditorResult,
  visibleIds: Set<string>,
  orientation: OrgChartOrientation,
): EditorPosition[] {
  const positions: EditorPosition[] = [];
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
    const x = centerSlot * SLOT_WIDTH - NODE_WIDTH / 2;
    const y = node.depth * LEVEL_HEIGHT;
    positions.push(orientation === 'top-down' ? { id, x, y } : { id, x: y, y: x });
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

export type OrgFlowNodeData = {
  node: OrgNodeNormalized;
  isExpanded: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  onToggle: (id: string) => void;
  onSelectNode: ((node: OrgNodeNormalized) => void) | undefined;
  renderExtra: ((node: OrgNodeNormalized) => React.ReactNode) | undefined;
  nodeTitle: string;
};

export type OrgFlowNode = Node<OrgFlowNodeData, 'orgNode'>;
export type OrgFlowEdge = Edge;

export function toFlowNodes(
  normalized: NormalizedEditorResult,
  positions: EditorPosition[],
  expandedSet: Set<string>,
  highlightedSet: Set<string>,
  selectedId: string | null,
  handlers: {
    onToggle: OrgFlowNodeData['onToggle'];
    onSelectNode: OrgFlowNodeData['onSelectNode'];
    renderExtra: OrgFlowNodeData['renderExtra'];
    nodeTitle?: string;
  },
): OrgFlowNode[] {
  const positionById = new Map(positions.map((position) => [position.id, position]));
  return normalized.nodes
    .filter((node) => positionById.has(node.id))
    .map((node) => {
      const position = positionById.get(node.id) ?? { x: 0, y: 0 };
      return {
        id: node.id,
        type: 'orgNode',
        position: { x: position.x, y: position.y },
        data: {
          node,
          isExpanded: expandedSet.has(node.id),
          isSelected: selectedId !== null && selectedId === node.id,
          isHighlighted: highlightedSet.has(node.id),
          onToggle: handlers.onToggle,
          onSelectNode: handlers.onSelectNode,
          renderExtra: handlers.renderExtra,
          nodeTitle: handlers.nodeTitle ?? '',
        },
        selected: selectedId !== null && selectedId === node.id,
      };
    });
}

export function toFlowEdges(normalized: NormalizedEditorResult, visibleIds: Set<string>): OrgFlowEdge[] {
  const edges: OrgFlowEdge[] = [];
  for (const node of normalized.nodes) {
    if (!visibleIds.has(node.id)) continue;
    for (const childId of node.childIds) {
      if (!visibleIds.has(childId)) continue;
      edges.push({
        id: `${node.id}>${childId}`,
        source: node.id,
        target: childId,
        type: 'smoothstep',
      });
    }
  }
  return edges;
}

const ACCENT_STRIP_CLASS: Record<OrgChartEditorAccent, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

const ACCENT_BADGE_VARIANT: Record<OrgChartEditorAccent, React.ComponentProps<typeof Badge>['variant']> = {
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

function OrgEditorNode({ data }: { data: OrgFlowNodeData }) {
  const { node, isExpanded, isSelected, isHighlighted, onToggle, onSelectNode, renderExtra } = data;
  const badgeVariant = node.accent ? ACCENT_BADGE_VARIANT[node.accent as OrgChartEditorAccent] : 'secondary';
  return (
    <div
      data-testid="org-editor-node"
      data-node-id={node.id}
      data-selected={isSelected ? 'true' : undefined}
      data-highlighted={isHighlighted ? 'true' : undefined}
      title={`${node.title}${node.subtitle ? ` — ${node.subtitle}` : ''}`}
      onClick={() => onSelectNode?.(node)}
      className={cn(
        'flex h-[72px] w-[200px] items-center gap-2 rounded-md border bg-card pl-4 pr-2 text-card-foreground',
        'hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected || isHighlighted ? 'border-primary ring-2 ring-ring' : 'border-border',
      )}
    >
      {node.accent ? (
        <span
          aria-hidden="true"
          data-testid="org-editor-accent-strip"
          className={cn('absolute left-0 top-0 h-full w-[3px] rounded-l-md', ACCENT_STRIP_CLASS[node.accent as OrgChartEditorAccent])}
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
      {renderExtra ? (
        <div className="min-w-0 flex-1">{renderExtra(node)}</div>
      ) : (
        <>
          <Avatar size="sm">
            {node.avatarSrc ? <AvatarImage src={node.avatarSrc} alt="" /> : null}
            <AvatarFallback>{getInitials(node.title)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="truncate text-sm font-medium text-foreground">{node.title}</span>
            {node.subtitle ? <span className="truncate text-xs text-muted-foreground">{node.subtitle}</span> : null}
          </div>
          {node.badge ? (
            <Badge variant={badgeVariant} size="sm" className="max-w-[72px] truncate">
              {node.badge}
            </Badge>
          ) : null}
        </>
      )}
    </div>
  );
}

const nodeTypes = { orgNode: OrgEditorNode };

function EditorControls({ zoomLabel }: { zoomLabel: string }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  return (
    <div
      data-testid="org-editor-controls"
      className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-sm"
    >
      <button type="button" aria-label="Zoom out" onClick={() => void zoomOut()} className={buttonClass}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" data-testid="org-editor-zoom-level" className="min-w-12 text-center text-sm text-foreground">
        {zoomLabel}
      </span>
      <button type="button" aria-label="Zoom in" onClick={() => void zoomIn()} className={buttonClass}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Reset zoom" onClick={() => void zoomOut()} className={buttonClass}>
        <Maximize className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Fit view" onClick={() => void fitView({ padding: 0.2 })} className={buttonClass}>
        <Maximize className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function EditorCanvas({
  nodes,
  edges,
  ariaLabel,
}: {
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
  ariaLabel: string;
}) {
  const [zoomLabel, setZoomLabel] = React.useState('100%');
  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-md border border-border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
        onMove={(_event, viewport) => setZoomLabel(`${Math.round(viewport.zoom * 100)}%`)}
      >
        <MiniMap
          data-testid="org-editor-minimap"
          pannable
          zoomable
          aria-label="Minimap"
          className="!border-border !bg-card"
          maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
          nodeColor="var(--primary)"
        />
        <EditorControls zoomLabel={zoomLabel} />
      </ReactFlow>
    </div>
  );
}

export function OrgChartEditor({
  data,
  onChange,
  defaultExpandedIds = [],
  expandedIds,
  onExpandedChange,
  orientation = 'top-down',
  highlightedIds = [],
  loading = false,
  error,
  onSelect,
  renderNodeExtra,
  ariaLabel = 'Org chart editor',
  className,
}: OrgChartEditorProps) {
  void onChange;
  const normalized = React.useMemo(() => normalizeEditorInput(data), [data]);

  const parentIds = React.useMemo(
    () => normalized.nodes.filter((node) => node.hasChildren).map((node) => node.id),
    [normalized],
  );
  const parentIdsKey = parentIds.join('|');

  const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>(() =>
    parentIds.filter((id) => !defaultExpandedIds.includes(id)),
  );
  const isControlled = expandedIds !== undefined;
  const effectiveExpandedIds = isControlled ? expandedIds : internalExpandedIds;

  React.useEffect(() => {
    if (isControlled) return;
    setInternalExpandedIds((current) => {
      const valid = current.filter((id) => parentIds.includes(id));
      const missing = parentIds.filter((id) => !valid.includes(id) && !defaultExpandedIds.includes(id));
      return [...valid, ...missing];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentIdsKey]);

  const expandedSet = React.useMemo(() => new Set(effectiveExpandedIds), [effectiveExpandedIds]);

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const nextIds = parentIds.filter((parentId) => next.has(parentId));
    if (!isControlled) setInternalExpandedIds(nextIds);
    onExpandedChange?.(nextIds);
  };

  const visibleIds = React.useMemo(() => {
    const visible = new Set<string>();
    if (normalized.rootId === null || normalized.error !== null) return visible;
    const walk = (id: string): void => {
      visible.add(id);
      if (!expandedSet.has(id)) return;
      for (const childId of normalized.byId.get(id)?.childIds ?? []) walk(childId);
    };
    walk(normalized.rootId);
    return visible;
  }, [normalized, expandedSet]);

  const positions = React.useMemo(
    () => computeEditorPositions(normalized, visibleIds, orientation),
    [normalized, visibleIds, orientation],
  );

  const highlightedSet = React.useMemo(() => new Set(highlightedIds), [highlightedIds]);

  const flowNodes = React.useMemo(
    () =>
      toFlowNodes(normalized, positions, expandedSet, highlightedSet, null, {
        onToggle: toggleExpanded,
        onSelectNode: onSelect,
        renderExtra: renderNodeExtra,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalized, positions, expandedSet, highlightedSet, onSelect, renderNodeExtra],
  );

  const flowEdges = React.useMemo(() => toFlowEdges(normalized, visibleIds), [normalized, visibleIds]);

  const onCanvasKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      document.querySelector<HTMLButtonElement>('[aria-label="Fit view"]')?.click();
    }
  };

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
          <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
          <div className="h-8 w-px bg-border" />
          <div className="flex gap-4">
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
          </div>
          <div className="flex gap-4">
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
            <Skeleton data-testid="org-editor-skeleton-box" className="h-[72px] w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (normalized.error !== null) {
    return (
      <div role="alert" className={cn('rounded-md border border-border bg-card p-4 text-sm text-foreground', className)}>
        <p>{normalized.error.message}</p>
        {normalized.error.nodeId ? (
          <p className="mt-1 text-muted-foreground">Node terkait: &quot;{normalized.error.nodeId}&quot;</p>
        ) : null}
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
        />
      </div>
    );
  }

  const canvas = (
    <div
      role="application"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onCanvasKeyDown}
      className={cn(
        'w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <ReactFlowProvider>
        <EditorCanvas nodes={flowNodes} edges={flowEdges} ariaLabel={ariaLabel} />
      </ReactFlowProvider>
    </div>
  );

  if (error) {
    return (
      <div className="w-full space-y-2">
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground">
          {error}
        </div>
        {canvas}
      </div>
    );
  }

  return canvas;
}
