'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Kbd } from '../base/kbd';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  shortcut?: string;
  sizeVariant?: 'sm' | 'default' | 'lg';
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      shortcut = '⌘K',
      sizeVariant = 'default',
      placeholder = 'Search...',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasValue = Boolean(value);

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <Search
          className={cn(
            'absolute left-3 text-muted-foreground pointer-events-none',
            sizeVariant === 'sm' ? 'h-3.5 w-3.5 left-2.5' : 'h-4 w-4'
          )}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border border-border bg-background text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            sizeVariant === 'sm' && 'h-8 pl-8 pr-14 text-xs',
            sizeVariant === 'default' && 'h-9 pl-9 pr-16 text-sm',
            sizeVariant === 'lg' && 'h-11 pl-10 pr-20 text-base'
          )}
          {...props}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {shortcut && !hasValue && (
            <Kbd className="hidden sm:inline-flex text-[10px] py-0 px-1.5 font-mono">
              {shortcut}
            </Kbd>
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
