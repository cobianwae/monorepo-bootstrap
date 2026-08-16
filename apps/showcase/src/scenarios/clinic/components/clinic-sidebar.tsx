'use client';

import * as React from 'react';
import { type ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  CalendarClock,
  Users,
  Stethoscope,
  ClipboardList,
  ShoppingBag,
  BarChart3,
  ArrowLeft,
  HeartPulse,
  Check,
  type LucideIcon,
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
import { useClinic } from '../store/clinic-context';
import type { StaffStatus, PractitionerRole } from '../types';

interface ClinicSidebarProps {
  onNavigateMobile?: () => void;
}

const ROLE_LABELS: Record<PractitionerRole, string> = {
  doctor: 'Doctor',
  psychologist: 'Psychologist',
  dietician: 'Dietician',
};

const STAFF_STATUS_CONFIG: Record<
  StaffStatus,
  { label: string; dotColor: string }
> = {
  available: {
    label: 'Available',
    dotColor: 'bg-success ring-success/20',
  },
  'in-consult': {
    label: 'In Consultation',
    dotColor: 'bg-highlight ring-highlight/20',
  },
  break: {
    label: 'On Break',
    dotColor: 'bg-warning ring-warning/20',
  },
  'off-duty': {
    label: 'Off Duty',
    dotColor: 'bg-muted ring-muted/20',
  },
};

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
  badgeVariant?: ComponentProps<typeof Badge>['variant'];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

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

  const {
    patients,
    appointments,
    cart,
    currentStaff,
    setStaffStatus,
  } = useClinic();

  const activePatientsCount = React.useMemo(
    () => patients.filter((p) => p.status === 'active').length,
    [patients]
  );

  const todayApptsCount = React.useMemo(
    () => appointments.filter((a) => a.status === 'scheduled' || a.status === 'checked-in' || a.status === 'in-consult').length,
    [appointments]
  );

  const cartItemsCount = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const navGroups: NavGroup[] = [
    {
      label: 'Front Desk & Schedule',
      items: [
        {
          title: 'Dashboard',
          href: '/clinic',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          title: 'Registration',
          href: '/clinic/registration',
          icon: UserPlus,
          badge: 'Stepper',
        },
        {
          title: 'Appointments',
          href: '/clinic/appointments',
          icon: CalendarClock,
          badge: todayApptsCount > 0 ? String(todayApptsCount) : undefined,
          badgeVariant: 'warning-outline',
        },
        {
          title: 'Patients & EMR',
          href: '/clinic/patients',
          icon: Users,
          badge: activePatientsCount > 0 ? String(activePatientsCount) : undefined,
          badgeVariant: 'secondary',
        },
      ],
    },
    {
      label: 'Clinical & Therapy',
      items: [
        {
          title: 'Treatments Catalog',
          href: '/clinic/treatments',
          icon: Stethoscope,
          badge: 'Master',
        },
        {
          title: 'Consultations',
          href: '/clinic/consultations',
          icon: ClipboardList,
          badge: '3 Roles',
          badgeVariant: 'highlight',
        },
      ],
    },
    {
      label: 'Commerce & Insights',
      items: [
        {
          title: 'Point of Sale (POS)',
          href: '/clinic/pos',
          icon: ShoppingBag,
          badge: cartItemsCount > 0 ? `${cartItemsCount}` : undefined,
          badgeVariant: 'success-outline',
        },
        {
          title: 'Reports & Analytics',
          href: '/clinic/reports',
          icon: BarChart3,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Clinic Brand Header */}
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

      {/* Navigation Sections */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} onClick={handleNav}>
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
        ))}

        {/* Back to Docs Link */}
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

      {/* Current Practitioner Profile & Status Popover in Footer */}
      <SidebarFooter>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-accent/70 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
                isCollapsed && 'justify-center p-1 gap-0'
              )}
              aria-label="Practitioner profile and status options"
            >
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={currentStaff.avatarUrl} alt={currentStaff.name} />
                  <AvatarFallback className="text-xs font-bold font-mono">
                    {currentStaff.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card',
                    STAFF_STATUS_CONFIG[currentStaff.status].dotColor
                  )}
                />
              </div>

              {!isCollapsed && (
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {currentStaff.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate font-mono">
                    {STAFF_STATUS_CONFIG[currentStaff.status].label}
                  </span>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-56 p-2 space-y-1.5 shadow-lg">
            <div className="px-2 py-1.5 border-b border-border">
              <p className="text-xs font-semibold text-foreground">{currentStaff.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {ROLE_LABELS[currentStaff.role]} · {currentStaff.room}
              </p>
            </div>
            <div className="space-y-0.5 pt-1">
              <span className="text-xs font-semibold text-muted-foreground px-2 uppercase font-mono tracking-wider">
                Change Status
              </span>
              {(['available', 'in-consult', 'break', 'off-duty'] as StaffStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStaffStatus(currentStaff.id, st)}
                  className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', STAFF_STATUS_CONFIG[st].dotColor)} />
                    {STAFF_STATUS_CONFIG[st].label}
                  </span>
                  {currentStaff.status === st && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  );
}
