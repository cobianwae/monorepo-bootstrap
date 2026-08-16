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
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import type { AgentStatus } from '../types';

interface CrmSidebarProps {
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

export function CrmSidebar({ onNavigateMobile }: CrmSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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
      badgeVariant: 'outline' as const,
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
    <Sidebar collapsible="icon">
      {/* App Header / Logo */}
      <SidebarHeader className={cn(isCollapsed && 'justify-center px-2')}>
        {!isCollapsed && (
          <Link
            href="/crm"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            onClick={onNavigateMobile}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground shadow-xs group-hover:scale-105 transition-transform font-display shrink-0">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-foreground font-display group-hover:text-highlight transition-colors flex items-center gap-1.5 truncate">
                Acme CRM
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                  v2.4
                </Badge>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider truncate">
                Design System Suite
              </span>
            </div>
          </Link>
        )}

        <SidebarTrigger className={cn('hidden lg:flex', isCollapsed ? 'mx-auto' : 'ml-auto')} />
      </SidebarHeader>

      {/* Navigation list */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Modules</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link href={item.href} onClick={onNavigateMobile}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || (isActive ? 'highlight' : 'outline')}
                          className="ml-auto text-[10px] px-1.5 py-0.5 font-mono shrink-0 whitespace-nowrap leading-none group-data-[collapsible=icon]:hidden"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Back to Design System Documentation Link */}
        <SidebarGroup className="mt-auto pt-3 pb-0 border-t border-border/40 group-data-[collapsible=icon]:pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Design System Docs">
                <Link href="/" onClick={onNavigateMobile}>
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Design System Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Current Agent Profile & Status Popover in Footer */}
      <SidebarFooter>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-accent/70 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
                isCollapsed && 'justify-center p-1 gap-0'
              )}
              aria-label="Agent profile and status options"
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

              {!isCollapsed && (
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {currentAgent.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate font-mono">
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
                  className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors cursor-pointer"
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
      </SidebarFooter>
    </Sidebar>
  );
}
