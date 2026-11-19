'use client';

import { usePathname } from 'next/navigation';
import { Sun, Moon, Laptop, ShieldCheck, Search } from 'lucide-react';
import { Button, Kbd, SidebarTrigger, useTheme, PaletteSwitcher } from '@ds/ui';

export function ShowcaseHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('ds:open-command-palette'));
  };

  const getBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Overview';
    return parts
      .map((p) => p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(' / ');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="lg:hidden" />

        <div className="flex min-w-0 items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider hidden sm:inline">
            Location:
          </span>
          <span className="truncate text-sm font-semibold text-foreground font-display">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Global Search Trigger */}
        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden md:flex h-8 w-32 sm:w-44 md:w-52 items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs text-muted-foreground hover:border-foreground/30 hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search docs...</span>
          </span>
          <Kbd size="sm" className="hidden sm:inline-flex">
            ⌘K
          </Kbd>
        </button>

        {/* Palette Switcher */}
        <PaletteSwitcher />

        {/* Compliance Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono text-[11px]">WCAG AA/AAA</span>
        </div>

        {/* Theme Toggle Button */}
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
            className="h-7 w-7 p-0"
            title="Light mode"
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="h-7 w-7 p-0"
            title="Dark mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className="h-7 w-7 p-0"
            title="System theme"
          >
            <Laptop className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}