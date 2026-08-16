'use client';

import * as React from 'react';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@ds/ui';
import { ShowcaseNavContent } from './showcase-nav-content';

export function ShowcaseSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        'relative hidden lg:flex flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300 h-screen sticky top-0 z-30',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
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
        <div className="border-t border-border p-3">
          <div className="rounded-lg bg-muted/50 p-3 text-xs">
            <div className="flex items-center justify-between text-muted-foreground font-medium mb-1">
              <span>WCAG Compliance</span>
              <span className="text-success font-semibold">AAA / AA</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div className="h-full bg-success w-full rounded-full" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              All tokens mathematically verified
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}