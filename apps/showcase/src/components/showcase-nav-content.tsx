'use client';

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
    title: 'Foundations',
    items: [
      { title: 'Color & Contrast Matrix', href: '/foundations/colors', icon: Palette },
      { title: 'Typography Scale', href: '/foundations/typography', icon: BookOpen },
      { title: 'Spacing, Radius & Motion', href: '/foundations/spacing', icon: Sparkles },
    ],
  },
  {
    title: 'Components',
    items: [{ title: 'Core UI Components', href: '/components', icon: Box, badge: '25+' }],
  },
  {
    title: 'UX Scenario Patterns',
    items: [
      { title: 'Stepper / Wizard Flow', href: '/patterns/stepper', icon: GitFork, badge: 'UX' },
      { title: 'Workspace Layout', href: '/patterns/workspace', icon: Layers },
      { title: 'Data Table & Filtering', href: '/patterns/data-table', icon: TableProperties },
      { title: 'Master Data CRUD', href: '/patterns/master-data', icon: Database },
      { title: 'Master-Detail Flow', href: '/patterns/master-detail', icon: ListTree },
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
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <div className="flex flex-1 items-center justify-between">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={isActive ? 'secondary' : 'outline'}
                            className="text-[10px] px-1.5 py-0 h-4"
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