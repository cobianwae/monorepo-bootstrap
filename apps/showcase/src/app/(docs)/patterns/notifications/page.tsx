'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Timeline,
  type TimelineItem,
  Switch,
  Label,
  Separator,
  toast,
} from '@ds/ui';
import {
  Sparkles,
  CheckCheck,
  Trash2,
  Bell,
  ShieldAlert,
  DollarSign,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  kind: 'system' | 'billing' | 'security' | 'team';
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'API key rotation required',
    description: 'Your access keys expire in 14 days. Rotate them to avoid service interruption.',
    timestamp: '2m ago',
    read: false,
    kind: 'security',
  },
  {
    id: 'n2',
    title: 'Invoice #1024 generated',
    description: 'Your November invoice of $842.00 has been generated.',
    timestamp: '1h ago',
    read: false,
    kind: 'billing',
  },
  {
    id: 'n3',
    title: 'Deploy completed',
    description: 'v3.2.1 shipped to production — all checks green.',
    timestamp: '3h ago',
    read: false,
    kind: 'system',
  },
  {
    id: 'n4',
    title: 'New teammate invited',
    description: 'Sofia Chen accepted your invitation to the Design guild.',
    timestamp: 'Yesterday',
    read: true,
    kind: 'team',
  },
  {
    id: 'n5',
    title: 'High CPU alert resolved',
    description: 'Node-03 returned below 70% capacity threshold.',
    timestamp: 'Yesterday',
    read: true,
    kind: 'system',
  },
  {
    id: 'n6',
    title: 'Payment method expiring',
    description: 'Your Visa •••• 4242 expires next month. Update before auto-renewal.',
    timestamp: '2 days ago',
    read: true,
    kind: 'billing',
  },
];

const KIND_ICON: Record<Notification['kind'], typeof Bell> = {
  system: Bell,
  billing: DollarSign,
  security: ShieldAlert,
  team: UserPlus,
};

const KIND_BADGE: Record<Notification['kind'], 'default' | 'success' | 'warning' | 'secondary'> = {
  system: 'default',
  billing: 'success',
  security: 'warning',
  team: 'secondary',
};

function toTimelineItems(items: Notification[]): TimelineItem[] {
  return items.map((n) => {
    const Icon = KIND_ICON[n.kind];
    const status: TimelineItem['status'] =
      n.kind === 'security'
        ? 'warning'
        : n.kind === 'billing'
          ? 'info'
          : n.kind === 'team'
            ? 'success'
            : 'default';
    return {
      id: n.id,
      title: n.title,
      description: n.description,
      timestamp: n.timestamp,
      icon: Icon,
      status,
    };
  });
}

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [emailDigest, setEmailDigest] = React.useState(true);
  const [markReadOnOpen, setMarkReadOnOpen] = React.useState(false);

  const unread = notifications.filter((n) => !n.read).length;
  const read = notifications.filter((n) => n.read);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ variant: 'success', title: 'All notifications marked as read' });
  };

  const clearRead = () => {
    const count = read.length;
    setNotifications((prev) => prev.filter((n) => !n.read));
    toast({
      variant: 'info',
      title: `${count} notification${count > 1 ? 's' : ''} cleared`,
    });
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const renderList = (items: Notification[]) => (
    <div className="divide-y divide-border">
      {items.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Nothing here. You are all caught up.
        </div>
      ) : (
        items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => toggleRead(n.id)}
            className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
              n.read ? '' : 'bg-primary/[0.04]'
            }`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
              }`}
            >
              {React.createElement(KIND_ICON[n.kind], { className: 'h-4 w-4' })}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{n.title}</span>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">{n.description}</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                <Badge variant={KIND_BADGE[n.kind]} className="text-[9px] capitalize">
                  {n.kind}
                </Badge>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Notification Center"
        description="An inbox for system, billing, security, and team notifications — with unread indicators, bulk actions, per-type tabs, digest preferences, and an activity timeline."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-primary" />
                  Inbox
                  {unread > 0 && (
                    <Badge variant="default" className="text-[10px]">
                      {unread} unread
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Click an item to toggle read state.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={markAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                  onClick={clearRead}
                  disabled={read.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all">
                <div className="border-b border-border px-4 pt-2">
                  <TabsList className="bg-transparent p-0">
                    <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-primary rounded-none">
                      All ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-primary rounded-none">
                      Unread ({unread})
                    </TabsTrigger>
                    <TabsTrigger value="read" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground border-b-2 border-transparent data-[state=active]:border-primary rounded-none">
                      Read ({read.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-0">
                  {renderList(notifications)}
                </TabsContent>
                <TabsContent value="unread" className="mt-0">
                  {renderList(notifications.filter((n) => !n.read))}
                </TabsContent>
                <TabsContent value="read" className="mt-0">
                  {renderList(read)}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery preferences</CardTitle>
              <CardDescription className="text-xs">
                Control how notifications reach you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="digest" className="text-sm">Weekly email digest</Label>
                  <p className="text-xs text-muted-foreground">Summary of the week every Monday.</p>
                </div>
                <Switch id="digest" checked={emailDigest} onCheckedChange={setEmailDigest} />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="mark-open" className="text-sm">Mark read on click</Label>
                  <p className="text-xs text-muted-foreground">Auto-clear unread dot when opened.</p>
                </div>
                <Switch id="mark-open" checked={markReadOnOpen} onCheckedChange={setMarkReadOnOpen} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription className="text-xs">Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline items={toTimelineItems(notifications.slice(0, 4))} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}