'use client';

import * as React from 'react';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { cn } from '@ds/ui';
import { THEMES } from '@ds/tokens';
import { ShowcaseNavContent } from './showcase-nav-content';
import { useTheme } from './theme-provider';

export function ShowcaseSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const { palette } = useTheme();
  const currentTheme = THEMES.find((t) => t.id === palette) || THEMES[0];

  return (
    <aside
      className={cn(
        'relative hidden lg:flex flex-col border-r border-border bg-card/70 backdrop-blur-md transition-all duration-300 h-screen sticky top-0 z-30',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground font-bold text-sm shadow-xs group-hover:scale-105 transition-transform font-display">
              DS
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-foreground font-display group-hover:text-highlight transition-colors">
                Design System
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Tailwind v4 + Radix
              </span>
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mx-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <ShowcaseNavContent collapsed={collapsed} />

      {/* Footer System Status */}
      {!collapsed && (
        <div className="border-t border-border p-3 space-y-2">
          <div className="rounded-xl bg-muted/40 border border-border/80 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <span className="flex items-center gap-1 text-[11px] font-mono uppercase text-muted-foreground">
                <Sparkles className="h-3 w-3 text-highlight" />
                Theme: {currentTheme.name}
              </span>
              <span className="text-success font-semibold font-mono text-[11px]">AAA / AA</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-success to-highlight w-full rounded-full" />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              80 token pairs verified WCAG
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
