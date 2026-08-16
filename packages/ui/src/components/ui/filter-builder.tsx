'use client';

import * as React from 'react';
import { X, Filter as FilterIcon, Plus, Save, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';

export type FilterOperator = 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';

export const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'is',
  neq: 'is not',
  contains: 'contains',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
  in: 'in',
};

export interface FilterFieldDefinition {
  id: string;
  label: string;
  operators?: FilterOperator[];
  options?: { value: string; label: string }[];
}

export interface FilterChip {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: string;
}

export interface SavedFilterView {
  id: string;
  name: string;
  chips: FilterChip[];
}

export interface FilterBuilderProps extends React.HTMLAttributes<HTMLDivElement> {
  fields: FilterFieldDefinition[];
  chips: FilterChip[];
  onChipsChange: (chips: FilterChip[]) => void;
  savedViews?: SavedFilterView[];
  onSaveView?: (name: string, chips: FilterChip[]) => void;
  onApplyView?: (view: SavedFilterView) => void;
  onDeleteView?: (id: string) => void;
  maxChips?: number;
  allowAdvanced?: boolean;
  storageKey?: string;
  label?: string;
}

let chipCounter = 0;
function makeId() {
  return `chip-${Date.now()}-${chipCounter++}`;
}

export const FilterBuilder = React.forwardRef<HTMLDivElement, FilterBuilderProps>(
  (
    {
      fields,
      chips,
      onChipsChange,
      savedViews = [],
      onSaveView,
      onApplyView,
      onDeleteView,
      maxChips = 10,
      storageKey,
      label = 'Filters',
      className,
      ...props
    },
    ref
  ) => {
    const [internalViews, setInternalViews] = React.useState<SavedFilterView[]>(savedViews);
    const [adding, setAdding] = React.useState(false);
    const [draftField, setDraftField] = React.useState('');
    const [draftOperator, setDraftOperator] = React.useState<FilterOperator>('contains');
    const [draftValue, setDraftValue] = React.useState('');
    const [viewName, setViewName] = React.useState('');

    const views = storageKey ? savedViews : internalViews;

    const persistViews = React.useCallback(
      (next: SavedFilterView[]) => {
        setInternalViews(next);
        if (storageKey) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // ignore
          }
        }
      },
      [storageKey]
    );

    React.useEffect(() => {
      if (!storageKey) return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) setInternalViews(JSON.parse(raw));
      } catch {
        // ignore
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    const activeField = fields.find((f) => f.id === draftField);

    const addChip = () => {
      if (!draftField || !draftValue.trim() || chips.length >= maxChips) return;
      const chip: FilterChip = {
        id: makeId(),
        fieldId: draftField,
        operator: draftOperator,
        value: draftValue.trim(),
      };
      onChipsChange([...chips, chip]);
      setDraftValue('');
      setAdding(false);
      setDraftField('');
      setDraftOperator('contains');
    };

    const removeChip = (id: string) => {
      onChipsChange(chips.filter((c) => c.id !== id));
    };

    const clearAll = () => onChipsChange([]);

    const handleSaveView = () => {
      if (!viewName.trim() || chips.length === 0) return;
      const view: SavedFilterView = {
        id: `view-${Date.now()}`,
        name: viewName.trim(),
        chips,
      };
      if (onSaveView) {
        onSaveView(view.name, view.chips);
      } else {
        persistViews([...views, view]);
      }
      setViewName('');
    };

    const handleDeleteView = (id: string) => {
      if (onDeleteView) {
        onDeleteView(id);
      } else {
        persistViews(views.filter((v) => v.id !== id));
      }
    };

    const fieldById = (id: string) => fields.find((f) => f.id === id);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            {label}
          </span>
          {chips.map((chip) => {
            const field = fieldById(chip.fieldId);
            const fieldLabel = field?.label ?? chip.fieldId;
            const opLabel = FILTER_OPERATOR_LABELS[chip.operator] ?? chip.operator;
            return (
              <Badge key={chip.id} variant="secondary" className="gap-1 pr-1 text-xs">
                <span className="font-medium">{fieldLabel}</span>
                <span className="text-muted-foreground">{opLabel}</span>
                <span>{chip.value}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.id)}
                  className="rounded-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Remove filter ${fieldLabel} ${opLabel} ${chip.value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {chips.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={clearAll}>
              Clear all
            </Button>
          )}

          {/* Add filter */}
          {adding ? (
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-muted/40 p-1.5 animate-in fade-in zoom-in-95">
              <select
                value={draftField}
                onChange={(e) => {
                  setDraftField(e.target.value);
                  const f = fields.find((x) => x.id === e.target.value);
                  if (f?.operators && !f.operators.includes(draftOperator)) {
                    setDraftOperator(f.operators[0] ?? 'contains');
                  }
                }}
                className="h-7 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Filter field"
              >
                <option value="">Field…</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              {activeField && (
                <select
                  value={draftOperator}
                  onChange={(e) => setDraftOperator(e.target.value as FilterOperator)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Filter operator"
                >
                  {(activeField.operators ?? ['eq', 'contains']).map((op) => (
                    <option key={op} value={op}>{FILTER_OPERATOR_LABELS[op]}</option>
                  ))}
                </select>
              )}
              {activeField?.options ? (
                <select
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Filter value"
                >
                  <option value="">Value…</option>
                  {activeField.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChip();
                    }
                  }}
                  placeholder="Value…"
                  className="h-7 w-28 rounded-md border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Filter value"
                />
              )}
              <Button type="button" size="sm" className="h-7 px-2 text-xs" onClick={addChip} disabled={!draftField || !draftValue.trim()}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setAdding(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setAdding(true)}
              disabled={chips.length >= maxChips}
            >
              <Plus className="h-3.5 w-3.5" />
              Add filter
            </Button>
          )}

          {/* Saved views */}
          {(views.length > 0 || onSaveView) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                  <Eye className="h-3.5 w-3.5" />
                  Views ({views.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Saved views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {views.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">No saved views yet.</p>
                ) : (
                  views.map((view) => (
                    <DropdownMenuItem
                      key={view.id}
                      onSelect={() => onApplyView?.(view)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{view.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view.id);
                        }}
                        className="rounded-sm p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Delete view ${view.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <div className="flex items-center gap-1.5 p-1.5">
                  <input
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveView();
                    }}
                    placeholder="View name…"
                    disabled={chips.length === 0}
                    className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    aria-label="Saved view name"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={!viewName.trim() || chips.length === 0}
                    onClick={handleSaveView}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }
);
FilterBuilder.displayName = 'FilterBuilder';