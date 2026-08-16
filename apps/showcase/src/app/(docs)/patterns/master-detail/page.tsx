'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  ToastAction,
  toast,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Skeleton,
} from '@ds/ui';
import {
  Sparkles,
  Inbox,
  MessageSquare,
  ArrowLeft,
  Clock,
  User,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@ds/ui';
import { PageHeader } from '@/components/page-header';

interface Ticket {
  id: string;
  subject: string;
  requester: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  updated: string;
  preview: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TK-1042',
    subject: 'Cannot authenticate via SSO in staging',
    requester: 'Priya N.',
    priority: 'high',
    status: 'open',
    updated: '5m ago',
    preview: 'Getting a 401 even though the identity provider session is active...',
  },
  {
    id: 'TK-1041',
    subject: 'Dark mode contrast issue on KPI cards',
    requester: 'Marcus T.',
    priority: 'medium',
    status: 'in-progress',
    updated: '32m ago',
    preview: 'The delta arrows on StatCard drop below 4.5:1 in dark mode...',
  },
  {
    id: 'TK-1040',
    subject: 'Export report times out for large workspaces',
    requester: 'Elena R.',
    priority: 'high',
    status: 'open',
    updated: '1h ago',
    preview: 'Anything above ~50k rows returns HTTP 504 after 60s...',
  },
  {
    id: 'TK-1039',
    subject: 'Suggest avatar fallback initials in Table',
    requester: 'Theo L.',
    priority: 'low',
    status: 'resolved',
    updated: '3h ago',
    preview: 'When users lack a profile picture we should derive initials...',
  },
  {
    id: 'TK-1038',
    subject: 'Infinite scroll duplicate batch on rapid scroll',
    requester: 'Sofia R.',
    priority: 'medium',
    status: 'in-progress',
    updated: 'yesterday',
    preview: 'IntersectionObserver fires twice when scrolling fast near the trigger...',
  },
];

const PRIORITY_STYLE: Record<Ticket['priority'], string> = {
  low: 'bg-muted/40 text-muted-foreground',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-destructive/15 text-destructive',
};

export default function MasterDetailPatternPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>(INITIAL_TICKETS);
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [replyDraft, setReplyDraft] = React.useState('');
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      const desktop = mql.matches;
      setIsDesktop(desktop);
      if (desktop) {
        setDetailOpen(false);
      } else if (selectedId) {
        setDetailOpen(true);
      }
    };
    handleChange();
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [selectedId]);

  const filteredTickets = tickets.filter((t) =>
    `${t.subject} ${t.id} ${t.requester}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  const openDetail = (id: string) => {
    setSelectedId(id);
    setIsLoadingDetail(true);
    // Desktop: detail renders in the split pane; mobile: slide-over Sheet.
    setDetailOpen(!isDesktop);
    setTimeout(() => setIsLoadingDetail(false), 600);
  };

  const closeDetail = () => {
    setDetailOpen(false);
  };

  const resolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'resolved' } : t
      )
    );
    toast({
      variant: 'success',
      title: 'Ticket resolved',
      description: `${id} moved to the resolved queue.`,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            setTickets((prev) =>
              prev.map((t) =>
                t.id === id ? { ...t, status: 'open' } : t
              )
            );
            toast({
              variant: 'info',
              title: 'Reopened',
              description: `${id} restored to the open queue.`,
            });
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setSelectedId(null);
    setDetailOpen(false);
    toast({
      variant: 'default',
      title: 'Ticket deleted',
      description: `${id} was permanently removed.`,
    });
  };

  const detailPanel = selected && (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[11px]">
            {selected.id}
          </Badge>
          <Badge
            variant={
              selected.status === 'resolved'
                ? 'success'
                : selected.status === 'in-progress'
                ? 'warning'
                : 'secondary'
            }
            className="text-[11px] capitalize"
          >
            {selected.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {selected.updated}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">{selected.subject}</h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          {selected.requester}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{selected.preview}</p>

      {/* Thread */}
      <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Conversation
        </p>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-semibold text-foreground">{selected.requester}</p>
            <p className="mt-1 text-muted-foreground">{selected.preview}</p>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs font-semibold text-primary">You (Support)</p>
            <p className="mt-1 text-muted-foreground">
              Investigating — can you share the network trace and the exact OIDC issuer?
            </p>
          </div>
        </div>
      </div>

      {/* Reply box */}
      <div className="space-y-2">
        <Label htmlFor="reply">Reply to {selected.requester}</Label>
        <Textarea
          id="reply"
          placeholder="Type your response..."
          value={replyDraft}
          onChange={(e) => setReplyDraft(e.target.value)}
          rows={4}
        />
        <div className="flex flex-wrap justify-end gap-2">
          {selected.status !== 'resolved' && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => resolveTicket(selected.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark resolved
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              toast({
                variant: 'success',
                title: 'Reply sent',
                description: `Your reply to ${selected.requester} was dispatched.`,
              });
              setReplyDraft('');
            }}
          >
            Send reply
          </Button>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Delete ticket
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ticket {selected.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the ticket and its full conversation history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteTicket(selected.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Master-Detail Navigation Flow"
        description="List → detail → edit without losing context. On desktop a split pane shows list and detail side by side; on mobile the detail becomes a slide-over Sheet with a clear back action."
      />

      <Card className="border-border shadow-xs">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
            {/* Master list */}
            <div className="border-b lg:border-b-0 lg:border-r border-border">
              <div className="flex items-center gap-2 border-b border-border p-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    aria-label="Search tickets"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-8 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    toast({
                      variant: 'info',
                      title: 'New ticket',
                      description: 'Opening the create-ticket composer...',
                    })
                  }
                  aria-label="Create new ticket"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <ul className="max-h-[560px] divide-y divide-border overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                    No tickets match your search.
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isSelected = ticket.id === selectedId;
                    return (
                      <li key={ticket.id}>
                        <button
                          type="button"
                          onClick={() => openDetail(ticket.id)}
                          aria-current={isSelected ? 'true' : undefined}
                          className={cn(
                            'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-primary/10 border-l-2 border-l-primary'
                              : 'hover:bg-accent/50 border-l-2 border-l-transparent'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {ticket.subject}
                            </span>
                            <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
                              {ticket.id}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-muted-foreground">
                              {ticket.requester} · {ticket.updated}
                            </span>
                            <Badge
                              className={cn('shrink-0 text-[10px] capitalize', PRIORITY_STYLE[ticket.priority])}
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* Detail pane — desktop */}
            <div className="hidden lg:block p-6">
              {isLoadingDetail ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                </div>
              ) : selected ? (
                detailPanel
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8" />
                  <p className="font-semibold text-foreground">Select a ticket</p>
                  <p>Choose an item from the list to view its full details.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail sheet — mobile */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 lg:hidden"
                onClick={closeDetail}
                aria-label="Back to ticket list"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <SheetTitle className="sr-only">Ticket details</SheetTitle>
            </div>
            <SheetDescription className="sr-only">
              Full details, conversation and actions for the selected ticket.
            </SheetDescription>
          </SheetHeader>

          {isLoadingDetail ? (
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          ) : selected ? (
            detailPanel
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}