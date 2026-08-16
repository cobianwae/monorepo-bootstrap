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
  type LucideIcon,
} from 'lucide-react';
import {
  cn,
  Badge,
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

interface ClinicSidebarProps {
  onNavigateMobile?: () => void;
}

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
          badgeVariant: 'warning',
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
          badgeVariant: 'success',
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

      {/* Footer: Active Duty Staff */}
      <SidebarFooter>
        {!isCollapsed && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">Duty: 6 Staff On-Site</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
