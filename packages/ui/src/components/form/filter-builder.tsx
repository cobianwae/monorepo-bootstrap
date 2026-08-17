'use client';

import * as React from 'react';
import { X, Filter as FilterIcon, Plus, Save, Eye, Check, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
import { Badge } from '../base/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../navigation/dropdown-menu';

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
  onUpdateView?: (id: string, chips: FilterChip[]) => void;
  activeViewId?: string;
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
      onUpdateView,
      activeViewId,
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
       
    }, [storageKey]);

    const controlled = typeof onSaveView === 'function';
    const views = controlled ? savedViews : internalViews;
    const activeField = fields.find((f) => f.id === draftField);
    const activeView = views.find((v) => v.id === activeViewId);

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

    const handleApplyView = (view: SavedFilterView) => {
      onChipsChange(view.chips);
      onApplyView?.(view);
    };

    const handleDeleteView = (id: string) => {
      if (onDeleteView) {
        onDeleteView(id);
      } else {
        persistViews(views.filter((v) => v.id !== id));
      }
    };

    const handleUpdateView = (id: string) => {
      if (!activeView || chips.length === 0) return;
      if (onUpdateView) {
        onUpdateView(id, chips);
      } else {
        persistViews(views.map((v) => (v.id === id ? { ...v, chips } : v)));
      }
    };

    const handleFieldChange = (value: string) => {
      setDraftField(value);
      const field = fields.find((f) => f.id === value);
      if (field?.operators && !field.operators.includes(draftOperator)) {
        setDraftOperator(field.operators[0] ?? 'contains');
      }
    };

    const fieldById = (id: string) => fields.find((f) => f.id === id);

    return (
      <div ref={ref} className={cn('flex-1 min-w-0', className)} {...props}>
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
              <Select value={draftField} onValueChange={handleFieldChange}>
                <SelectTrigger aria-label="Filter field" className="h-7 w-auto gap-1 rounded-md px-2 text-xs">
                  <SelectValue placeholder="Field…" />
                </SelectTrigger>
                <SelectContent align="start" className="min-w-[8rem]">
                  {fields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeField && (
                <Select value={draftOperator} onValueChange={(op) => setDraftOperator(op as FilterOperator)}>
                  <SelectTrigger aria-label="Filter operator" className="h-7 w-auto gap-1 rounded-md px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[8rem]">
                    {(activeField.operators ?? ['eq', 'contains']).map((op) => (
                      <SelectItem key={op} value={op}>{FILTER_OPERATOR_LABELS[op]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {activeField?.options ? (
                <Select value={draftValue} onValueChange={setDraftValue}>
                  <SelectTrigger aria-label="Filter value" className="h-7 w-auto gap-1 rounded-md px-2 text-xs">
                    <SelectValue placeholder="Value…" />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[8rem]">
                    {activeField.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 gap-1 px-2 text-xs whitespace-nowrap" onClick={() => setAdding(true)} disabled={chips.length >= maxChips}>
              <Plus className="h-3.5 w-3.5" />
              Add filter
            </Button>
          )}

          {/* Saved views */}
          {(views.length > 0 || onSaveView) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 gap-1 px-2 text-xs whitespace-nowrap">
                  <Eye className="h-3.5 w-3.5" />
                  {activeView ? (
                    <span className="max-w-28 truncate">{activeView.name}</span>
                  ) : (
                    <span>Views ({views.length})</span>
                  )}
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
                      onSelect={() => handleApplyView(view)}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {activeViewId === view.id && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                        <span className="truncate">{view.name}</span>
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {view.chips.length}
                      </Badge>
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
                    aria-label="Save view"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {activeView && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => handleUpdateView(activeView.id)}
                      disabled={chips.length === 0}
                      className="gap-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      Update &quot;{activeView.name}&quot;
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleDeleteView(activeView.id)}
                      className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete view
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }
);
FilterBuilder.displayName = 'FilterBuilder';