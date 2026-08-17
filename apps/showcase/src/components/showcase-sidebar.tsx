'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { THEMES } from '@ds/tokens';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@ds/ui';
import { ShowcaseNavContent } from './showcase-nav-content';
import { useTheme } from './theme-provider';

export function ShowcaseSidebar() {
  const { palette } = useTheme();
  const currentTheme = THEMES.find((t) => t.id === palette) || THEMES[0];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground font-bold text-sm shadow-xs group-hover:scale-105 transition-transform font-display">
            DS
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm tracking-tight text-foreground font-display group-hover:text-highlight transition-colors">
              Design System
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
              Tailwind v4 + Radix
            </span>
          </div>
        </Link>
        <SidebarTrigger className="lg:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <ShowcaseNavContent />
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-xl bg-muted/40 border border-border/80 p-3 text-xs space-y-2 group-data-[collapsible=icon]:hidden">
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
            160 token pairs verified WCAG
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}