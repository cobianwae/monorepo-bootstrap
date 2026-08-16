'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Palette,
  Box,
  Layers,
  Sparkles,
  GitFork,
  TableProperties,
  KeyRound,
  LayoutDashboard,
  BellRing,
  Database,
  BookOpen,
  Command,
  RefreshCw,
  Infinity as InfinityIcon,
  Compass,
  UploadCloud,
  ListTree,
  Wand2,
  Columns3,
  Activity,
  Search,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@ds/ui';
import { Badge } from '@ds/ui';

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
        title: 'Advanced Form Kit',
        href: '/components/forms-advanced',
        icon: Wand2,
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
      { title: 'Advanced Filtering & Views', href: '/patterns/advanced-filtering', icon: ListTree, badge: 'New' },
      { title: 'Master Data CRUD', href: '/patterns/master-data', icon: Database },
      { title: 'Master-Detail Flow', href: '/patterns/master-detail', icon: ListTree },
      { title: 'Dynamic Form', href: '/patterns/dynamic-form', icon: GitFork, badge: 'New' },
      { title: 'Kanban & Drag & Drop', href: '/patterns/kanban', icon: Columns3, badge: 'New' },
      { title: 'Global Search', href: '/patterns/global-search', icon: Search, badge: 'New' },
      { title: 'Notification Center', href: '/patterns/notifications', icon: BellRing, badge: 'New' },
      { title: 'Result & Error States', href: '/patterns/results', icon: ShieldAlert, badge: 'New' },
      { title: 'Auth & Onboarding', href: '/patterns/auth', icon: KeyRound },
      { title: 'Dashboard & Metrics', href: '/patterns/dashboard', icon: LayoutDashboard },
      { title: 'Overlays & Feedback', href: '/patterns/overlays', icon: BellRing },
      { title: 'Command Palette', href: '/patterns/command-palette', icon: Command, badge: 'New' },
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
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function ShowcaseNavContent({ collapsed = false, onNavigate }: ShowcaseNavContentProps) {
  const pathname = usePathname();

  const activeHref = useMemo(() => {
    const matches = NAV_SECTIONS.flatMap((section) => section.items).filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-1">
          {!collapsed && (
            <h4 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h4>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-highlight shadow-xs"
                      />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-highlight' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {!collapsed && (
                      <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={isActive ? 'highlight' : 'outline'}
                            className="text-[10px] px-1.5 py-0.5 font-mono shrink-0 whitespace-nowrap leading-none"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}