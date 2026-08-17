'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
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
  available: { label: 'Available', dotColor: 'bg-success ring-success/20' },
  busy: { label: 'Busy on Call', dotColor: 'bg-warning ring-warning/20' },
  away: { label: 'Away', dotColor: 'bg-muted-foreground ring-muted-foreground/20' },
  offline: { label: 'Offline', dotColor: 'bg-muted ring-muted/20' },
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
        return { ...item, badge: leads.length.toString(), badgeVariant: 'outline' as const };
      case 'nav-campaigns':
        return {
          ...item,
          badge: activeCampaignsCount > 0 ? `${activeCampaignsCount} Live` : undefined,
          badgeVariant: 'highlight' as const,
        };
      case 'nav-contact-center':
        return {
          ...item,
          badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
          badgeVariant: 'destructive' as const,
        };
      case 'nav-ai':
        return { ...item, badge: 'Copilot', badgeVariant: 'highlight' as const };
      default:
        return item;
    }
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(isCollapsed && 'justify-center px-2')}>
        {!isCollapsed && (
          <Link
            href="/crm"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            onClick={handleNav}
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

      <SidebarContent>
        <SidebarNav
          groups={[{ label: 'CRM Modules', items: navItems }]}
          pathname={pathname}
          onNavigate={handleNav}
          LinkComponent={Link}
        />

        <SidebarGroup className="mt-auto pt-3 pb-0 border-t border-border/40 group-data-[collapsible=icon]:pt-2">
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