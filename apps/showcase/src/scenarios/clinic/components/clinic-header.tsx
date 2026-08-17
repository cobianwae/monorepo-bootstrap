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
  Laptop,
  RotateCcw,
  CheckCheck,
  HeartPulse,
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
  useTheme,
  PaletteSwitcher,
} from '@ds/ui';
import { useClinic } from '../store/clinic-context';

interface ClinicHeaderProps {
  onOpenCommandPalette: () => void;
}

const SECTION_TITLES: Record<string, string> = {
  '/clinic': 'Clinical Executive Dashboard',
  '/clinic/registration': 'Patient Intake & Registration Wizard',
  '/clinic/appointments': 'Daily Appointments & Scheduling Board',
  '/clinic/patients': 'Patient Directory & EMR Records',
  '/clinic/treatments': 'Clinical Treatment Catalog & Protocols',
  '/clinic/consultations': 'Multi-Disciplinary Clinical Workspace',
  '/clinic/pos': 'Point of Sale & Retail Checkout',
  '/clinic/reports': 'Metabolic Outcomes & Revenue Analytics',
};

export function ClinicHeader({ onOpenCommandPalette }: ClinicHeaderProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';

  const {
    notifications,
    markNotificationsRead,
    resetAllData,
    openAiCoach,
  } = useClinic();
  const { theme, setTheme } = useTheme();

  const unreadNotifs = React.useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  const currentTitle = SECTION_TITLES[pathname] || 'Clinic System';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Sidebar trigger, Collapsed Logo & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden" />

        {/* Collapsed Navbar Logo Mark */}
        {isCollapsed && (
          <Link
            href="/clinic"
            className="hidden lg:flex items-center group transition-all duration-200 hover:opacity-90 animate-in fade-in-50"
            title="Aura Metabolic Clinic"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground shadow-xs group-hover:scale-105 transition-transform font-display">
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
          </Link>
        )}

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/clinic" className="text-muted-foreground hover:text-foreground font-mono text-xs">
                Aura CIS
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

      {/* Right Action Toolbar */}
      <div className="flex items-center gap-2">
        {/* Global Command Palette / Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all sm:w-64 justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Search patients, appts...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Kbd size="sm">⌘</Kbd>
            <Kbd size="sm">K</Kbd>
          </div>
        </button>

        {/* AI Clinical Coach Quick Trigger */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
               <Button
                        variant="secondary"
                        size="sm"
                        onClick={openAiCoach}
                        className="h-8 gap-1.5 border-highlight/40 bg-highlight/10 text-foreground hover:bg-highlight/20 transition-colors shadow-xs"
                      >
             
                <Sparkles className="h-3.5 w-3.5 text-highlight animate-pulse" />
                <span className="font-mono text-xs">AI Coach</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Launch AI Clinical Coach Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold font-display">Clinical Notifications</span>
                {unreadNotifs.length > 0 && (
                  <Badge variant="highlight" size="sm" className="h-4 text-[10px] px-1">
                    {unreadNotifs.length} new
                  </Badge>
                )}
              </div>
              {unreadNotifs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markNotificationsRead}
                  className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark read
                </Button>
              )}
            </div>
            <div className="max-h-72 divide-y divide-border/40 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 text-xs transition-colors ${
                    notif.read ? 'bg-background opacity-70' : 'bg-primary/5 font-medium'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground font-medium">{notif.title}</p>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">{notif.description}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Palette & Theme Switchers */}
        <PaletteSwitcher />

        {/* Theme Mode Selector (Light / Dark / System) */}
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
            className="h-7 w-7 p-0"
            title="Light mode"
            aria-label="Light mode"
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="h-7 w-7 p-0"
            title="Dark mode"
            aria-label="Dark mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className="h-7 w-7 p-0"
            title="System theme"
            aria-label="System theme"
          >
            <Laptop className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Reset Demo Data Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetAllData}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Clinic Scenario Data to Initial Demo State</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
