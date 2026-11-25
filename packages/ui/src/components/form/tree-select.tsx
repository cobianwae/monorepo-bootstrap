'use client';

import * as React from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';
import { Skeleton } from '../base/skeleton';
import { EmptyState } from '../feedback/empty-state';
import { Badge } from '../base/badge';
import { ScrollArea } from '../base/scroll-area';
import { TreeView, type TreeNode } from '../dnd/tree-view';

export interface TreeSelectNode {
  id: string;
  parentId: string | null;
  label: string;
  disabled?: boolean;
}

export interface TreeSelectProps {
  options: TreeSelectNode[];
  multiple?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[], selected: TreeSelectNode[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxTags?: number;
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

const treeSelectVariants = cva(
  'flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      error: {
        true: 'border-destructive focus-visible:ring-destructive',
      },
    },
  }
);

function toNested(options: TreeSelectNode[]): TreeNode[] {
  const childrenOf = new Map<string | null, TreeSelectNode[]>();
  for (const n of options) {
    const list = childrenOf.get(n.parentId) ?? [];
    list.push(n);
    childrenOf.set(n.parentId, list);
  }
  const build = (parentId: string | null): TreeNode[] =>
    (childrenOf.get(parentId) ?? []).map((n) => {
      const kids = build(n.id);
      return {
        id: n.id,
        label: n.label,
        disabled: n.disabled,
        ...(kids.length > 0 ? { children: kids } : {}),
      };
    });
  return build(null);
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    const kids = node.children ? filterTree(node.children, query) : [];
    if (node.label.toLowerCase().includes(query)) {
      out.push(kids.length > 0 ? { ...node, children: kids } : { ...node });
    } else if (kids.length > 0) {
      out.push({ ...node, children: kids });
    }
  }
  return out;
}

