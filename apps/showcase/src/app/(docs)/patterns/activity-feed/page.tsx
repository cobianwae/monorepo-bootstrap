'use client';

import * as React from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Pin,
  Copy,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CreditCard,
  Box,
  X,
  CheckCircle2,
  History,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DescriptionList,
  EmptyState,
  Spinner,
  toast,
} from '@ds/ui';
import { formatDistanceToNow } from 'date-fns';

type FeedCategory = 'users' | 'security' | 'system' | 'payment';

interface ActivityEntry {
  id: string;
  actor: string;
  initials: string;
  action: string;
  target: string;
  category: FeedCategory;
  timestamp: Date;
  ip: string;
  details: string[];
}

const CATEGORY_META: Record<
  FeedCategory,
  { label: string; icon: typeof UserCheck; badge: 'secondary' | 'destructive' | 'outline' | 'success' }
> = {
  users: { label: 'User action', icon: UserCheck, badge: 'secondary' },
  security: { label: 'Security', icon: ShieldAlert, badge: 'destructive' },
  system: { label: 'System', icon: Box, badge: 'outline' },
  payment: { label: 'Payment', icon: CreditCard, badge: 'success' },
};

const ACTORS = [
  { name: 'Arya Pratama', initials: 'AP' },
  { name: 'Dewi Lestari', initials: 'DL' },
  { name: 'Bimo Wicaksono', initials: 'BW' },
  { name: 'Citra Maharani', initials: 'CM' },
  { name: 'Eko Ramadhan', initials: 'ER' },
  { name: 'System', initials: 'SY' },
];

function seedFeed(): ActivityEntry[] {
  const now = new Date();
  const mins = (m: number) => new Date(now.getTime() - m * 60000);
  const rows: Array<[string, string, FeedCategory, number, string, string[]]> = [
    ['created', 'the campaign "Spring Launch"', 'users', 4, '10.0.0.12', ['Campaign created from the builder wizard']],
    ['updated', 'role of "Citra" to Billing Admin', 'users', 12, '10.0.0.7', ['Field changed: role → Billing Admin']],
    ['enabled', 'two-factor authentication', 'security', 25, '10.0.1.4', ['2FA activated on account']],
    ['signed', 'the new vendor contract', 'system', 41, '10.0.0.20', ['Contract #C-2026-114', 'Signed via DocuSign webhook']],
    ['refunded', 'invoice #INV-1042', 'payment', 67, '10.0.0.9', ['Amount: $149.00', 'Reason: duplicate charge']],
    ['invited', '3 new members to the workspace', 'users', 98, '10.0.1.31', ['Invitations sent to 3 emails']],
    ['failed', 'login attempt (wrong password)', 'security', 143, '203.0.113.7', ['Location: Jakarta, ID', '3 consecutive failures']],
    ['generated', 'an API key for the production stage', 'security', 176, '10.0.0.5', ['Scope: read-only · Expires in 90d']],
    ['exported', 'the full audit log', 'system', 220, '10.0.1.10', ['Format: CSV · 1,284 rows']],
    ['charged', 'the Pro plan subscription', 'payment', 289, 'gateway', ['Amount: $49.00', 'Visa •••• 4242']],
    ['deleted', 'a stale segment "2025 Q4 Leads"', 'users', 402, '10.0.0.12', ['Permanent deletion after 30-day retention']],
    ['rotated', 'the OAuth client secret', 'security', 515, '10.0.2.2', ['Client: lumenui-web']],
    ['deployed', 'release v2.0.0 to production', 'system', 610, 'cicd', ['Commit: 9f3a2b1', 'Zero-downtime deploy']],
    ['updated', 'the privacy policy', 'system', 740, '10.0.1.3', ['Published new revision']],
    ['issued', 'invoice #INV-1057', 'payment', 900, 'billing', ['Amount: $49.00', 'Due in 14 days']],
    ['removed', 'the member "Rudi" from the team', 'users', 1080, '10.0.0.7', ['Transferred assets to owner']],
    ['detected', 'an unusual sign-in from a new device', 'security', 1330, '198.51.100.9', ['Device: iPhone 15 Pro · Location: Bandung']],
    ['optimized', 'the search index', 'system', 1560, 'worker', ['Rebuilt 42,331 documents']],
    ['refreshed', 'the weekly analytics digest', 'system', 1780, 'scheduler', ['Delivered to 14 subscribers']],
    ['approved', 'an expense report', 'payment', 1990, '10.0.0.12', ['Amount: $86.40']],
    ['joined', 'the workspace via invite link', 'users', 2250, '10.0.3.8', ['Invited by Arya Pratama']],
    ['escalated', 'a security alert to incident response', 'security', 2400, '10.0.1.4', ['Alert ID: SEC-2381']],
    ['paused', 'the nightly export job', 'system', 2600, '10.0.2.6', ['Rescheduled for maintenance window']],
    ['renewed', 'the domain subscription', 'payment', 3000, 'billing', ['Amount: $12.00/year']],
  ];
  return rows.map(([action, target, category, minutes, ip, details], i) => ({
    id: `act-${i}`,
    actor: ACTORS[i % ACTORS.length].name,
    initials: ACTORS[i % ACTORS.length].initials,
    action,
    target,
    category,
    timestamp: mins(minutes),
    ip,
    details,
  }));
}

