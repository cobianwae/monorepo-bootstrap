'use client';

import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge, type BadgeProps } from '../base/badge';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from './sidebar';

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
  badgeVariant?: BadgeProps['variant'];
}

export interface SidebarNavGroup {
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: SidebarNavGroup[];
  pathname?: string;
  onNavigate?: () => void;
  LinkComponent?: React.ElementType;
}

export function SidebarNav({
  className,
  groups,
  pathname,
  onNavigate,
  LinkComponent,
  ...props
}: SidebarNavProps) {
  const isActive = (item: SidebarNavItem) => {
    if (!pathname) return false;
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const ItemLink = LinkComponent ?? 'a';

  return (
    <div className={cn('flex-1 space-y-1', className)} {...props}>
      {groups.map((group) => (
        <SidebarGroup key={group.label ?? group.items[0]?.href}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                    <ItemLink href={item.href} onClick={onNavigate}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span
                        className={cn(
                          'truncate group-data-[collapsible=icon]:hidden',
                          item.badge && 'pr-8'
                        )}
                      >
                        {item.title}
                      </span>
                      {item.badge && (
                        <SidebarMenuBadge>
                          <Badge
                            variant={item.badgeVariant || (active ? 'highlight' : 'outline')}
                            className="text-[10px] px-1.5 py-0.5 font-mono shrink-0 whitespace-nowrap leading-none group-data-[collapsible=icon]:hidden"
                          >
                            {item.badge}
                          </Badge>
                        </SidebarMenuBadge>
                      )}
                    </ItemLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  );
}