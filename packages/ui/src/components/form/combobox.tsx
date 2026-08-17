'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, X, Plus, CornerDownLeft } from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';
import { Badge } from '../base/badge';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  keywords?: string[];
  icon?: React.ReactNode;
}

export interface ComboboxBaseProps extends VariantProps<typeof comboboxVariants> {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  notFoundText?: string;
  disabled?: boolean;
  loading?: boolean;
  creatable?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  maxHeightClassName?: string;
  onSearchChange?: (value: string) => void;
  clearable?: boolean;
  label?: string;
  children?: React.ReactNode;
}

const comboboxVariants = cva(
  'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      error: {
        true: 'border-destructive focus-visible:ring-destructive',
      },
      size: {
        default: 'h-9 px-3 py-2 text-sm',
        sm: 'h-8 px-2.5 text-xs',
        lg: 'h-10 px-3.5 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface ComboboxProps extends ComboboxBaseProps {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  onCreate?: (label: string) => void;
  filterFn?: (option: ComboboxOption, search: string) => boolean;
}

function defaultFilter(option: ComboboxOption, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [option.label, option.description ?? '', ...(option.keywords ?? [])]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      multiple = false,
      placeholder = 'Select option...',
      searchPlaceholder = 'Search...',
      emptyText = 'No options available.',
      notFoundText = 'No option found.',
      disabled,
      loading = false,
      creatable = false,
      onCreate,
      filterFn = defaultFilter,
      error,
      size,
      className,
      triggerClassName,
      contentClassName,
      maxHeightClassName = 'max-h-64',
      onSearchChange,
      clearable = true,
      label,
      children,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const values = React.useMemo(() => {
      if (value === undefined || value === null) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    const selectedOptions = React.useMemo(() => {
      const map = new Map(options.map((o) => [o.value, o]));
      return values
        .map((v) => map.get(v) ?? { value: v, label: v })
        .filter((o) => o.label !== undefined);
    }, [options, values]);

    const filteredOptions = React.useMemo(() => {
      const q = search.trim().toLowerCase();
      if (loading) return [];
      return options.filter((o) => filterFn(o, q));
    }, [options, search, filterFn, loading]);

    const handleSelect = (option: ComboboxOption) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(option.value)
          ? current.filter((v) => v !== option.value)
          : [...current, option.value];
        onValueChange?.(next);
      } else {
        onValueChange?.(option.value);
        setOpen(false);
      }
      setSearch('');
    };

    const handleCreate = () => {
      const labelTrim = search.trim();
      if (!labelTrim) return;
      onCreate?.(labelTrim);
      onSearchChange?.(labelTrim);
      setSearch('');
      setOpen(false);
    };

    const removeValue = (option: ComboboxOption) => {
      if (!multiple || !Array.isArray(value)) return;
      onValueChange?.(value.filter((v) => v !== option.value));
    };

    const clearAll = () => {
      onValueChange?.(multiple ? [] : '');
    };

    const showClear =
      clearable && values.length > 0 && !disabled && !loading;

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-label={label ?? 'Combobox'}
              disabled={disabled}
              className={cn(comboboxVariants({ error, size }), triggerClassName)}
            >
              {values.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : multiple ? (
                <span className="flex flex-wrap gap-1">
                  {selectedOptions.map((o) => (
                    <Badge
                      key={o.value}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {o.label}
                      {!disabled && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValue(o);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              removeValue(o);
                            }
                          }}
                          className="rounded-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Remove ${o.label}`}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </Badge>
                  ))}
                </span>
              ) : (
                <span className="truncate">
                  {selectedOptions[0]?.label ?? placeholder}
                </span>
              )}
              <span className="ml-2 flex shrink-0 items-center gap-1">
                {showClear && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAll();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        clearAll();
                      }
                    }}
                    className="rounded-sm p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Clear selection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                )}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={cn('w-[var(--radix-popover-trigger-width)] p-0', contentClassName)}
            align="start"
            sideOffset={4}
          >
            <CommandPrimitive
              className="overflow-hidden rounded-md"
              shouldFilter={false}
              loop
            >
              <div className="flex items-center border-b border-border px-3">
                <CommandPrimitive.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={(v) => {
                    setSearch(v);
                    onSearchChange?.(v);
                  }}
                  placeholder={searchPlaceholder}
                  autoFocus
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={searchPlaceholder}
                />
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <CommandPrimitive.List className={cn('overflow-y-auto p-1', maxHeightClassName)}>
                {loading ? (
                  <CommandPrimitive.Empty>{emptyText}</CommandPrimitive.Empty>
                ) : (
                  <CommandPrimitive.Empty>
                    <span className="text-muted-foreground">
                      {filteredOptions.length === 0 && options.length > 0
                        ? notFoundText
                        : emptyText}
                    </span>
                    {creatable && search.trim() && (
                      <button
                        type="button"
                        onClick={handleCreate}
                        className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        Create “{search.trim()}”
                        <CornerDownLeft className="ml-auto h-3.5 w-3.5 opacity-70" />
                      </button>
                    )}
                  </CommandPrimitive.Empty>
                )}
                {filteredOptions.map((option) => {
                  const isSelected = values.includes(option.value);
                  return (
                    <CommandPrimitive.Item
                      key={option.value}
                      value={`${option.value}\u0000${option.label}`}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        'flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none aria-[selected=true]:bg-accent aria-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50'
                      )}
                    >
                      {option.icon && <span className="flex shrink-0">{option.icon}</span>}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.List>
            </CommandPrimitive>
          </PopoverContent>
        </Popover>
        {children}
      </div>
    );
  }
);
Combobox.displayName = 'Combobox';

export { comboboxVariants };