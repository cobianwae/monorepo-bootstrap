'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../base/avatar';
import { Badge } from '../base/badge';

export type OrgChartAccent = 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface OrgNodeFlat {
  id: string;
  parentId: string | null;
  title: string;
  subtitle?: string;
  badge?: string;
  avatarSrc?: string;
  accent?: OrgChartAccent;
  disabled?: boolean;
}

export interface OrgNodeNested extends Omit<OrgNodeFlat, 'parentId'> {
  children?: OrgNodeNested[];
}

export type OrgChartInput = OrgNodeFlat[] | OrgNodeNested;

export interface OrgNodeNormalized extends OrgNodeFlat {
  depth: number;
  childIds: string[];
  hasChildren: boolean;
}

export type OrgChartOrientation = 'top-down' | 'left-right';

export interface OrgChartProps {
  data: OrgChartInput;
  orientation?: OrgChartOrientation;
  defaultCollapsedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null;
  highlightedIds?: string[];
  loading?: boolean;
  error?: string | null;
  zoomRange?: { min?: number; max?: number; step?: number };
  renderNode?: (node: OrgNodeNormalized) => React.ReactNode;
  onSelect?: (node: OrgNodeNormalized) => void;
  ariaLabel?: string;
  className?: string;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;
const GAP = 32;
const LEVEL_GAP = 56;
const SLOT_WIDTH = NODE_WIDTH + GAP;
const LEVEL_HEIGHT = NODE_HEIGHT + LEVEL_GAP;

export interface OrgChartError {
  code: 'duplicate-id' | 'missing-parent' | 'cycle' | 'root-count';
  message: string;
  nodeId: string | null;
}

interface NormalizedResult {
  nodes: OrgNodeNormalized[];
  byId: Map<string, OrgNodeNormalized>;
  rootId: string | null;
  error: OrgChartError | null;
}

function flattenNested(root: OrgNodeNested): OrgNodeFlat[] {
  const flat: OrgNodeFlat[] = [];
  const walk = (node: OrgNodeNested, parentId: string | null): void => {
    const { children, ...rest } = node;
    flat.push({ ...rest, parentId });
    for (const child of children ?? []) {
      walk(child, node.id);
    }
  };
  walk(root, null);
  return flat;
}

function normalizeInput(data: OrgChartInput): NormalizedResult {
  const flat: OrgNodeFlat[] = Array.isArray(data) ? [...data] : flattenNested(data);

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
    if (unreachable) {
      cycleId = unreachable.id;
    }
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
    };
  }

  const nodes: OrgNodeNormalized[] = flat.map((node) => {
    const childIds = childIdsByParent.get(node.id) ?? [];
    return {
      ...node,
      depth: depthById.get(node.id) ?? 0,
      childIds,
      hasChildren: childIds.length > 0,
    };
  });
  const normalizedById = new Map(nodes.map((node) => [node.id, node]));

  return { nodes, byId: normalizedById, rootId, error: null };
}

interface OrgNodePosition {
  id: string;
  x: number;
  y: number;
}

interface LayoutResult {
  positions: OrgNodePosition[];
  width: number;
  height: number;
}

