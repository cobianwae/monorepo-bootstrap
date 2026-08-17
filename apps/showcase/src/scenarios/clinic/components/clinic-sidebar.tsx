'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, HeartPulse } from 'lucide-react';
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
import { useClinic } from '../store/clinic-context';
import { CLINIC_NAV_GROUPS } from '../nav-config';
import type { StaffStatus, PractitionerRole } from '../types';

interface ClinicSidebarProps {
  onNavigateMobile?: () => void;
}

const ROLE_LABELS: Record<PractitionerRole, string> = {
  doctor: 'Doctor',
  psychologist: 'Psychologist',
  dietician: 'Dietician',
};

const STAFF_STATUS_CONFIG: Record<StaffStatus, { label: string; dotColor: string }> = {
  available: { label: 'Available', dotColor: 'bg-success ring-success/20' },
  'in-consult': { label: 'In Consultation', dotColor: 'bg-highlight ring-highlight/20' },
  break: { label: 'On Break', dotColor: 'bg-warning ring-warning/20' },
  'off-duty': { label: 'Off Duty', dotColor: 'bg-muted ring-muted/20' },
};

const STAFF_STATUS_OPTIONS = (Object.keys(STAFF_STATUS_CONFIG) as StaffStatus[]).map((key) => ({
  value: key,
  label: STAFF_STATUS_CONFIG[key].label,
  dotColor: STAFF_STATUS_CONFIG[key].dotColor,
}));

export function ClinicSidebar({ onNavigateMobile }: ClinicSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';

  const handleNav = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onNavigateMobile?.();
  };

  const { patients, appointments, cart, currentStaff, setStaffStatus } = useClinic();

  const activePatientsCount = React.useMemo(
    () => patients.filter((p) => p.status === 'active').length,
    [patients]
  );

  const todayApptsCount = React.useMemo(
    () =>
      appointments.filter(
        (a) => a.status === 'scheduled' || a.status === 'checked-in' || a.status === 'in-consult'
      ).length,
    [appointments]
  );

  const cartItemsCount = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const navGroups = CLINIC_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      switch (item.id) {
        case 'nav-registration':
          return { ...item, badge: 'Stepper' };
        case 'nav-appointments':
          return {
            ...item,
            badge: todayApptsCount > 0 ? String(todayApptsCount) : undefined,
            badgeVariant: 'warning-outline' as const,
          };
        case 'nav-patients':
          return {
            ...item,
            badge: activePatientsCount > 0 ? String(activePatientsCount) : undefined,
            badgeVariant: 'secondary' as const,
          };
        case 'nav-treatments':
          return { ...item, badge: 'Master' };
        case 'nav-consultations':
          return { ...item, badge: '3 Roles', badgeVariant: 'highlight' as const };
        case 'nav-pos':
          return {
            ...item,
            badge: cartItemsCount > 0 ? `${cartItemsCount}` : undefined,
            badgeVariant: 'success-outline' as const,
          };
        default:
          return item;
      }
    }),
  }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(isCollapsed && 'justify-center px-2')}>
        {!isCollapsed && (
          <Link
            href="/clinic"
            onClick={handleNav}
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground shadow-xs group-hover:scale-105 transition-transform font-display shrink-0">
              <HeartPulse className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-foreground font-display flex items-center gap-1.5 truncate">
                Aura Metabolic
                <Badge variant="highlight" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                  CIS
                </Badge>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider truncate">
                Weight Loss Clinic
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
          name={currentStaff.name}
          roleLabel={`${ROLE_LABELS[currentStaff.role]} · ${currentStaff.room}`}
          avatarUrl={currentStaff.avatarUrl}
          status={currentStaff.status}
          statusLabel={STAFF_STATUS_CONFIG[currentStaff.status].label}
          statusOptions={STAFF_STATUS_OPTIONS}
          onStatusChange={(value) => setStaffStatus(currentStaff.id, value as StaffStatus)}
          ariaLabel="Practitioner profile and status options"
        />
      </SidebarFooter>
    </Sidebar>
  );
}