const PAGE_SIZE = 12;

export default function ActivityFeedPage() {
  const [all] = React.useState<ActivityEntry[]>(seedFeed);
  const [visible, setVisible] = React.useState<ActivityEntry[]>([]);
  const [tab, setTab] = React.useState<'all' | FeedCategory>('all');
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [detail, setDetail] = React.useState<ActivityEntry | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((e) => {
      const catOk = tab === 'all' || e.category === tab;
      const qOk = !q || e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.target.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [all, tab, query]);

  const hasMore = visible.length < filtered.length;

  const loadMore = React.useCallback(() => {
    if (!hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisible((prev) => filtered.slice(0, prev.length + PAGE_SIZE));
      setIsLoadingMore(false);
    }, 500);
  }, [filtered, hasMore]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setIsLoading(false);
      setVisible(filtered.slice(0, PAGE_SIZE));
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset visible when filters change
  React.useEffect(() => {
    if (!isLoading) setVisible(filtered.slice(0, PAGE_SIZE));
  }, [tab, query, isLoading, filtered]);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const resetFilters = () => {
    setTab('all');
    setQuery('');
  };

  const groupLabel = (date: Date): string => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yStart = new Date(dayStart.getTime() - 86400000);
    if (date >= dayStart) return 'Today';
    if (date >= yStart) return 'Yesterday';
    return 'Earlier this week';
  };

  const groups = React.useMemo(() => {
    const order = ['Today', 'Yesterday', 'Earlier this week'];
    const map = new Map<string, ActivityEntry[]>();
    for (const e of visible) {
      const label = groupLabel(e.timestamp);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(e);
    }
    return order.filter((g) => map.has(g)).map((g) => ({ label: g, items: map.get(g)! }));
  }, [visible]);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={History}
        title="Activity Feed & Audit Log"
        description="A realtime-style activity stream with category filters, debounced search, grouped timelines, an IntersectionObserver-driven infinite scroll, and structured audit detail views."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              {all.length} events
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                toast({ variant: 'success', title: 'Feed refreshed', description: 'The activity log is up to date.' });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1 flex-wrap">
              {([
                ['all', 'All'],
                ['users', 'Users'],
                ['security', 'Security'],
                ['system', 'System'],
                ['payment', 'Payment'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    tab === key
                      ? 'bg-highlight text-highlight-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actor, action, target…"
                aria-label="Search activity"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {(tab !== 'all' || query) && (
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-highlight" />
              <span className="text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{filtered.length}</strong> of {all.length} events
              </span>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" />
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {isLoading ? (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No activity found"
          description="No audit events match the current filter combination. Try clearing filters to see the full log."
          actionLabel="Reset filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label} className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono px-1">
                <Activity className="h-3.5 w-3.5" />
                {group.label}
                <span className="text-muted-foreground/60">({group.items.length})</span>
              </h3>
              <Card className="border-border divide-y divide-border/50">
                {group.items.map((entry) => {
                  const meta = CATEGORY_META[entry.category];
                  const Icon = meta.icon;
                  return (
                    <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-muted/10 transition-colors">
                      <Avatar className="h-10 w-10 shrink-0 border border-border">
                        <AvatarFallback className="text-xs font-mono font-bold">{entry.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground leading-snug">
                          <strong>{entry.actor}</strong>{' '}
                          <span className="text-muted-foreground">{entry.action}</span>{' '}
                          <strong>{entry.target}</strong>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })} · {entry.ip}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={meta.badge} className="text-[10px] px-2 py-0.5 font-mono gap-1">
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More actions" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetail(entry)}>
                              <Eye className="h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toast({ variant: 'success', title: 'Pinned to top', description: 'The entry was pinned to the top of the feed.' })
                              }
                            >
                              <Pin className="h-4 w-4" />
                              Pin entry
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                toast({ variant: 'success', title: 'Link copied', description: 'Deep link copied to clipboard.' })
                              }
                            >
                              <Copy className="h-4 w-4" />
                              Copy link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}

          {/* Sentinel */}
          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner className="h-4 w-4" />
                Loading more events…
              </div>
            ) : !hasMore ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                You&apos;re all caught up — {visible.length} of {filtered.length} events shown
              </div>
            ) : (
              <span className="text-xs text-muted-foreground/60">Scroll for more…</span>
            )}
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-highlight" />
              Audit entry details
            </DialogTitle>
            <DialogDescription>Structured record for this activity event.</DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="text-xs font-mono font-bold">{detail.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-foreground">{detail.actor}</p>
                  <p className="text-xs text-muted-foreground font-mono">{formatDistanceToNow(detail.timestamp, { addSuffix: true })}</p>
                </div>
                <Badge variant={CATEGORY_META[detail.category].badge} className="ml-auto text-[10px] font-mono">
                  {CATEGORY_META[detail.category].label}
                </Badge>
              </div>

              <DescriptionList
                items={[
                  { label: 'Action', value: detail.action },
                  { label: 'Target', value: detail.target },
                  { label: 'Source IP', value: detail.ip },
                  { label: 'Event ID', value: detail.id },
                ]}
              />

              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Changes</p>
                <ul className="space-y-1">
                  {detail.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}