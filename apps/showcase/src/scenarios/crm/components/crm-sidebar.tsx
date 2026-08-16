'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Headphones,
  Sparkles,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  Check,
} from 'lucide-react';
import {
  cn,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import type { AgentStatus } from '../types';

interface CrmSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateMobile?: () => void;
}

const AGENT_STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; dotColor: string; badgeVariant: 'success' | 'warning' | 'secondary' | 'outline' }
> = {
  available: {
    label: 'Available',
    dotColor: 'bg-success ring-success/20',
    badgeVariant: 'success',
  },
  busy: {
    label: 'Busy on Call',
    dotColor: 'bg-warning ring-warning/20',
    badgeVariant: 'warning',
  },
  away: {
    label: 'Away',
    dotColor: 'bg-muted-foreground ring-muted-foreground/20',
    badgeVariant: 'secondary',
  },
  offline: {
    label: 'Offline',
    dotColor: 'bg-muted ring-muted/20',
    badgeVariant: 'outline',
  },
};

export function CrmSidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigateMobile,
}: CrmSidebarProps) {
  const pathname = usePathname();
  const {
    leads,
    campaigns,
    conversations,
    currentAgent,
    setAgentStatus,
  } = useCrm();

  const unreadMessagesCount = React.useMemo(
    () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations]
  );

  const activeCampaignsCount = React.useMemo(
    () => campaigns.filter((c) => c.status === 'active').length,
    [campaigns]
  );

  const navItems = [
    {
      title: 'Dashboard',
      href: '/crm',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Leads Pipeline',
      href: '/crm/leads',
      icon: Users,
      badge: leads.length.toString(),
    },
    {
      title: 'Campaigns',
      href: '/crm/campaigns',
      icon: Megaphone,
      badge: activeCampaignsCount > 0 ? `${activeCampaignsCount} Live` : undefined,
      badgeVariant: 'highlight' as const,
    },
    {
      title: 'Contact Center',
      href: '/crm/contact-center',
      icon: Headphones,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
      badgeVariant: 'destructive' as const,
    },
    {
      title: 'AI Command Center',
      href: '/crm/ai',
      icon: Sparkles,
      badge: 'Copilot',
      badgeVariant: 'highlight' as const,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card/70 backdrop-blur-md transition-all duration-300 z-30',
        onNavigateMobile
          ? 'h-full w-full'
          : 'hidden lg:flex h-screen sticky top-0',
        !onNavigateMobile && (collapsed ? 'w-16' : 'w-72')
      )}
    >
      {/* App Header / Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link
            href="/crm"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            onClick={onNavigateMobile}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground shadow-xs group-hover:scale-105 transition-transform font-display">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-foreground font-display group-hover:text-highlight transition-colors flex items-center gap-1.5">
                Acme CRM
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                  v2.4
                </Badge>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Design System Suite
              </span>
            </div>
          </Link>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mx-auto"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <h4 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            CRM Modules
          </h4>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigateMobile}
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
                          variant={item.badgeVariant || (isActive ? 'highlight' : 'outline')}
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

      {/* Back to Design System Documentation */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors font-mono',
            collapsed && 'justify-center px-2'
          )}
          title="Back to Design System Living Docs"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Design System Docs</span>}
        </Link>
      </div>

      {/* Current Agent Profile & Status Popover */}
      <div className="border-t border-border p-3 bg-muted/20">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-accent/70 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed && 'justify-center'
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={currentAgent.avatarUrl} alt={currentAgent.name} />
                  <AvatarFallback className="text-xs font-bold font-mono">
                    {currentAgent.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card',
                    AGENT_STATUS_CONFIG[currentAgent.status].dotColor
                  )}
                />
              </div>

              {!collapsed && (
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {currentAgent.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate font-mono">
                    {AGENT_STATUS_CONFIG[currentAgent.status].label}
                  </span>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-56 p-2 space-y-1.5 shadow-lg">
            <div className="px-2 py-1.5 border-b border-border">
              <p className="text-xs font-semibold text-foreground">{currentAgent.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{currentAgent.role}</p>
            </div>
            <div className="space-y-0.5 pt-1">
              <span className="text-xs font-semibold text-muted-foreground px-2 uppercase font-mono tracking-wider">
                Change Status
              </span>
              {(['available', 'busy', 'away', 'offline'] as AgentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAgentStatus(st)}
                  className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', AGENT_STATUS_CONFIG[st].dotColor)} />
                    {AGENT_STATUS_CONFIG[st].label}
                  </span>
                  {currentAgent.status === st && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}
