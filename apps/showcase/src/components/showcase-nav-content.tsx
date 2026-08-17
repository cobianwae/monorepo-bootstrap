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
  PanelLeft,
  Palette,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TableProperties,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import {
  Badge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuItem,
} from '@ds/ui';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Integrated Scenarios',
    items: [
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
        badge: 'New Suite',
      },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { title: 'Art Directions', href: '/foundations/themes', icon: Palette, badge: '3 Styles' },
      { title: 'Color & Contrast Matrix', href: '/foundations/colors', icon: Sparkles },
      { title: 'Typography Scale', href: '/foundations/typography', icon: BookOpen },
      { title: 'Spacing, Radius & Motion', href: '/foundations/spacing', icon: Layers },
    ],
  },
  {
    title: 'Components',
    items: [
      { title: 'Core UI Components', href: '/components', icon: Box, badge: '25+' },
      {
        title: 'Sidebar Layout System',
        href: '/components/sidebar',
        icon: PanelLeft,
        badge: 'New',
      },
      {
        title: 'Layout & Navigation',
        href: '/components/layout-nav',
        icon: Layers,
        badge: 'New',
      },
      {
        title: 'Carousel & Scroll',
        href: '/components/carousel',
        icon: SlidersHorizontal,
        badge: 'New',
      },
      {
        title: 'Data & Collections',
        href: '/components/data-collections',
        icon: Bot,
        badge: 'New',
      },
      {
        title: 'Marketing Blocks',
        href: '/components/marketing',
        icon: Sparkles,
        badge: 'New',
      },
      {
        title: 'Form Core & Radios',
        href: '/components/forms-core',
        icon: FileCheck2,
        badge: 'New',
      },
      {
        title: 'Advanced Form Kit',
        href: '/components/forms-advanced',
        icon: Wand2,
        badge: 'New',
      },
      {
        title: 'Primitives & Utilities',
        href: '/components/primitives',
        icon: Component,
        badge: 'New',
      },
      { title: 'Charts & Data Viz', href: '/components/charts', icon: Activity, badge: 'New' },
    ],
  },
  {
    title: 'UX Scenario Patterns',
    items: [
      { title: 'Stepper / Wizard Flow', href: '/patterns/stepper', icon: GitFork, badge: 'UX' },
      { title: 'Workspace Layout', href: '/patterns/workspace', icon: Layers },
      { title: 'Data Table & Filtering', href: '/patterns/data-table', icon: TableProperties },
      {
        title: 'Advanced Filtering & Views',
        href: '/patterns/advanced-filtering',
        icon: ListTree,
        badge: 'New',
      },
      { title: 'Master Data CRUD', href: '/patterns/master-data', icon: Database },
      { title: 'Master-Detail Flow', href: '/patterns/master-detail', icon: ListTree },
      { title: 'Dynamic Form', href: '/patterns/dynamic-form', icon: GitFork, badge: 'New' },
      {
        title: 'Kanban & Drag & Drop',
        href: '/patterns/kanban',
        icon: Columns3,
        badge: 'New',
      },
      { title: 'Global Search', href: '/patterns/global-search', icon: Search, badge: 'New' },
      {
        title: 'Notification Center',
        href: '/patterns/notifications',
        icon: BellRing,
        badge: 'New',
      },
      {
        title: 'Result & Error States',
        href: '/patterns/results',
        icon: ShieldAlert,
        badge: 'New',
      },
      { title: 'Auth & Onboarding', href: '/patterns/auth', icon: KeyRound },
      { title: 'Dashboard & Metrics', href: '/patterns/dashboard', icon: LayoutDashboard },
      { title: 'Overlays & Feedback', href: '/patterns/overlays', icon: BellRing },
      {
        title: 'Command Palette',
        href: '/patterns/command-palette',
        icon: Command,
        badge: 'New',
      },
      { title: 'Optimistic Updates', href: '/patterns/optimistic-updates', icon: RefreshCw },
      { title: 'Infinite Scroll', href: '/patterns/infinite-scroll', icon: InfinityIcon },
      { title: 'Onboarding Checklist', href: '/patterns/onboarding', icon: Compass },
      { title: 'File Upload', href: '/patterns/file-upload', icon: UploadCloud },
    ],
  },
  {
    title: 'Design Principles',
    items: [{ title: 'Visual & A11y Guidelines', href: '/guidelines', icon: BookOpen }],
  },
];

interface ShowcaseNavContentProps {
  onNavigate?: () => void;
}

export function ShowcaseNavContent({ onNavigate }: ShowcaseNavContentProps) {
  const pathname = usePathname();

  const activeHref = useMemo(() => {
    const matches = NAV_SECTIONS.flatMap((section) => section.items).filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname]);

  return (
    <div className="flex-1 space-y-1">
      {NAV_SECTIONS.map((section) => (
        <SidebarGroup key={section.title}>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href} onClick={onNavigate}>
                      <Icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <SidebarMenuBadge>
                          <Badge
                            variant={isActive ? 'highlight' : 'outline'}
                            className="text-[10px] px-1.5 py-0.5 font-mono whitespace-nowrap leading-none"
                          >
                            {item.badge}
                          </Badge>
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  );
}