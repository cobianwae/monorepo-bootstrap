'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TreeNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  expanded?: boolean;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  nodes: TreeNode[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  size?: 'sm' | 'default' | 'lg';
}

const SIZE_CLASS = {
  sm: 'py-1 text-xs',
  default: 'py-1.5 text-sm',
  lg: 'py-2 text-base',
} as const;

export const TreeView = React.forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      nodes,
      defaultExpandedIds = [],
      expandedIds,
      onExpandedChange,
      selectedId,
      onSelect,
      ariaLabel = 'Tree navigation',
      size = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
      () => new Set(defaultExpandedIds)
    );
    const isControlled = expandedIds !== undefined;
    const expanded = React.useMemo(
      () => (isControlled ? new Set(expandedIds) : internalExpanded),
      [isControlled, expandedIds, internalExpanded]
    );

    const setExpanded = (ids: Set<string>) => {
      if (isControlled) {
        onExpandedChange?.([...ids]);
      } else {
        setInternalExpanded(ids);
      }
    };

    const toggle = (id: string) => {
      const next = new Set(expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setExpanded(next);
    };

    // Flat map of node id -> depth for keyboard navigation
    const flatNodes = React.useMemo(() => {
      const result: { id: string; depth: number }[] = [];
      const walk = (list: TreeNode[], depth: number) => {
        for (const node of list) {
          result.push({ id: node.id, depth });
          if (node.children && expanded.has(node.id)) {
            walk(node.children, depth + 1);
          }
        }
      };
      walk(nodes, 0);
      return result;
    }, [nodes, expanded]);

    const nodeMap = React.useMemo(() => {
      const map = new Map<string, TreeNode>();
      const walk = (list: TreeNode[]) => {
        for (const node of list) {
          map.set(node.id, node);
          if (node.children) walk(node.children);
        }
      };
      walk(nodes);
      return map;
    }, [nodes]);

    const containerRef = React.useRef<HTMLDivElement>(null);

    const focusNode = (id: string) => {
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-tree-node-id="${id}"]`
      );
      el?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent, id: string) => {
      const idx = flatNodes.findIndex((n) => n.id === id);
      if (idx === -1) return;
      const node = nodeMap.get(id);
      const hasChildren = Boolean(node?.children?.length);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusNode(flatNodes[Math.min(idx + 1, flatNodes.length - 1)].id);
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusNode(flatNodes[Math.max(idx - 1, 0)].id);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (hasChildren && !expanded.has(id)) {
            toggle(id);
          } else if (hasChildren && expanded.has(id)) {
            const firstChild = node?.children?.[0];
            if (firstChild) focusNode(firstChild.id);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (hasChildren && expanded.has(id)) {
            toggle(id);
          } else if (idx > 0) {
            // Focus parent (previous node at lower depth)
            const depth = flatNodes[idx].depth;
            for (let i = idx - 1; i >= 0; i--) {
              if (flatNodes[i].depth < depth) {
                focusNode(flatNodes[i].id);
                break;
              }
            }
          }
          break;
        case 'Home':
          e.preventDefault();
          focusNode(flatNodes[0].id);
          break;
        case 'End':
          e.preventDefault();
          focusNode(flatNodes[flatNodes.length - 1].id);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (hasChildren) toggle(id);
          else onSelect?.(id);
          break;
      }
    };

    const renderNode = (node: TreeNode, depth: number) => {
      const hasChildren = Boolean(node.children?.length);
      const isExpanded = expanded.has(node.id);
      const isSelected = selectedId === node.id;
      const Icon = node.icon ?? (hasChildren ? (isExpanded ? FolderOpen : Folder) : File);

      return (
        <div key={node.id}>
          <div
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
            aria-level={depth + 1}
            aria-disabled={node.disabled}
            data-tree-node-id={node.id}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => {
              if (node.disabled) return;
              if (hasChildren) {
                toggle(node.id);
                onSelect?.(node.id);
              } else {
                onSelect?.(node.id);
              }
            }}
            onKeyDown={(e) => onKeyDown(e, node.id)}
            className={cn(
              'flex cursor-default select-none items-center gap-1.5 rounded-md pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring',
              SIZE_CLASS[size],
              node.disabled && 'opacity-50 cursor-not-allowed',
              isSelected
                ? 'bg-primary/10 text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <span
              role="button"
              tabIndex={-1}
              aria-hidden="false"
              aria-label={hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : undefined}
              onClick={(e) => {
                if (!hasChildren) return;
                e.stopPropagation();
                toggle(node.id);
              }}
              className="flex h-4 w-4 shrink-0 items-center justify-center"
            >
              {hasChildren && (
                <ChevronRight
                  className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')}
                />
              )}
            </span>
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <span className="truncate">{node.label}</span>
          </div>
          {hasChildren && isExpanded && (
            <div role="group">{node.children!.map((child) => renderNode(child, depth + 1))}</div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        role="tree"
        aria-label={ariaLabel}
        className={cn('overflow-auto rounded-md border border-border bg-card p-2', className)}
        {...props}
      >
        {nodes.map((node) => renderNode(node, 0))}
      </div>
    );
  }
);
TreeView.displayName = 'TreeView';