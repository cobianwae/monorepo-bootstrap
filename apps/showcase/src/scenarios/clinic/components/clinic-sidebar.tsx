'use client';

import * as React from 'react';
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
  Sparkles,
  HeartPulse,
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
    openAiCoach,
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

  const mainNavItems = [
    {
      title: 'Dashboard',
      href: '/clinic',
      icon: LayoutDashboard,
      badge: undefined,
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
      badgeVariant: 'warning' as const,
    },
    {
      title: 'Patients & EMR',
      href: '/clinic/patients',
      icon: Users,
      badge: activePatientsCount > 0 ? String(activePatientsCount) : undefined,
      badgeVariant: 'secondary' as const,
    },
  ];

  const clinicalNavItems = [
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
      badgeVariant: 'highlight' as const,
    },
  ];

  const commerceNavItems = [
    {
      title: 'Point of Sale (POS)',
      href: '/clinic/pos',
      icon: ShoppingBag,
      badge: cartItemsCount > 0 ? `${cartItemsCount}` : undefined,
      badgeVariant: 'success' as const,
    },
    {
      title: 'Reports & Analytics',
      href: '/clinic/reports',
      icon: BarChart3,
      badge: undefined,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      {/* Clinic Brand Header */}
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/clinic"
            onClick={handleNav}
            className="flex items-center gap-3 group transition-all duration-200"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-highlight text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <HeartPulse className="h-5 w-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                  Aura Metabolic
                  <Badge variant="highlight" size="sm" className="text-[10px] px-1.5 py-0 h-4">
                    CIS
                  </Badge>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Weight Loss Clinic
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && <SidebarTrigger className="hidden lg:flex" />}
        </div>
      </SidebarHeader>

      {/* Navigation Sections */}
      <SidebarContent className="p-2 space-y-4">
        {/* Main Section */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2">
              Front Desk & Schedule
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      'transition-colors',
                      isActive && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <Link href={item.href} onClick={handleNav} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={item.badgeVariant || 'outline'}
                          size="sm"
                          className="text-[10px] h-4 px-1.5"
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

        {/* Clinical Care Section */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2">
              Clinical & Therapy
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {clinicalNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      'transition-colors',
                      isActive && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <Link href={item.href} onClick={handleNav} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={item.badgeVariant || 'outline'}
                          size="sm"
                          className="text-[10px] h-4 px-1.5"
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

        {/* Commerce & Intelligence Section */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2">
              Commerce & Insights
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {commerceNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      'transition-colors',
                      isActive && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <Link href={item.href} onClick={handleNav} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={item.badgeVariant || 'outline'}
                          size="sm"
                          className="text-[10px] h-4 px-1.5"
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

        {/* AI Clinical Coach Action Button */}
        <div className="px-2 pt-2">
          <button
            onClick={openAiCoach}
            className={cn(
              'w-full flex items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-highlight bg-highlight/10 border border-highlight/20 hover:bg-highlight/20 transition-all cursor-pointer',
              isCollapsed && 'justify-center p-2'
            )}
            title="AI Clinical Coach Assistant"
          >
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-highlight" />
            {!isCollapsed && <span>AI Clinical Coach</span>}
          </button>
        </div>
      </SidebarContent>

      {/* Footer: Active Duty Staff & Return Link */}
      <SidebarFooter className="border-t border-border/40 p-3 space-y-2">
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

        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Back to Design System Docs"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span className="font-mono text-[11px]">Design System Docs</span>}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
