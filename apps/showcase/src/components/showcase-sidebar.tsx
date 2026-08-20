'use client';

import Link from 'next/link';
import { Sparkles, Navigation } from 'lucide-react';
import { THEMES } from '@ds/tokens';
import { cn } from '@ds/ui';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
  useTheme,
} from '@ds/ui';
import { ShowcaseNavContent } from './showcase-nav-content';

export function ShowcaseSidebar() {
  const { palette } = useTheme();
  const { state, isMobile } = useSidebar();
  const currentTheme = THEMES.find((t) => t.id === palette) || THEMES[0];
  const isCollapsed = !isMobile && state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(isCollapsed && 'justify-center px-2')}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm group-hover:scale-105 transition-transform">
              <Navigation className="h-4 w-4 fill-current" aria-hidden="true" />
            </span>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm tracking-tight text-foreground font-display group-hover:text-primary transition-colors">
                Arah
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Design System
              </span>
            </div>
          </Link>
        )}

        <SidebarTrigger
          className={cn('hidden lg:flex', isCollapsed ? 'mx-auto' : 'ml-auto')}
        />
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
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-muted/40 text-highlight shadow-xs"
            title={`Theme: ${currentTheme.name}`}
            aria-label={`Theme: ${currentTheme.name}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}