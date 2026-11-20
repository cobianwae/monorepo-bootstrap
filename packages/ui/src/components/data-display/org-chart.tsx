'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

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

export function OrgChart({
  data,
  orientation = 'top-down',
  defaultCollapsedIds = [],
  expandedIds,
  ariaLabel = 'Org chart',
  className,
}: OrgChartProps) {
  const collapsedIds = expandedIds !== undefined ? expandedIds : defaultCollapsedIds;
  const collapsedKey = collapsedIds.join('|');

  const normalized = React.useMemo(
    () => normalizeInput(data),
    // collapsedKey dihitung dari expandedIds/default agar memo mengikuti expanded
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, collapsedKey],
  );

  const visibleIds = React.useMemo(() => {
    const visible = new Set<string>();
    if (normalized.rootId === null || normalized.error !== null) return visible;
    const collapsed = new Set(collapsedIds);
    const walk = (id: string): void => {
      visible.add(id);
      if (collapsed.has(id)) return;
      for (const childId of normalized.byId.get(id)?.childIds ?? []) {
        walk(childId);
      }
    };
    walk(normalized.rootId);
    return visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, collapsedKey]);

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
      className={cn('relative overflow-auto', className)}
      style={{ width: layout.width, height: layout.height }}
      role="group"
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
          <path key={index} d={d} fill="none" stroke="var(--border)" strokeWidth={2} />
        ))}
      </svg>
      {visibleNodes.map((node) => {
        const position = positionById.get(node.id);
        if (!position) return null;
        return (
          <div
            key={node.id}
            data-testid="org-chart-node"
            data-node-id={node.id}
            className="absolute flex flex-col justify-center rounded-md border border-border bg-card px-3 text-card-foreground"
            style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
          >
            <span className="truncate text-sm font-medium">{node.title}</span>
            {node.subtitle ? (
              <span className="truncate text-xs text-muted-foreground">{node.subtitle}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