function computeLayout(
  result: NormalizedResult,
  visibleIds: Set<string>,
  orientation: OrgChartOrientation,
): LayoutResult {
  const positions: OrgNodePosition[] = [];
  if (result.rootId === null || result.error !== null) {
    return { positions, width: 0, height: 0 };
  }

  const slotWidths = new Map<string, number>();
  const computeWidth = (id: string): number => {
    const cached = slotWidths.get(id);
    if (cached !== undefined) return cached;
    const node = result.byId.get(id);
    const visibleChildren = (node?.childIds ?? []).filter((childId) => visibleIds.has(childId));
    const width =
      visibleChildren.length === 0
        ? 1
        : Math.max(1, visibleChildren.reduce((sum, childId) => sum + computeWidth(childId), 0));
    slotWidths.set(id, width);
    return width;
  };
  computeWidth(result.rootId);

  const place = (id: string, leftSlot: number): void => {
    const node = result.byId.get(id);
    if (!node) return;
    const width = slotWidths.get(id) ?? 1;
    const centerSlot = leftSlot + width / 2;
    const x = centerSlot * SLOT_WIDTH - NODE_WIDTH / 2;
    const y = node.depth * LEVEL_HEIGHT;
    positions.push(
      orientation === 'top-down' ? { id, x, y } : { id, x: y, y: x },
    );
    let cursor = leftSlot;
    for (const childId of node.childIds) {
      if (!visibleIds.has(childId)) continue;
      place(childId, cursor);
      cursor += slotWidths.get(childId) ?? 1;
    }
  };
  place(result.rootId, 0);

  const totalSlots = slotWidths.get(result.rootId) ?? 1;
  const maxDepth = Math.max(0, ...result.nodes.filter((node) => visibleIds.has(node.id)).map((node) => node.depth));
  const along = totalSlots * SLOT_WIDTH - GAP;
  const across = (maxDepth + 1) * LEVEL_HEIGHT - LEVEL_GAP;

  return orientation === 'top-down'
    ? { positions, width: along, height: across }
    : { positions, width: across, height: along };
}

function buildConnectorPaths(
  result: NormalizedResult,
  positionById: Map<string, OrgNodePosition>,
  orientation: OrgChartOrientation,
): string[] {
  const paths: string[] = [];
  for (const node of result.nodes) {
    const visibleChildren = node.childIds.filter((childId) => positionById.has(childId));
    if (visibleChildren.length === 0) continue;
    const parent = positionById.get(node.id);
    if (!parent) continue;

    if (orientation === 'top-down') {
      const startX = parent.x + NODE_WIDTH / 2;
      const startY = parent.y + NODE_HEIGHT;
      const busY = startY + LEVEL_GAP / 2;
      const segments = [`M ${startX} ${startY} V ${busY}`];
      for (const childId of visibleChildren) {
        const child = positionById.get(childId);
        if (!child) continue;
        const endX = child.x + NODE_WIDTH / 2;
        segments.push(`M ${startX} ${busY} H ${endX} V ${child.y}`);
      }
      paths.push(segments.join(' '));
    } else {
      const startX = parent.x + NODE_WIDTH;
      const startY = parent.y + NODE_HEIGHT / 2;
      const busX = startX + LEVEL_GAP / 2;
      const segments = [`M ${startX} ${startY} H ${busX}`];
      for (const childId of visibleChildren) {
        const child = positionById.get(childId);
        if (!child) continue;
        const endY = child.y + NODE_HEIGHT / 2;
        segments.push(`M ${busX} ${startY} V ${endY} H ${child.x}`);
      }
      paths.push(segments.join(' '));
    }
  }
  return paths;
}

const ACCENT_STRIP_CLASS: Record<OrgChartAccent, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
};

const ACCENT_BADGE_VARIANT: Record<
  OrgChartAccent,
  React.ComponentProps<typeof Badge>['variant']
