'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Navigation } from 'lucide-react';
import {
  cn,
  Badge,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarNav,
  SidebarUserStatus,
  useSidebar,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import { CRM_NAV_ITEMS } from '../nav-config';
import type { AgentStatus } from '../types';

interface CrmSidebarProps {
  onNavigateMobile?: () => void;
}

const AGENT_STATUS_CONFIG: Record<AgentStatus, { label: string; dotColor: string }> = {
  available: { label: 'Available', dotColor: 'bg-success' },
  busy: { label: 'Busy on Call', dotColor: 'bg-warning' },
  away: { label: 'Away', dotColor: 'bg-muted-foreground' },
  offline: { label: 'Offline', dotColor: 'bg-muted' },
};

const AGENT_STATUS_OPTIONS = (Object.keys(AGENT_STATUS_CONFIG) as AgentStatus[]).map((key) => ({
  value: key,
  label: AGENT_STATUS_CONFIG[key].label,
  dotColor: AGENT_STATUS_CONFIG[key].dotColor,
}));

export function CrmSidebar({ onNavigateMobile }: CrmSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';

  const handleNav = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onNavigateMobile?.();
  };

  const { leads, campaigns, conversations, currentAgent, setAgentStatus } = useCrm();

  const unreadMessagesCount = React.useMemo(
    () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations]
  );

  const activeCampaignsCount = React.useMemo(
    () => campaigns.filter((c) => c.status === 'active').length,
    [campaigns]
  );

  const navItems = CRM_NAV_ITEMS.map((item) => {
    switch (item.id) {
      case 'nav-leads':
        return {
          ...item,
          badge: leads.length > 0 ? leads.length.toString() : undefined,
          badgeVariant: 'secondary' as const,
        };
      case 'nav-campaigns':
        return {
          ...item,
          badge: activeCampaignsCount > 0 ? `${activeCampaignsCount} Live` : undefined,
          badgeVariant: 'success-outline' as const,
        };
      case 'nav-contact-center':
        return {
          ...item,
          badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
          badgeVariant: 'destructive-outline' as const,
        };
      case 'nav-ai':
        return {
          ...item,
          badge: 'Copilot',
          badgeVariant: 'highlight-outline' as const,
        };
      default:
        return item;
    }
  });

  const salesItems = navItems.filter((i) => i.id !== 'nav-ai');
  const aiItems = navItems.filter((i) => i.id === 'nav-ai');

  const navGroups = [
    { label: 'Sales & Channels', items: salesItems },
    { label: 'AI & Intelligence', items: aiItems },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(isCollapsed && 'justify-center px-2')}>
        {!isCollapsed && (
          <Link
            href="/crm"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            onClick={handleNav}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm group-hover:scale-105 transition-transform">
              <Navigation className="h-4 w-4 fill-current" aria-hidden="true" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-foreground font-display group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                Arah CRM
                <Badge variant="highlight-outline" className="text-[10px] px-1.5 py-0 h-4 font-mono font-medium">
                  v2.4
                </Badge>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider truncate">
                Sales & Growth Suite
              </span>
            </div>
          </Link>
        )}

        <SidebarTrigger className={cn('hidden lg:flex', isCollapsed ? 'mx-auto' : 'ml-auto')} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav
          groups={navGroups}
          pathname={pathname}
          onNavigate={handleNav}
          LinkComponent={Link}
        />

        <SidebarGroup className="mt-auto pt-2 pb-0 group-data-[collapsible=icon]:pt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Design System Docs">
                <Link href="/" onClick={handleNav}>
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Design System Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserStatus
          name={currentAgent.name}
          roleLabel={currentAgent.role}
          avatarUrl={currentAgent.avatarUrl}
          status={currentAgent.status}
          statusLabel={AGENT_STATUS_CONFIG[currentAgent.status].label}
          statusOptions={AGENT_STATUS_OPTIONS}
          onStatusChange={(value) => setAgentStatus(value as AgentStatus)}
          ariaLabel="Agent profile and status options"
        />
      </SidebarFooter>
    </Sidebar>
  );
}