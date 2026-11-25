'use client';

import * as React from 'react';
import { Check, ChevronDown, ChevronRight, Loader2, X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';
import { Skeleton } from '../base/skeleton';

export interface CascaderNode {
  id: string;
  parentId: string | null;
  label: string;
  isLeaf?: boolean;
  disabled?: boolean;
}

export interface CascaderProps {
  options: CascaderNode[];
  value?: string[];
  onChange?: (value: string[], selectedPath: CascaderNode[]) => void;
  loadChildren?: (parentId: string | null) => Promise<CascaderNode[]>;
  displayMode?: 'full' | 'last';
  separator?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  label?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const cascaderVariants = cva(
  'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      error: {
        true: 'border-destructive focus-visible:ring-destructive',
      },
    },
  }
);

const ROOT_KEY = '__root__';

function keyOf(parentId: string | null): string {
  return parentId ?? ROOT_KEY;
}

export function Cascader({
  options,
  value = [],
  onChange,
  loadChildren,
  displayMode = 'full',
  separator = ' / ',
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options available.',
  searchable = true,
  clearable = true,
  disabled = false,
  loading = false,
  error = null,
  label,
  className,
  triggerClassName,
  contentClassName,
}: CascaderProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [activePath, setActivePath] = React.useState<string[]>(() =>
    value.length > 1 ? value.slice(0, -1) : []
  );
  const [extraNodes, setExtraNodes] = React.useState<CascaderNode[]>([]);
  const [loadedKeys, setLoadedKeys] = React.useState<Set<string>>(new Set());
  const [loadingKeys, setLoadingKeys] = React.useState<Set<string>>(new Set());

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, CascaderNode>();
    for (const n of [...options, ...extraNodes]) {
      if (!map.has(n.id)) map.set(n.id, n);
    }
    return map;
  }, [options, extraNodes]);

  const allNodes = React.useMemo(() => [...nodeMap.values()], [nodeMap]);

  const childrenOf = React.useCallback(
    (parentId: string | null) =>
      allNodes.filter((n) => (n.parentId ?? null) === (parentId ?? null)),
    [allNodes]
  );

  const isLeafNode = React.useCallback(
    (node: CascaderNode) => {
      if (node.isLeaf === true) return true;
      if (childrenOf(node.id).length > 0) return false;
      if (node.isLeaf === false) return false;
      if (loadChildren && !loadedKeys.has(keyOf(node.id))) return false;
      return true;
    },
    [childrenOf, loadChildren, loadedKeys]
  );

  const getPathTo = React.useCallback(
    (id: string): CascaderNode[] => {
      const path: CascaderNode[] = [];
      let current: CascaderNode | undefined = nodeMap.get(id);
      const guard = new Set<string>();
      while (current && !guard.has(current.id)) {
        guard.add(current.id);
        path.unshift(current);
        if (current.parentId == null) break;
        current = nodeMap.get(current.parentId);
      }
      return path;
    },
    [nodeMap]
  );

  // Sync expanded columns when controlled value changes from outside
  React.useEffect(() => {
    if (value.length > 1) {
      setActivePath(value.slice(0, -1));
    } else if (value.length === 0) {
      setActivePath([]);
    }
  }, [value.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const ensureChildren = React.useCallback(
    async (parentId: string | null) => {
      if (!loadChildren) return;
      const k = keyOf(parentId);
      if (loadedKeys.has(k) || loadingKeys.has(k)) return;
      setLoadingKeys((prev) => new Set(prev).add(k));
      try {
        const fetched = await loadChildren(parentId);
        setExtraNodes((prev) => {
          const known = new Set(prev.map((n) => n.id));
          const next = [...prev];
          for (const n of fetched) {
            if (!nodeMap.has(n.id) && !known.has(n.id)) next.push(n);
          }
          return next;
        });
        setLoadedKeys((prev) => new Set(prev).add(k));
      } finally {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(k);
          return next;
        });
      }
    },
    [loadChildren, loadedKeys, loadingKeys, nodeMap]
  );

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (!next) setSearch('');
    if (next && loadChildren && childrenOf(null).length === 0 && !loadedKeys.has(ROOT_KEY)) {
      void ensureChildren(null);
    }
  };

  const selectPath = (pathIds: string[]) => {
    const pathNodes = pathIds
      .map((id) => nodeMap.get(id))
      .filter((n): n is CascaderNode => Boolean(n));
    onChange?.(pathIds, pathNodes);
    setOpen(false);
    setSearch('');
  };

  const handleNodeClick = (node: CascaderNode, columnIndex: number) => {
    if (node.disabled || disabled) return;
    if (isLeafNode(node)) {
      const path = [...getPathTo(node.id).map((n) => n.id)];
      // getPathTo may miss ancestors not yet loaded; fall back to activePath + node
      const fullPath =
        path.length > 0 ? path : [...activePath.slice(0, columnIndex), node.id];
      selectPath(fullPath);
    } else {
      const nextPath = [...activePath.slice(0, columnIndex), node.id];
      setActivePath(nextPath);
      void ensureChildren(node.id);
    }
  };

  const handleSearchSelect = (node: CascaderNode) => {
    const path = getPathTo(node.id).map((n) => n.id);
    const fullPath = path.length > 0 ? path : [node.id];
    setActivePath(fullPath.slice(0, -1));
    selectPath(fullPath);
  };

  const selectedLabels = value
    .map((id) => nodeMap.get(id)?.label)
    .filter((l): l is string => Boolean(l));

  const displayLabel =
    selectedLabels.length === 0
      ? null
      : displayMode === 'last'
        ? selectedLabels[selectedLabels.length - 1]
        : selectedLabels.join(separator);

  const showClear = clearable && value.length > 0 && !disabled && !loading;

  const query = search.trim().toLowerCase();
  const searchResults =
    searchable && query
      ? allNodes.filter((n) => n.label.toLowerCase().includes(query))
      : [];

  const columns: { parentId: string | null; nodes: CascaderNode[] }[] = React.useMemo(() => {
    if (searchResults.length > 0 || query) return [];
    const cols: { parentId: string | null; nodes: CascaderNode[] }[] = [
      { parentId: null, nodes: childrenOf(null) },
    ];
    for (let i = 0; i < activePath.length; i += 1) {
      const parentId = activePath[i];
      const parent = nodeMap.get(parentId);
      if (!parent || isLeafNode(parent)) break;
      cols.push({ parentId, nodes: childrenOf(parentId) });
    }
    return cols;
  }, [activePath, childrenOf, nodeMap, isLeafNode, searchResults.length, query]);

  const focusOption = (columnIndex: number, optionIndex: number) => {
    const el = document.querySelector<HTMLElement>(
      `[data-cascader-col="${columnIndex}"][data-cascader-row="${optionIndex}"]`
    );
    el?.focus();
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    node: CascaderNode,
    columnIndex: number,
    rowIndex: number,
    rowCount: number
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusOption(columnIndex, (rowIndex + 1) % rowCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusOption(columnIndex, (rowIndex - 1 + rowCount) % rowCount);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (!isLeafNode(node)) {
        handleNodeClick(node, columnIndex);
        window.setTimeout(() => focusOption(columnIndex + 1, 0), 0);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (columnIndex > 0) {
        setActivePath((prev) => prev.slice(0, columnIndex - 1));
        window.setTimeout(() => focusOption(columnIndex - 1, 0), 0);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNodeClick(node, columnIndex);
    }
  };

  const triggerId = React.useId();
  const searchId = React.useId();
  const errorId = error ? `${triggerId}-error` : undefined;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const handleClear = () => {
    onChange?.([], []);
    setActivePath([]);
    triggerRef.current?.focus();
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={triggerId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative w-full">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={label ? undefined : placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            disabled={disabled}
            className={cn(cascaderVariants({ error: !!error }), showClear && 'pr-14', triggerClassName)}
          >
            {loading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading...
              </span>
            ) : displayLabel ? (
              <span className="truncate">{displayLabel}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <span className="ml-2 flex shrink-0 items-center gap-1">
              <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
            </span>
          </button>
        </PopoverTrigger>
        {showClear && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleClear}
            className="absolute top-1/2 right-9 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <PopoverContent
          className={cn('w-auto min-w-[var(--radix-popover-trigger-width)] p-0', contentClassName)}
          align="start"
          sideOffset={4}
        >
          {searchable && (
            <div className="border-b border-border px-3 py-2">
              <label htmlFor={searchId} className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                id={searchId}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
          {query ? (
            <div className="max-h-64 overflow-y-auto p-1" role="listbox" aria-label="Search results">
              {searchResults.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
              ) : (
                searchResults.map((node) => {
                  const path = getPathTo(node.id);
                  const fullLabel =
                    path.length > 0 ? path.map((n) => n.label).join(separator) : node.label;
                  const selected = value[value.length - 1] === node.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={node.disabled}
                      onClick={() => handleSearchSelect(node)}
                      className="flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                    >
                      <span className="min-w-0 flex-1 truncate">{fullLabel}</span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex max-h-64 items-stretch overflow-x-auto" role="group" aria-label="Cascader columns">
              {columns.length === 0 || (columns.length === 1 && columns[0].nodes.length === 0 && !loadingKeys.has(ROOT_KEY)) ? (
                <p className="w-full px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
              ) : (
                columns.map((col, colIndex) => {
                  const colKey = keyOf(col.parentId);
                  const isLoadingCol = loadingKeys.has(colKey);
                  return (
                    <div
                      key={colKey}
                      role="listbox"
                      aria-label={`Level ${colIndex + 1}`}
                      className="min-w-44 flex-1 border-r border-border p-1 last:border-r-0"
                    >
                      {isLoadingCol ? (
                        <div className="flex flex-col gap-1 p-1" aria-label="Loading options">
                          {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : col.nodes.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
                      ) : (
                        col.nodes.map((node, rowIndex) => {
                          const selected = value.includes(node.id);
                          const expanded = activePath[colIndex] === node.id;
                          const leaf = isLeafNode(node);
                          return (
                            <button
                              key={node.id}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              aria-expanded={leaf ? undefined : expanded}
                              disabled={node.disabled}
                              data-cascader-col={colIndex}
                              data-cascader-row={rowIndex}
                              onClick={() => handleNodeClick(node, colIndex)}
                              onKeyDown={(e) =>
                                handleOptionKeyDown(e, node, colIndex, rowIndex, col.nodes.length)
                              }
                              className={cn(
                                'flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
                                expanded && 'bg-accent text-accent-foreground'
                              )}
                            >
                              <span className="min-w-0 flex-1 truncate">{node.label}</span>
                              {selected && leaf && (
                                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                              )}
                              {!leaf && (
                                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export { cascaderVariants };
