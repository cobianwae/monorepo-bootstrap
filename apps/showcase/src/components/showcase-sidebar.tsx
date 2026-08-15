'use client';

import * as React from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@ds/ui';
import { Badge } from '@ds/ui';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
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
    items: [
      { title: 'Core UI Components', href: '/components', icon: Box, badge: '25+' },
    ],
  },
  {
    title: 'UX Scenario Patterns',
    items: [
      { title: 'Stepper / Wizard Flow', href: '/patterns/stepper', icon: GitFork, badge: 'UX' },
      { title: 'Workspace Layout', href: '/patterns/workspace', icon: Layers },
      { title: 'Data Table & Filtering', href: '/patterns/data-table', icon: TableProperties },
      { title: 'Auth & Onboarding', href: '/patterns/auth', icon: KeyRound },
      { title: 'Dashboard & Metrics', href: '/patterns/dashboard', icon: LayoutDashboard },
      { title: 'Overlays & Feedback', href: '/patterns/overlays', icon: BellRing },
      { title: 'Master Data CRUD', href: '/patterns/master-data', icon: Database, badge: 'New' },
    ],
  },
  {
    title: 'Design Principles',
    items: [
      { title: 'Visual & A11y Guidelines', href: '/guidelines', icon: BookOpen },
    ],
  },
];

export function ShowcaseSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300 h-screen sticky top-0 z-30',
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
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
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
