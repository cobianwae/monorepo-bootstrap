'use client';

import * as React from 'react';
import { ChevronsRight, ChevronsLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
import { Badge } from '../base/badge';
import { Skeleton } from '../base/skeleton';
import { EmptyState } from '../feedback/empty-state';
import { Alert, AlertDescription } from '../feedback/alert';

export interface TransferItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TransferListProps {
  items: TransferItem[];
  value: string[];
  onChange: (value: string[]) => void;
  availableLabel?: string;
  selectedLabel?: string;
  availableSearchPlaceholder?: string;
  selectedSearchPlaceholder?: string;
  availableEmptyText?: string;
  selectedEmptyText?: string;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

function filterByQuery(list: TransferItem[], query: string): TransferItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((item) => item.label.toLowerCase().includes(q));
}

export function TransferList({
  items,
  value,
  onChange,
  availableLabel = 'Available',
  selectedLabel = 'Selected',
  availableSearchPlaceholder = 'Filter available...',
  selectedSearchPlaceholder = 'Filter selected...',
  availableEmptyText = 'No available items',
  selectedEmptyText = 'No selected items',
  loading = false,
  error = null,
  disabled = false,
  className,
}: TransferListProps) {
  const [availableQuery, setAvailableQuery] = React.useState('');
  const [selectedQuery, setSelectedQuery] = React.useState('');
  const [availableActive, setAvailableActive] = React.useState<string[]>([]);
  const [selectedActive, setSelectedActive] = React.useState<string[]>([]);
  const [lastAnchor, setLastAnchor] = React.useState<{ panel: 'available' | 'selected'; id: string } | null>(
    null
  );
  const availableListRef = React.useRef<HTMLUListElement>(null);
  const selectedListRef = React.useRef<HTMLUListElement>(null);

  const selectedSet = React.useMemo(() => new Set(value), [value]);
  const availableItems = React.useMemo(() => items.filter((i) => !selectedSet.has(i.id)), [items, selectedSet]);
  const selectedItems = React.useMemo(() => items.filter((i) => selectedSet.has(i.id)), [items, selectedSet]);

  const visibleAvailable = React.useMemo(
    () => filterByQuery(availableItems, availableQuery),
    [availableItems, availableQuery]
  );
  const visibleSelected = React.useMemo(
    () => filterByQuery(selectedItems, selectedQuery),
    [selectedItems, selectedQuery]
  );

  // Prune active selection when items/value change
  React.useEffect(() => {
    setAvailableActive((prev) =>
      prev.filter((id) => availableItems.some((i) => i.id === id && !i.disabled))
    );
  }, [availableItems]);
  React.useEffect(() => {
    setSelectedActive((prev) =>
      prev.filter((id) => selectedItems.some((i) => i.id === id && !i.disabled))
    );
  }, [selectedItems]);

  const focusFirstOption = (panel: 'available' | 'selected') => {
    requestAnimationFrame(() => {
      const list = panel === 'available' ? availableListRef.current : selectedListRef.current;
      const first = list?.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
      first?.focus();
    });
  };

  const moveToSelected = React.useCallback(
    (ids: string[]) => {
      if (ids.length === 0 || disabled || loading) return;
      const movable = ids.filter((id) => availableItems.some((i) => i.id === id && !i.disabled));
      if (movable.length === 0) return;
      onChange([...value, ...movable]);
      setAvailableActive([]);
      setLastAnchor(null);
      focusFirstOption('selected');
    },
    [availableItems, disabled, loading, onChange, value]
  );

  const moveToAvailable = React.useCallback(
    (ids: string[]) => {
      if (ids.length === 0 || disabled || loading) return;
      const movable = new Set(
        ids.filter((id) => selectedItems.some((i) => i.id === id && !i.disabled))
      );
      if (movable.size === 0) return;
      onChange(value.filter((id) => !movable.has(id)));
      setSelectedActive([]);
      setLastAnchor(null);
      focusFirstOption('available');
    },
    [disabled, loading, onChange, selectedItems, value]
  );

  const moveAllVisibleToSelected = () => {
    moveToSelected(visibleAvailable.filter((i) => !i.disabled).map((i) => i.id));
  };

  const moveAllVisibleToAvailable = () => {
    moveToAvailable(visibleSelected.filter((i) => !i.disabled).map((i) => i.id));
  };

  const toggleInPanel = (
    panel: 'available' | 'selected',
    visible: TransferItem[],
    id: string,
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    const item = visible.find((i) => i.id === id);
    if (!item || item.disabled || disabled || loading) return;
    const active = panel === 'available' ? availableActive : selectedActive;
    const setActive = panel === 'available' ? setAvailableActive : setSelectedActive;

    const native = event.nativeEvent as MouseEvent | KeyboardEvent;
    const withRange = 'shiftKey' in native && native.shiftKey;
    const withToggle = 'ctrlKey' in native && native.ctrlKey || 'metaKey' in native && native.metaKey;

    if (withRange && lastAnchor && lastAnchor.panel === panel) {
      const ids = visible.filter((i) => !i.disabled).map((i) => i.id);
      const anchorIdx = ids.indexOf(lastAnchor.id);
      const curIdx = ids.indexOf(id);
      if (anchorIdx !== -1 && curIdx !== -1) {
        const [from, to] = anchorIdx < curIdx ? [anchorIdx, curIdx] : [curIdx, anchorIdx];
        setActive(ids.slice(from, to + 1));
        return;
      }
    }
    if (withToggle) {
      setActive(active.includes(id) ? active.filter((a) => a !== id) : [...active, id]);
      setLastAnchor({ panel, id });
      return;
    }
    // Plain click/keyboard toggles single; keeps multi when already active via ctrl
    if (active.includes(id) && active.length === 1) {
      setActive([]);
    } else {
      setActive([id]);
    }
    setLastAnchor({ panel, id });
  };

  const handleOptionKeyDown = (
    panel: 'available' | 'selected',
    visible: TransferItem[],
    id: string,
    e: React.KeyboardEvent<HTMLLIElement>
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const enabled = visible.filter((i) => !i.disabled);
      const idx = enabled.findIndex((i) => i.id === id);
      const next = e.key === 'ArrowDown' ? enabled[idx + 1] : enabled[idx - 1];
      if (next) {
        document.querySelector<HTMLElement>(`[data-transfer-option="${next.id}"]`)?.focus();
      }
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      // Space scrolls by default — prevent; Enter activates
      e.preventDefault();
      toggleInPanel(panel, visible, id, e);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      const first = visible.find((i) => !i.disabled);
      if (first) document.querySelector<HTMLElement>(`[data-transfer-option="${first.id}"]`)?.focus();
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      const enabled = visible.filter((i) => !i.disabled);
      const last = enabled[enabled.length - 1];
      if (last) document.querySelector<HTMLElement>(`[data-transfer-option="${last.id}"]`)?.focus();
    }
  };

  const renderPanel = (
    panel: 'available' | 'selected',
    panelLabel: string,
    listId: string,
    labelId: string,
    searchId: string,
    query: string,
    setQuery: (q: string) => void,
    searchPlaceholder: string,
    all: TransferItem[],
    visible: TransferItem[],
    active: string[],
    emptyText: string,
    listRef: React.RefObject<HTMLUListElement | null>
  ) => (
    <section aria-labelledby={labelId} className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 id={labelId} className="text-sm font-medium text-foreground">
          {panelLabel}
        </h3>
        <Badge variant="secondary" aria-label={`${all.length} items in ${panelLabel}`}>
          {all.length}
        </Badge>
      </div>
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {searchPlaceholder}
        </label>
        <input
          id={searchId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          disabled={disabled || loading}
          className="w-full rounded-md border border-border bg-background py-1.5 pl-3 pr-8 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      {loading ? (
        <div className="flex flex-col gap-1.5 rounded-md border border-border p-2" aria-hidden="true">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : visible.length === 0 ? (
        <div role="status" className="rounded-md border border-dashed border-border">
          <EmptyState
            title={emptyText}
            description={query ? 'Try a different filter.' : 'Items will appear here.'}
          />
        </div>
      ) : (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          aria-multiselectable="true"
          className="flex max-h-64 min-h-32 flex-col gap-1 overflow-y-auto rounded-md border border-border bg-background p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible.map((item) => {
            const isActive = active.includes(item.id);
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={isActive}
                aria-disabled={item.disabled || undefined}
                data-transfer-option={item.id}
                data-active={isActive || undefined}
                tabIndex={item.disabled ? -1 : 0}
                onClick={(e) => toggleInPanel(panel, visible, item.id, e)}
                onDoubleClick={() => {
                  if (item.disabled || disabled || loading) return;
                  if (panel === 'available') moveToSelected([item.id]);
                  else moveToAvailable([item.id]);
                }}
                onKeyDown={(e) => handleOptionKeyDown(panel, visible, item.id, e)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted',
                  item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                    isActive ? 'border-primary-foreground bg-primary-foreground' : 'border-border bg-background'
                  )}
                >
                  {isActive && (
                    <svg viewBox="0 0 8 8" className="h-3 w-3 fill-primary" aria-hidden="true">
                      <path d="M1 4.5 3 6.5 7 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </span>
                <span className="truncate">{item.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  if (loading) {
    return (
      <div className={cn('flex flex-col gap-3', className)} aria-busy="true" aria-label="Loading transfer list">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex min-w-0 w-full flex-col items-stretch gap-2 sm:flex-row">
          {renderPanel(
            'available', availableLabel, 'transfer-available', 'transfer-available-label',
            'transfer-available-search', availableQuery, setAvailableQuery, availableSearchPlaceholder,
            availableItems, visibleAvailable, availableActive, availableEmptyText, availableListRef
          )}
          <div className="flex flex-row items-center justify-center gap-1.5 sm:flex-col" aria-hidden="true">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
          {renderPanel(
            'selected', selectedLabel, 'transfer-selected', 'transfer-selected-label',
            'transfer-selected-search', selectedQuery, setSelectedQuery, selectedSearchPlaceholder,
            selectedItems, visibleSelected, selectedActive, selectedEmptyText, selectedListRef
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex min-w-0 w-full flex-col items-stretch gap-2 sm:flex-row">
        {renderPanel(
          'available', availableLabel, 'transfer-available', 'transfer-available-label',
          'transfer-available-search', availableQuery, setAvailableQuery, availableSearchPlaceholder,
          availableItems, visibleAvailable, availableActive, availableEmptyText, availableListRef
        )}
        <div className="flex shrink-0 flex-row items-center justify-center gap-1.5 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || availableActive.length === 0}
            onClick={() => moveToSelected(availableActive)}
            aria-label={`Move ${availableActive.length} items to selected`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || visibleAvailable.filter((i) => !i.disabled).length === 0}
            onClick={moveAllVisibleToSelected}
            aria-label="Move all visible to selected"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || visibleSelected.filter((i) => !i.disabled).length === 0}
            onClick={moveAllVisibleToAvailable}
            aria-label="Move all visible to available"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || selectedActive.length === 0}
            onClick={() => moveToAvailable(selectedActive)}
            aria-label={`Move ${selectedActive.length} items to available`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {renderPanel(
          'selected', selectedLabel, 'transfer-selected', 'transfer-selected-label',
          'transfer-selected-search', selectedQuery, setSelectedQuery, selectedSearchPlaceholder,
          selectedItems, visibleSelected, selectedActive, selectedEmptyText, selectedListRef
        )}
      </div>
    </div>
  );
}
