'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, CornerDownLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../feedback/dialog';
import { Input } from '../base/input';

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  keywords?: string[];
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps
  extends React.HTMLAttributes<HTMLDivElement> {
  groups: CommandPaletteGroup[];
}

const OPEN_EVENT = 'ds:open-command-palette';

export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ groups, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const flattened = React.useMemo(() => {
      const q = query.trim().toLowerCase();
      const result: { item: CommandPaletteItem; groupIndex: number; index: number }[] = [];
      groups.forEach((group, groupIndex) => {
        group.items.forEach((item) => {
          if (!q) {
            result.push({ item, groupIndex, index: result.length });
            return;
          }
          const haystack = [
            item.label,
            item.description ?? '',
            ...(item.keywords ?? []),
          ]
            .join(' ')
            .toLowerCase();
          if (haystack.includes(q)) result.push({ item, groupIndex, index: result.length });
        });
      });
      return result;
    }, [groups, query]);

    const openPalette = React.useCallback(() => {
      setOpen(true);
      setQuery('');
      setActiveIndex(0);
    }, []);

    React.useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          openPalette();
        }
      };
      const onOpenEvent = () => openPalette();

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener(OPEN_EVENT, onOpenEvent);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener(OPEN_EVENT, onOpenEvent);
      };
    }, [openPalette]);

    React.useEffect(() => {
      if (open) {
        setActiveIndex(0);
        // Focus input after dialog animates in
        const id = window.setTimeout(() => inputRef.current?.focus(), 50);
        return () => window.clearTimeout(id);
      }
    }, [open]);

    const selectItem = (item: CommandPaletteItem) => {
      setOpen(false);
      item.onSelect();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flattened.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = flattened[activeIndex];
        if (active) selectItem(active.item);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ref={ref}
          className={cn('top-[20%] translate-y-0 max-w-xl p-0 overflow-hidden gap-0', className)}
          onKeyDown={onKeyDown}
          {...props}
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search for pages, actions and settings. Use the arrow keys to navigate and Enter to select.
          </DialogDescription>

          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Type a command or search..."
              aria-label="Search commands"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-12 px-3"
            />
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono border">
              ESC
            </kbd>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            {flattened.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for “{query}”
              </p>
            ) : (
              groups.map((group) => {
                const visibleItems = flattened.filter(
                  (f) => f.groupIndex === groups.indexOf(group)
                );
                if (visibleItems.length === 0) return null;
                return (
                  <div key={group.heading} className="mb-1 last:mb-0">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.heading}
                    </p>
                    {visibleItems.map(({ item }) => {
                      const flatIdx = flattened.find((f) => f.item.id === item.id)?.index ?? 0;
                      const Icon = item.icon;
                      const isActive = flatIdx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(flatIdx)}
                          onClick={() => selectItem(item)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium">{item.label}</span>
                            {item.description && (
                              <span
                                className={cn(
                                  'truncate text-xs',
                                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                )}
                              >
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.shortcut && (
                            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono border">
                              {item.shortcut}
                            </kbd>
                          )}
                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
CommandPalette.displayName = 'CommandPalette';

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}