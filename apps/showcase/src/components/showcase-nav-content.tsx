'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BellRing,
  BookOpen,
  Bot,
  Box,
  Briefcase,
  Columns3,
  Command,
  Compass,
  Component,
  Database,
  FileCheck2,
  GitFork,
  HeartPulse,
  Infinity as InfinityIcon,
  KeyRound,
  LayoutDashboard,
  Layers,
  ListTree,
  MonitorSmartphone,
  MousePointerClick,
  Palette,
  PanelLeft,
  RefreshCw,
  Rocket,
  Search,
  Shapes,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Timer,
  Type,
  Wand2,
} from 'lucide-react';
import {
  Badge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@ds/ui';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavSubSection {
  label: string;
  items: NavItem[];
}

interface NavSection {
  title: string;
  items?: NavItem[];
  subsections?: NavSubSection[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Introduction', href: '/', icon: Compass },
      { title: 'Quick Start Guide', href: '/getting-started', icon: Rocket },
      { title: "What's New", href: '/whats-new', icon: Sparkles, badge: 'v0.2' },
    ],
  },
  {
    title: 'Playground',
    items: [
      { title: 'Landing Page Demo', href: '/landing', icon: Bot, badge: 'Interactive' },
      {
        title: 'CRM Full Suite',
        href: '/crm',
        icon: Briefcase,
        badge: 'Interactive',
      },
      {
        title: 'Weight Loss Clinic (CIS)',
        href: '/clinic',
        icon: HeartPulse,
        badge: 'Interactive',
      },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { title: 'Color & Contrast Matrix', href: '/foundations/colors', icon: Palette },
      { title: 'Typography Scale', href: '/foundations/typography', icon: Type },
      { title: 'Spacing & Elevation', href: '/foundations/spacing', icon: Layers },
      { title: 'Motion & Animation', href: '/foundations/motion', icon: Timer },
      { title: 'Iconography', href: '/foundations/iconography', icon: Shapes },
      { title: 'Art Directions & Themes', href: '/foundations/themes', icon: Wand2, badge: '3 Styles' },
      { title: 'Breakpoints & Responsive', href: '/foundations/breakpoints', icon: MonitorSmartphone },
    ],
  },
  {
    title: 'Components',
    items: [
      { title: 'Overview', href: '/components', icon: Box },
      { title: 'Actions & Inputs', href: '/components/actions-inputs', icon: MousePointerClick },
      { title: 'Forms', href: '/components/forms', icon: FileCheck2 },
      { title: 'Layout & Navigation', href: '/components/layout-navigation', icon: PanelLeft },
      { title: 'Overlays & Menus', href: '/components/overlays-menus', icon: Component },
      { title: 'Data Display', href: '/components/data-display', icon: TableProperties },
      { title: 'States & Feedback', href: '/components/states-feedback', icon: ShieldCheck },
      { title: 'Charts & Data Viz', href: '/components/charts', icon: Activity },
      { title: 'Marketing', href: '/components/marketing', icon: Sparkles },
    ],
  },
  {
    title: 'UX Scenario Patterns',
    subsections: [
      {
        label: 'Forms & Flows',
        items: [
          { title: 'Stepper / Wizard Flow', href: '/patterns/stepper', icon: GitFork },
          { title: 'Dynamic Form', href: '/patterns/dynamic-form', icon: Wand2 },
          { title: 'Master Data CRUD', href: '/patterns/master-data', icon: Database },
          { title: 'Master-Detail Flow', href: '/patterns/master-detail', icon: ListTree },
        ],
      },
      {
        label: 'Data & Productivity',
        items: [
          { title: 'Data Table & Filtering', href: '/patterns/data-table', icon: TableProperties },
          { title: 'Kanban & Drag & Drop', href: '/patterns/kanban', icon: Columns3 },
          { title: 'Workspace Layout', href: '/patterns/workspace', icon: Layers },
        ],
      },
      {
        label: 'Navigation & Search',
        items: [
          { title: 'Command Palette', href: '/patterns/command-palette', icon: Command },
          { title: 'Global Search', href: '/patterns/global-search', icon: Search },
        ],
      },
      {
        label: 'Feedback & Async',
        items: [
          { title: 'Notification Center', href: '/patterns/notifications', icon: BellRing },
          { title: 'Optimistic Updates', href: '/patterns/optimistic-updates', icon: RefreshCw },
          { title: 'Infinite Scroll', href: '/patterns/infinite-scroll', icon: InfinityIcon },
          { title: 'Result & Error States', href: '/patterns/results', icon: ShieldAlert },
        ],
      },
      {
        label: 'Access & Onboarding',
        items: [
          { title: 'Auth & Security', href: '/patterns/auth', icon: KeyRound },
          { title: 'Onboarding & First Visit', href: '/patterns/onboarding', icon: Compass },
        ],
      },
      {
        label: 'Metrics',
        items: [
          { title: 'Dashboard & Metrics', href: '/patterns/dashboard', icon: LayoutDashboard },
        ],
      },
    ],
  },
  {
    title: 'Design Principles',
    items: [
      { title: 'Visual & A11y Guidelines', href: '/guidelines', icon: BookOpen },
      { title: 'Contribution Guide', href: '/contribution', icon: Rocket },
    ],
  },
];

interface ShowcaseNavContentProps {
  onNavigate?: () => void;
}

export function ShowcaseNavContent({ onNavigate }: ShowcaseNavContentProps) {
  const pathname = usePathname();

  const allItems = useMemo(
    () =>
      NAV_SECTIONS.flatMap((section) => [
        ...(section.items ?? []),
        ...(section.subsections?.flatMap((sub) => sub.items) ?? []),
      ]),
    []
  );

  const activeHref = useMemo(() => {
    const matches = allItems.filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname, allItems]);

  return (
    <div className="flex-1 space-y-1">
      {NAV_SECTIONS.map((section) => (
        <SidebarGroup key={section.title}>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items?.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href} onClick={onNavigate}>
                      <Icon />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? 'highlight' : 'outline'}
                          className="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 font-mono whitespace-nowrap leading-none group-data-[collapsible=icon]:hidden"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            {section.subsections?.map((subsection) => (
              <SidebarMenuItem key={subsection.label}>
                <div
                  className="flex h-7 w-full items-center gap-2 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 select-none"
                  aria-hidden="true"
                >
                  {subsection.label}
                </div>
                <SidebarMenuSub>
                  {subsection.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeHref === item.href;

                    return (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <Link href={item.href} onClick={onNavigate}>
                            <Icon />
                            <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  );
}
