'use client';

import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../base/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';
import { useSidebar } from './sidebar';

export interface SidebarUserStatusOption {
  value: string;
  label: string;
  dotColor: string;
}

export interface SidebarUserStatusProps {
  name: string;
  roleLabel: string;
  avatarUrl?: string;
  initials?: string;
  status: string;
  statusLabel: string;
  statusOptions: SidebarUserStatusOption[];
  onStatusChange: (value: string) => void;
  ariaLabel?: string;
}

export function SidebarUserStatus({
  name,
  roleLabel,
  avatarUrl,
  initials,
  status,
  statusLabel,
  statusOptions,
  onStatusChange,
  ariaLabel = 'User profile and status options',
}: SidebarUserStatusProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';

  const current = statusOptions.find((option) => option.value === status);
  const dotColor = current?.dotColor ?? 'bg-muted';
  const fallbackInitials = initials ?? name.slice(0, 2).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-accent/70 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
            isCollapsed && 'justify-center p-1 gap-0'
          )}
          aria-label={ariaLabel}
        >
          <div className="relative shrink-0">
            <Avatar className="h-8 w-8 border border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="text-xs font-bold font-mono">{fallbackInitials}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card',
                dotColor
              )}
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">{name}</span>
              <span className="text-[11px] text-muted-foreground truncate font-mono">
                {statusLabel}
              </span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-56 p-2 space-y-1.5 shadow-lg">
        <div className="px-2 py-1.5 border-b border-border">
          <p className="text-xs font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{roleLabel}</p>
        </div>
        <div className="space-y-0.5 pt-1">
          <span className="text-xs font-semibold text-muted-foreground px-2 uppercase font-mono tracking-wider">
            Change Status
          </span>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
              className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', option.dotColor)} />
                {option.label}
              </span>
              {status === option.value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}