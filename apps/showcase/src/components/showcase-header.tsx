'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Sun, Moon, Laptop, ShieldCheck } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTitle } from '@ds/ui';
import { useTheme } from './theme-provider';
import { ShowcaseNavContent } from './showcase-nav-content';

export function ShowcaseHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [navOpen, setNavOpen] = React.useState(false);

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
        {/* Mobile nav toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-8 w-8 p-0"
          onClick={() => setNavOpen(true)}
          title="Open navigation"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open navigation</span>
        </Button>

        <div className="flex min-w-0 items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Section:
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Compliance Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>WCAG 2.1 AA Contrast</span>
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

      {/* Mobile slide-over navigation */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="flex flex-col p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-border px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                DS
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-foreground">
                  Design System
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                  Tailwind v4 + shadcn
                </span>
              </div>
            </div>
          </div>
          <ShowcaseNavContent onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}