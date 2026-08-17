'use client';

import * as React from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';

export const notificationItemVariants = cva(
  'relative flex gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
  {
    variants: {
      read: {
        true: 'bg-card/60 border-border/60 text-muted-foreground',
        false: 'bg-card border-border text-foreground shadow-2xs hover:border-border/80',
      },
    },
    defaultVariants: {
      read: false,
    },
  }
);

export interface NotificationItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationItemVariants> {
  id?: string;
  title: string;
  description?: string;
  timestamp?: string;
  avatar?: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'destructive';
  read?: boolean;
  onRead?: () => void;
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

export const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(
  (
    {
      className,
      title,
      description,
      timestamp,
      avatar,
      icon,
      type = 'info',
      read = false,
      onRead,
      onDismiss,
      actions,
      ...props
    },
    ref
  ) => {
    const typeIcons = {
      info: <Info className="h-4 w-4 text-info" />,
      success: <CheckCircle2 className="h-4 w-4 text-success" />,
      warning: <AlertTriangle className="h-4 w-4 text-warning" />,
      destructive: <AlertCircle className="h-4 w-4 text-destructive" />,
    };

    return (
      <div
        ref={ref}
        role="article"
        aria-label={title}
        className={cn(notificationItemVariants({ read }), className)}
        {...props}
      >
        {/* Unread indicator dot */}
        {!read && (
          <span
            aria-label="Unread"
            className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"
          />
        )}

        {/* Leading Avatar or Icon */}
        <div className="shrink-0 mt-0.5">
          {avatar ? (
            avatar
          ) : icon ? (
            <div className="rounded-full bg-muted p-2">{icon}</div>
          ) : (
            <div className="rounded-full bg-muted p-2">
              {typeIcons[type]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4 space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-medium leading-tight',
                read ? 'text-muted-foreground' : 'text-foreground font-semibold'
              )}
            >
              {title}
            </h4>
          </div>

          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            {timestamp && (
              <span className="text-[11px] text-muted-foreground/80">
                {timestamp}
              </span>
            )}

            {!read && onRead && (
              <button
                type="button"
                onClick={onRead}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Tandai dibaca
              </button>
            )}
          </div>

          {actions && <div className="pt-2 flex items-center gap-2">{actions}</div>}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Hapus notifikasi"
            className="absolute bottom-3 right-3 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
NotificationItem.displayName = 'NotificationItem';

export interface NotificationListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const NotificationList = React.forwardRef<HTMLDivElement, NotificationListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-2 w-full', className)} {...props}>
        {children}
      </div>
    );
  }
);
NotificationList.displayName = 'NotificationList';

export interface NotificationHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  unreadCount?: number;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  title?: string;
}

export const NotificationHeader = React.forwardRef<HTMLDivElement, NotificationHeaderProps>(
  (
    {
      className,
      unreadCount = 0,
      onMarkAllAsRead,
      title = 'Notifikasi',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between pb-3 border-b border-border', className)}
        {...props}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {unreadCount} baru
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-7 text-xs text-muted-foreground gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Tandai semua dibaca</span>
            </Button>
          )}
        </div>
      </div>
    );
  }
);
NotificationHeader.displayName = 'NotificationHeader';

export interface NotificationEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const NotificationEmpty = React.forwardRef<HTMLDivElement, NotificationEmptyProps>(
  (
    {
      className,
      title = 'Belum ada notifikasi',
      description = 'Semua pemberitahuan aktivitas Anda akan muncul di sini.',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
        {...props}
      >
        <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3">
          <Bell className="h-6 w-6" />
        </div>
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">{description}</p>
      </div>
    );
  }
);
NotificationEmpty.displayName = 'NotificationEmpty';
