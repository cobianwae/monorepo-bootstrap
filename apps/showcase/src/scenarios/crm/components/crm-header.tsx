'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Sparkles,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  CheckCheck,
  Building2,
} from 'lucide-react';
import {
  Button,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  SidebarTrigger,
  Kbd,
  useSidebar,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import { useTheme } from '@/components/theme-provider';
import { PaletteSwitcher } from '@/components/palette-switcher';

interface CrmHeaderProps {
  onOpenCommandPalette: () => void;
}

const SECTION_TITLES: Record<string, string> = {
  '/crm': 'Executive Dashboard',
  '/crm/leads': 'Leads & Opportunities Pipeline',
  '/crm/campaigns': 'Marketing Campaigns & Performance',
  '/crm/contact-center': 'Omnichannel Contact Center',
  '/crm/ai': 'AI Intelligence & Copilot Studio',
};

export function CrmHeader({ onOpenCommandPalette }: CrmHeaderProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';

  const {
    notifications,
    markNotificationsRead,
    resetAllData,
    openAiDrawer,
  } = useCrm();
  const { theme, setTheme } = useTheme();

  const unreadNotifs = React.useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  const currentTitle = SECTION_TITLES[pathname] || 'CRM';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Sidebar trigger, Collapsed Logo & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden" />

        {/* Collapsed Navbar Logo Mark */}
        {isCollapsed && (
          <Link
            href="/crm"
            className="hidden lg:flex items-center group transition-all duration-200 hover:opacity-90 animate-in fade-in-50"
            title="Acme CRM"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground shadow-xs group-hover:scale-105 transition-transform font-display">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </Link>
        )}

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/crm" className="text-muted-foreground hover:text-foreground font-mono text-xs">
                Acme CRM
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground font-display text-sm">
                {currentTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Quick Search + Actions + Copilot + Palette + Theme + Reset */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Global CRM Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex h-8 w-36 md:w-52 items-center justify-between rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs text-muted-foreground hover:border-foreground/30 hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search leads, campaigns...</span>
          </span>
          <Kbd size="sm" className="hidden sm:inline-flex">
            ⌘K
          </Kbd>
        </button>

        {/* AI Copilot Quick Launch button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => openAiDrawer({ type: 'general' })}
          className="h-8 gap-1.5 border-highlight/40 bg-highlight/10 text-foreground hover:bg-highlight/20 transition-colors shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-highlight" />
          <span className="hidden md:inline text-xs font-semibold">AI Copilot</span>
        </Button>

        {/* Palette & Art Direction Switcher */}
        <PaletteSwitcher />

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadNotifs.length > 0 && (
                  <Badge variant="highlight" className="text-[10px] px-1.5 py-0">
                    {unreadNotifs.length} new
                  </Badge>
                )}
              </div>
              {unreadNotifs.length > 0 && (
                <button
                  type="button"
                  onClick={markNotificationsRead}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 space-y-1 transition-colors ${
                      n.read ? 'bg-transparent opacity-80' : 'bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme Toggle (Light / Dark) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle light/dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Reset Demo Data Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                onClick={resetAllData}
                aria-label="Reset CRM sample data"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Reset Demo Data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