> = {
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

export function OrgChart({
  data,
  orientation = 'top-down',
  defaultCollapsedIds = [],
  expandedIds,
  onExpandedChange,
  selectedId,
  renderNode,
  onSelect,
  ariaLabel = 'Org chart',
  className,
}: OrgChartProps) {
  const normalized = React.useMemo(() => normalizeInput(data), [data]);

  const parentIds = React.useMemo(
    () => normalized.nodes.filter((node) => node.hasChildren).map((node) => node.id),
    [normalized],
  );
  const parentIdsKey = parentIds.join('|');

  // Uncontrolled: semua parent terbuka kecuali defaultCollapsedIds.
  // Controlled: expandedIds adalah daftar lengkap id yang terbuka (pola tree-view).
  const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>(() =>
    parentIds.filter((id) => !defaultCollapsedIds.includes(id)),
  );
  const isControlled = expandedIds !== undefined;
  const effectiveExpandedIds = isControlled ? expandedIds : internalExpandedIds;

  React.useEffect(() => {
    if (isControlled) return;
    setInternalExpandedIds((current) => {
      const valid = current.filter((id) => parentIds.includes(id));
      const missing = parentIds.filter(
        (id) => !valid.includes(id) && !defaultCollapsedIds.includes(id),
      );
      return [...valid, ...missing];
    });
    // parentIdsKey memicu sinkronisasi saat struktur data berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentIdsKey]);

  const expandedSet = React.useMemo(() => new Set(effectiveExpandedIds), [effectiveExpandedIds]);

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    const nextIds = parentIds.filter((parentId) => next.has(parentId));
    if (!isControlled) {
      setInternalExpandedIds(nextIds);
    }
    onExpandedChange?.(nextIds);
  };

  const visibleIds = React.useMemo(() => {
    const visible = new Set<string>();
    if (normalized.rootId === null || normalized.error !== null) return visible;
    const walk = (id: string): void => {
      visible.add(id);
      if (!expandedSet.has(id)) return;
      for (const childId of normalized.byId.get(id)?.childIds ?? []) {
        walk(childId);
      }
    };
    walk(normalized.rootId);
    return visible;
  }, [normalized, expandedSet]);

  const layout = React.useMemo(
    () => computeLayout(normalized, visibleIds, orientation),
    [normalized, visibleIds, orientation],
  );

  const positionById = React.useMemo(
    () => new Map(layout.positions.map((position) => [position.id, position])),
    [layout],
  );

  const connectorPaths = React.useMemo(
    () => buildConnectorPaths(normalized, positionById, orientation),
    [normalized, positionById, orientation],
  );

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Urutan DFS node visible — basis navigasi keyboard ↑↓/Home/End (pola tree-view).
  const dfsVisibleIds = React.useMemo(() => {
    const ids: string[] = [];
    if (normalized.rootId === null || normalized.error !== null) return ids;
    const walk = (id: string): void => {
      if (!visibleIds.has(id)) return;
      ids.push(id);
      if (!expandedSet.has(id)) return;
      for (const childId of normalized.byId.get(id)?.childIds ?? []) {
        walk(childId);
      }
    };
    walk(normalized.rootId);
    return ids;
  }, [normalized, visibleIds, expandedSet]);

  // Node disabled dilewati fokus keyboard dan roving tabindex.
  const focusableIds = React.useMemo(
    () => dfsVisibleIds.filter((id) => !normalized.byId.get(id)?.disabled),
    [dfsVisibleIds, normalized],
  );

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const effectiveActiveId =
    activeId !== null && focusableIds.includes(activeId) ? activeId : (focusableIds[0] ?? null);

  const focusNode = (id: string | null | undefined) => {
    if (!id) return;
    setActiveId(id);
    containerRef.current?.querySelector<HTMLElement>(`[data-node-id="${id}"]`)?.focus();
  };

  const onNodeKeyDown = (event: React.KeyboardEvent, node: OrgNodeNormalized) => {
    if (node.disabled) return;
    const focusIdx = focusableIds.indexOf(node.id);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNode(focusableIds[Math.min(focusIdx + 1, focusableIds.length - 1)] ?? null);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusNode(focusIdx > 0 ? focusableIds[focusIdx - 1] : (focusableIds[0] ?? null));
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (node.hasChildren && !expandedSet.has(node.id)) {
          toggleExpanded(node.id);
          setActiveId(node.id);
        } else if (node.hasChildren) {
          const firstChildId = node.childIds[0];
          if (firstChildId) focusNode(firstChildId);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (node.hasChildren && expandedSet.has(node.id)) {
          toggleExpanded(node.id);
          setActiveId(node.id);
        } else if (node.parentId) {
          focusNode(node.parentId);
        }
        break;
      case 'Home':
        event.preventDefault();
        focusNode(focusableIds[0] ?? null);
        break;
      case 'End':
        event.preventDefault();
        focusNode(focusableIds[focusableIds.length - 1] ?? null);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(node);
        break;
    }
  };

  if (normalized.error !== null) {
    return (
      <div role="alert" className={cn('rounded-md border border-border bg-card p-4 text-sm text-foreground', className)}>
        {normalized.error.message}
      </div>
    );
  }

  const visibleNodes = normalized.nodes.filter((node) => visibleIds.has(node.id));

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      style={{ width: layout.width, height: layout.height }}
      role="tree"
      aria-label={ariaLabel}
    >
      <svg
        className="absolute inset-0"
        width={layout.width}
        height={layout.height}
        aria-hidden="true"
        focusable="false"
      >
        {connectorPaths.map((d, index) => (
          <path key={index} data-testid="org-chart-connector" d={d} fill="none" stroke="var(--border)" strokeWidth={2} />
        ))}
      </svg>
      {visibleNodes.map((node) => {
        const position = positionById.get(node.id);
        if (!position) return null;
        const isSelected = selectedId != null && selectedId === node.id;
        const isExpanded = expandedSet.has(node.id);
        const badgeVariant = node.accent ? ACCENT_BADGE_VARIANT[node.accent] : 'secondary';
        const siblingIds = node.parentId
          ? (normalized.byId.get(node.parentId)?.childIds ?? [])
          : (normalized.rootId ? [normalized.rootId] : []);
        const siblingIndex = siblingIds.indexOf(node.id);
        return (
          <div
            key={node.id}
            role="treeitem"
            aria-level={node.depth + 1}
            aria-setsize={siblingIds.length}
            aria-posinset={siblingIndex + 1}
            data-testid="org-chart-node"
            data-node-id={node.id}
            data-selected={isSelected ? 'true' : undefined}
            tabIndex={node.disabled ? -1 : effectiveActiveId === node.id ? 0 : -1}
            aria-selected={isSelected}
            aria-expanded={node.hasChildren ? isExpanded : undefined}
            aria-disabled={node.disabled ? true : undefined}
            onClick={() => {
              if (node.disabled) return;
              setActiveId(node.id);
              onSelect?.(node);
            }}
            onKeyDown={(event) => onNodeKeyDown(event, node)}
            className={cn(
              'absolute flex items-center gap-2 rounded-md border bg-card pl-4 pr-2 text-card-foreground motion-safe:transition-colors',
              'hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected ? 'border-primary ring-2 ring-ring' : 'border-border',
              node.disabled && 'cursor-not-allowed opacity-50',
              !node.disabled && onSelect && 'cursor-pointer',
            )}
            style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
          >
            {node.accent ? (
              <span
                aria-hidden="true"
                data-testid="org-chart-accent-strip"
                className={cn('absolute left-0 top-0 h-full w-[3px] rounded-l-md', ACCENT_STRIP_CLASS[node.accent])}
              />
            ) : null}
            {node.hasChildren ? (
              <button
                type="button"
                disabled={node.disabled}
                aria-label={isExpanded ? `Collapse ${node.title}` : `Perluas ${node.title}`}
                aria-expanded={isExpanded}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(node.id);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground motion-safe:transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 motion-safe:transition-transform" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4 motion-safe:transition-transform" aria-hidden="true" />
                )}
              </button>
            ) : null}
            {renderNode ? (
              <div className="min-w-0 flex-1">{renderNode(node)}</div>
            ) : (
              <>
                <Avatar size="sm">
                  {node.avatarSrc ? <AvatarImage src={node.avatarSrc} alt="" /> : null}
                  <AvatarFallback>{getInitials(node.title)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="truncate text-sm font-medium text-foreground">{node.title}</span>
                  {node.subtitle ? (
                    <span className="truncate text-xs text-muted-foreground">{node.subtitle}</span>
                  ) : null}
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
      })}
    </div>
  );
}
