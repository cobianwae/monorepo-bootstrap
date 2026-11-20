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
import { Button } from '../base/button';
import { Input } from '../base/input';
import { Label } from '../base/label';
import { RadioGroup, RadioGroupItem } from '../base/radio-group';
import { Skeleton } from '../base/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../form/select';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../navigation/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../feedback/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../overlay/sheet';
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
  onAddChild?: (node: OrgNodeNormalized) => void;
  onAddSibling?: (node: OrgNodeNormalized) => void;
  onOpenInspector?: (node: OrgNodeNormalized) => void;
  onRequestDelete?: (node: OrgNodeNormalized) => void;
  renderExtra: ((node: OrgNodeNormalized) => React.ReactNode) | undefined;
  nodeTitle: string;
};

function generateNodeId(existing: Set<string>): string {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().slice(0, 8)
        : `n-${Math.random().toString(36).slice(2, 10)}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `n-${Date.now().toString(36)}`;
}

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
    onAddChild?: OrgFlowNodeData['onAddChild'];
    onAddSibling?: OrgFlowNodeData['onAddSibling'];
    onOpenInspector?: OrgFlowNodeData['onOpenInspector'];
    onRequestDelete?: OrgFlowNodeData['onRequestDelete'];
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
          onAddChild: handlers.onAddChild,
          onAddSibling: handlers.onAddSibling,
          onOpenInspector: handlers.onOpenInspector,
          onRequestDelete: handlers.onRequestDelete,
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
  const {
    node,
    isExpanded,
    isSelected,
    isHighlighted,
    onToggle,
    onSelectNode,
    onAddChild,
    onAddSibling,
    onOpenInspector,
    onRequestDelete,
    renderExtra,
  } = data;
  const badgeVariant = node.accent ? ACCENT_BADGE_VARIANT[node.accent as OrgChartEditorAccent] : 'secondary';
  const fullTitle = `${node.title}${node.subtitle ? ` — ${node.subtitle}` : ''}${node.badge ? ` (${node.badge})` : ''}`;
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
    <div
      data-testid="org-editor-node"
      data-node-id={node.id}
      data-selected={isSelected ? 'true' : undefined}
      data-highlighted={isHighlighted ? 'true' : undefined}
      title={fullTitle}
      tabIndex={0}
      onClick={() => onSelectNode?.(node)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onOpenInspector?.(node);
        }
      }}
      className={cn(
        'relative flex h-[72px] w-[200px] items-center gap-2 rounded-md border bg-card pl-4 pr-2 text-card-foreground',
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
      <button
        type="button"
        aria-label={`Tambah bawahan ${node.title}`}
        title={fullTitle}
        onClick={(event) => {
          event.stopPropagation();
          onAddChild?.(node);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onAddChild?.(node)}>Tambah bawahan</ContextMenuItem>
        <ContextMenuItem disabled={node.parentId === null} onSelect={() => onAddSibling?.(node)}>
          Tambah sibling
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onOpenInspector?.(node)}>Edit / inspector</ContextMenuItem>
        <ContextMenuItem disabled title="Pindah node tersedia di 010-03">
          Pindah…
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onToggle(node.id)}>
          {isExpanded ? 'Collapse' : 'Perluas'}
        </ContextMenuItem>
        <ContextMenuItem disabled={node.parentId === null} variant="destructive" onSelect={() => onRequestDelete?.(node)}>
          Hapus
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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
  const [internalFlat, setInternalFlat] = React.useState<OrgNodeFlat[]>(() =>
    Array.isArray(data) ? [...data] : flattenNested(data),
  );
  const dataRef = React.useRef(data);
  React.useEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data;
      setInternalFlat(Array.isArray(data) ? [...data] : flattenNested(data));
    }
  }, [data]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [inspectorMode, setInspectorMode] = React.useState<'edit' | 'add-child' | 'add-sibling'>('edit');
  const [addParentId, setAddParentId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({ title: '', subtitle: '', badge: '', avatarSrc: '', accent: '' });
  const [titleInvalid, setTitleInvalid] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [deleteMode, setDeleteMode] = React.useState<'reparent' | 'subtree'>('reparent');
  const returnFocusIdRef = React.useRef<string | null>(null);

  const commit = React.useCallback(
    (next: OrgNodeFlat[]) => {
      setInternalFlat(next);
      onChange?.(next);
    },
    [onChange],
  );

  const normalized = React.useMemo(() => normalizeEditorInput(internalFlat), [internalFlat]);
  const selectedNode = selectedId ? (normalized.byId.get(selectedId) ?? null) : null;

  const openInspectorFor = React.useCallback(
    (node: OrgNodeNormalized, mode: 'edit' | 'add-child' | 'add-sibling') => {
      setSelectedId(node.id);
      setInspectorMode(mode);
      setAddParentId(mode === 'add-child' ? node.id : mode === 'add-sibling' ? node.parentId : null);
      setDraft({
        title: mode === 'edit' ? node.title : '',
        subtitle: mode === 'edit' ? (node.subtitle ?? '') : '',
        badge: mode === 'edit' ? (node.badge ?? '') : '',
        avatarSrc: mode === 'edit' ? (node.avatarSrc ?? '') : '',
        accent: mode === 'edit' ? (node.accent ?? '') : '',
      });
      setTitleInvalid(false);
      setInspectorOpen(true);
    },
    [],
  );

  const handleSelectNode = React.useCallback(
    (node: OrgNodeNormalized) => {
      setSelectedId(node.id);
      onSelect?.(node);
    },
    [onSelect],
  );

  const handleAddChild = React.useCallback(
    (node: OrgNodeNormalized) => openInspectorFor(node, 'add-child'),
    [openInspectorFor],
  );
  const handleAddSibling = React.useCallback(
    (node: OrgNodeNormalized) => {
      if (node.parentId !== null) openInspectorFor(node, 'add-sibling');
    },
    [openInspectorFor],
  );
  const handleOpenInspector = React.useCallback(
    (node: OrgNodeNormalized) => {
      setSelectedId(node.id);
      openInspectorFor(node, 'edit');
    },
    [openInspectorFor],
  );
  const handleRequestDelete = React.useCallback((node: OrgNodeNormalized) => {
    if (node.parentId === null) return;
    setDeleteTargetId(node.id);
    setDeleteMode(node.hasChildren ? 'reparent' : 'subtree');
  }, []);

  const saveInspector = () => {
    const title = draft.title.trim();
    if (!title) {
      setTitleInvalid(true);
      return;
    }
    setTitleInvalid(false);
    if (inspectorMode === 'edit') {
      if (!selectedNode) return;
      const next = internalFlat.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              title,
              subtitle: draft.subtitle.trim() || undefined,
              badge: draft.badge.trim() || undefined,
              avatarSrc: draft.avatarSrc.trim() || undefined,
              accent: (draft.accent || undefined) as OrgChartEditorAccent | undefined,
            }
          : node,
      );
      commit(next);
      returnFocusIdRef.current = selectedNode.id;
    } else {
      const parentId = addParentId;
      if (parentId === null) return;
      const newId = generateNodeId(new Set(internalFlat.map((node) => node.id)));
      const next: OrgNodeFlat[] = [
        ...internalFlat,
        {
          id: newId,
          parentId,
          title,
          subtitle: draft.subtitle.trim() || undefined,
          badge: draft.badge.trim() || undefined,
          avatarSrc: draft.avatarSrc.trim() || undefined,
          accent: (draft.accent || undefined) as OrgChartEditorAccent | undefined,
        },
      ];
      commit(next);
      setSelectedId(newId);
      returnFocusIdRef.current = newId;
    }
    setInspectorOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    const target = normalized.byId.get(deleteTargetId);
    if (!target || target.parentId === null) return;
    let next: OrgNodeFlat[];
    if (deleteMode === 'reparent' && target.hasChildren) {
      const grandparentId = target.parentId;
      next = internalFlat
        .filter((node) => node.id !== target.id)
        .map((node) => (node.parentId === target.id ? { ...node, parentId: grandparentId } : node));
    } else {
      const toRemove = new Set<string>();
      const collect = (id: string): void => {
        toRemove.add(id);
        for (const childId of normalized.byId.get(id)?.childIds ?? []) collect(childId);
      };
      collect(target.id);
      next = internalFlat.filter((node) => !toRemove.has(node.id));
    }
    commit(next);
    setDeleteTargetId(null);
    setSelectedId(null);
    setInspectorOpen(false);
  };

  React.useEffect(() => {
    if (inspectorOpen) return;
    const focusId = returnFocusIdRef.current;
    if (!focusId) return;
    returnFocusIdRef.current = null;
    document.querySelector<HTMLElement>(`[data-node-id="${focusId}"]`)?.focus();
  }, [inspectorOpen]);

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
      toFlowNodes(normalized, positions, expandedSet, highlightedSet, selectedId, {
        onToggle: toggleExpanded,
        onSelectNode: handleSelectNode,
        onAddChild: handleAddChild,
        onAddSibling: handleAddSibling,
        onOpenInspector: handleOpenInspector,
        onRequestDelete: handleRequestDelete,
        renderExtra: renderNodeExtra,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalized, positions, expandedSet, highlightedSet, selectedId, handleSelectNode, handleAddChild, handleAddSibling, handleOpenInspector, handleRequestDelete, renderNodeExtra],
  );

  const flowEdges = React.useMemo(() => toFlowEdges(normalized, visibleIds), [normalized, visibleIds]);

  const onCanvasKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      document.querySelector<HTMLButtonElement>('[aria-label="Fit view"]')?.click();
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode) {
      event.preventDefault();
      handleRequestDelete(selectedNode);
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

  const pathTitles =
    selectedNode != null
      ? [...getAncestors(internalFlat, selectedNode.id).map((id) => normalized.byId.get(id)?.title ?? id), selectedNode.title]
      : [];
  const parentTitle = selectedNode?.parentId ? (normalized.byId.get(selectedNode.parentId)?.title ?? selectedNode.parentId) : '—';
  const deleteTarget = deleteTargetId ? (normalized.byId.get(deleteTargetId) ?? null) : null;
  const isRootSelected = selectedNode?.parentId === null;

  const editorUi = (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2" data-testid="org-editor-toolbar">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selectedNode}
          onClick={() => selectedNode && handleAddChild(selectedNode)}
        >
          Tambah bawahan
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selectedNode || selectedNode.parentId === null}
          onClick={() => selectedNode && handleAddSibling(selectedNode)}
        >
          Tambah sibling
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selectedNode}
          onClick={() => selectedNode && handleOpenInspector(selectedNode)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={!selectedNode || isRootSelected}
          title={isRootSelected ? 'Root tidak dapat dihapus' : undefined}
          onClick={() => selectedNode && handleRequestDelete(selectedNode)}
        >
          Hapus
        </Button>
        {isRootSelected ? <span className="text-sm text-muted-foreground">Root tidak dapat dihapus</span> : null}
      </div>
      {canvas}

      <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <SheetContent side="right" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>{inspectorMode === 'edit' ? selectedNode?.title : 'Tambah node baru'}</SheetTitle>
            <SheetDescription>
              {inspectorMode === 'edit'
                ? 'Ubah properti node. Semua field ditampilkan penuh tanpa truncate.'
                : `Node baru akan ditambahkan di bawah: ${addParentId ? (normalized.byId.get(addParentId)?.title ?? addParentId) : '—'}`}
            </SheetDescription>
          </SheetHeader>
          {selectedNode && inspectorMode === 'edit' ? (
            <div className="mt-4 space-y-2 text-sm text-foreground" data-testid="org-editor-inspector-meta">
              <p>
                <span className="text-muted-foreground">Path: </span>
                <span className="break-words">{pathTitles.join(' / ')}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Atasan: </span>
                {parentTitle}
              </p>
              <p>
                <span className="text-muted-foreground">Anak: </span>
                {selectedNode.childIds.length > 0
                  ? selectedNode.childIds.map((id) => normalized.byId.get(id)?.title ?? id).join(', ')
                  : '—'}
              </p>
            </div>
          ) : null}
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveInspector();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="org-editor-title">Nama</Label>
              <Input
                id="org-editor-title"
                value={draft.title}
                aria-invalid={titleInvalid}
                onChange={(event) => {
                  setDraft((d) => ({ ...d, title: event.target.value }));
                  if (event.target.value.trim()) setTitleInvalid(false);
                }}
              />
              {titleInvalid ? (
                <p role="alert" className="text-sm text-destructive">Nama tidak boleh kosong.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-editor-subtitle">Subtitle</Label>
              <Input
                id="org-editor-subtitle"
                value={draft.subtitle}
                onChange={(event) => setDraft((d) => ({ ...d, subtitle: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-editor-badge">Badge</Label>
              <Input
                id="org-editor-badge"
                value={draft.badge}
                onChange={(event) => setDraft((d) => ({ ...d, badge: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-editor-avatar">Avatar URL</Label>
              <Input
                id="org-editor-avatar"
                value={draft.avatarSrc}
                onChange={(event) => setDraft((d) => ({ ...d, avatarSrc: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-editor-accent">Accent</Label>
              <Select value={draft.accent} onValueChange={(value) => setDraft((d) => ({ ...d, accent: value }))}>
                <SelectTrigger id="org-editor-accent">
                  <SelectValue placeholder="Tanpa accent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">primary</SelectItem>
                  <SelectItem value="success">success</SelectItem>
                  <SelectItem value="warning">warning</SelectItem>
                  <SelectItem value="info">info</SelectItem>
                  <SelectItem value="destructive">destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm">Simpan</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setInspectorOpen(false)}>
                Batal
              </Button>
              {selectedNode && inspectorMode === 'edit' ? (
                <>
                  <Button type="button" variant="outline" size="sm" disabled title="Pindah node tersedia di 010-03">
                    Pindah…
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isRootSelected}
                    title={isRootSelected ? 'Root tidak dapat dihapus' : undefined}
                    onClick={() => handleRequestDelete(selectedNode)}
                  >
                    Hapus
                  </Button>
                </>
              ) : null}
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus node</DialogTitle>
            <DialogDescription>
              Hapus &quot;{deleteTarget?.title}&quot;{deleteTarget?.hasChildren ? ' beserta pilihan untuk anaknya' : ''}?
            </DialogDescription>
          </DialogHeader>
          {deleteTarget?.hasChildren ? (
            <RadioGroup value={deleteMode} onValueChange={(value) => setDeleteMode(value as 'reparent' | 'subtree')}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="reparent" id="org-delete-reparent" />
                <Label htmlFor="org-delete-reparent">Pindahkan anak ke atasan ({parentTitle})</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="subtree" id="org-delete-subtree" />
                <Label htmlFor="org-delete-subtree">Hapus subtree (node beserta semua anak)</Label>
              </div>
            </RadioGroup>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTargetId(null)}>Batal</Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (error) {
    return (
      <div className="w-full space-y-2">
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground">
          {error}
        </div>
        {editorUi}
      </div>
    );
  }

  return <div className="w-full">{editorUi}</div>;
}