export function TreeSelect({
  options,
  multiple = false,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options available.',
  maxTags = 3,
  searchable = true,
  clearable = true,
  disabled = false,
  loading = false,
  error = null,
  label,
  className,
  triggerClassName,
  contentClassName,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, TreeSelectNode>();
    for (const n of options) {
      if (!map.has(n.id)) map.set(n.id, n);
    }
    return map;
  }, [options]);

  const selectedIds = React.useMemo<string[]>(() => {
    if (value === undefined || value === null) return [];
    const list = Array.isArray(value) ? value : [value];
    // Empty string berarti "tidak ada pilihan" (C13), bukan node valid.
    return list.filter((id): id is string => typeof id === 'string' && id.length > 0);
  }, [value]);

  const ancestorsOf = React.useCallback(
    (id: string): string[] => {
      const out: string[] = [];
      let current = nodeMap.get(id);
      const guard = new Set<string>();
      while (current?.parentId != null && !guard.has(current.id)) {
        guard.add(current.id);
        out.unshift(current.parentId);
        current = nodeMap.get(current.parentId);
      }
      return out;
    },
    [nodeMap]
  );

  const nested = React.useMemo(() => toNested(options), [options]);

  const query = search.trim().toLowerCase();
  const visibleNodes = React.useMemo(
    () => (query ? filterTree(nested, query) : nested),
    [nested, query]
  );

  // Saat popover dibuka, expand ancestors nilai terpilih agar node terlihat (FR-008).
  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (!next) {
      setSearch('');
      return;
    }
    const ids = new Set(expandedIds);
    for (const id of selectedIds) {
      for (const ancestor of ancestorsOf(id)) ids.add(ancestor);
    }
    setExpandedIds([...ids]);
  };

  const emit = (ids: string[]) => {
    const selected = ids
      .map((id) => nodeMap.get(id))
      .filter((n): n is TreeSelectNode => Boolean(n));
    onChange?.(multiple ? ids : (ids[0] ?? ''), selected);
  };

  const hasChildren = React.useCallback(
    (id: string) => options.some((n) => n.parentId === id),
    [options]
  );

  const handleSelect = (id: string) => {
    const node = nodeMap.get(id);
    if (!node || node.disabled || disabled) return;
    // Parental node hanya expand/collapse (ditangani TreeView via onExpandedChange);
    // yang mengisi nilai hanya leaf — konsisten dengan Cascader di layar yang sama.
    if (hasChildren(id)) return;
    if (multiple) {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id];
      emit(next);
    } else {
      emit([id]);
      setOpen(false);
      setSearch('');
    }
  };

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const handleClear = () => {
    if (disabled) return;
    emit([]);
    triggerRef.current?.focus();
  };

  const handleRemoveTag = (id: string) => {
    if (disabled) return;
    emit(selectedIds.filter((v) => v !== id));
    triggerRef.current?.focus();
  };

  const selectedLabels = selectedIds.map((id) => nodeMap.get(id)?.label ?? id);
  const visibleTags = selectedLabels.slice(0, maxTags);
  const hiddenCount = selectedLabels.length - visibleTags.length;

  const showClear = clearable && selectedIds.length > 0 && !disabled && !loading;

  const triggerId = React.useId();
  const searchId = React.useId();
  const errorId = error ? `${triggerId}-error` : undefined;

  const displayText = loading
    ? 'Loading...'
    : multiple
      ? selectedIds.length === 0
        ? placeholder
        : [
            visibleTags.join(', '),
            hiddenCount > 0 ? `+${hiddenCount}` : '',
          ]
            .filter(Boolean)
            .join(' ')
      : selectedIds.length === 0
        ? placeholder
        : (nodeMap.get(selectedIds[0])?.label ?? selectedIds[0]);

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={triggerId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <div
          className={cn(
            'relative min-h-9 w-full',
            treeSelectVariants({ error: Boolean(error) }),
            triggerClassName
          )}
        >
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              id={triggerId}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="tree"
              aria-label={label ? undefined : displayText}
              aria-invalid={error ? true : undefined}
              aria-describedby={errorId}
              disabled={disabled}
              className="absolute inset-0 flex w-full items-center justify-end rounded-md px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="sr-only">
                {selectedIds.length > 0 ? displayText : undefined}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                ) : showClear ? null : (
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </span>
            </button>
          </PopoverTrigger>
          <div className="pointer-events-none flex min-h-9 flex-wrap items-center gap-1 px-3 py-2 pr-12 text-sm">
            {multiple ? (
              <>
                {selectedIds.length === 0 ? (
                  <span className="text-muted-foreground">{placeholder}</span>
                ) : (
                  <>
                    {visibleTags.map((tagLabel, i) => {
                      const tagId = selectedIds[i];
                      return (
                        <Badge key={tagId} variant="secondary" className="gap-1">
                          {tagLabel}
                          <button
                            type="button"
                            aria-label={`Remove ${tagLabel}`}
                            disabled={disabled}
                            onClick={() => handleRemoveTag(tagId)}
                            className="pointer-events-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </Badge>
                      );
                    })}
                    {hiddenCount > 0 ? (
                      <Badge variant="outline">+{hiddenCount}</Badge>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <span
                className={cn(
                  'truncate text-left',
                  selectedIds.length === 0 && 'text-muted-foreground'
                )}
              >
                {selectedIds.length === 0
                  ? placeholder
                  : (nodeMap.get(selectedIds[0])?.label ?? selectedIds[0])}
              </span>
            )}
          </div>
          {showClear && (
            <button
              type="button"
              aria-label="Clear selection"
              onClick={handleClear}
              className="absolute top-1/2 right-3 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <PopoverContent
          align="start"
          sideOffset={4}
          className={cn('w-[var(--radix-popover-trigger-width)] min-w-56 p-0', contentClassName)}
        >
          <div className="flex flex-col gap-2 p-2">
            {searchable ? (
              <div className="flex flex-col gap-1.5 px-1 pt-1">
                <label htmlFor={searchId} className="sr-only">
                  {searchPlaceholder}
                </label>
                <input
                  id={searchId}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  disabled={disabled}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            ) : null}
            {loading ? (
              <div
                className="flex flex-col gap-2 p-2"
                role="status"
                aria-label="Loading options"
              >
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-11/12" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ) : visibleNodes.length === 0 ? (
              <EmptyState
                title={query ? 'No results found' : 'No data'}
                description={emptyText}
                className="border-none bg-transparent p-4"
              />
            ) : (
              <ScrollArea className="max-h-64">
                <TreeView
                  key={query ? 'filtered' : 'full'}
                  nodes={visibleNodes}
                  expandedIds={query ? undefined : expandedIds}
                  defaultExpandedIds={query ? allNodeIds(visibleNodes) : undefined}
                  onExpandedChange={query ? undefined : setExpandedIds}
                  selectedId={multiple ? selectedIds[selectedIds.length - 1] : selectedIds[0]}
                  onSelect={handleSelect}
                  ariaLabel={label ?? 'Tree select options'}
                />
              </ScrollArea>
            )}
            {multiple && selectedIds.length > 0 ? (
              <p className="flex items-center gap-1 px-2 pb-1 text-xs text-muted-foreground">
                <Check className="h-3 w-3" aria-hidden="true" />
                {selectedIds.length} selected
              </p>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function allNodeIds(nodes: TreeNode[]): string[] {
  const out: string[] = [];
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.children?.length) {
        out.push(node.id);
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return out;
}
