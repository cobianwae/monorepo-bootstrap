'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  FilterBuilder,
  SegmentedControl,
  SegmentedControlItem,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DescriptionList,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Skeleton,
  toast,
  ToastAction,
  type FilterChip,
  type FilterFieldDefinition,
  type SavedFilterView,
} from '@ds/ui';
import {
  Sparkles,
  LayoutList,
  LayoutGrid,
  User,
  Tag,
  CalendarDays,
  Pencil,
  Copy,
  Trash2,
  MoreHorizontal,
  Eye,
  FilterX,
  RefreshCw,
  Info,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  tags: string[];
  dueAt: string;
}

const TASKS: Task[] = [
  { id: 't1', title: 'Redesign onboarding flow', assignee: 'Eleanor', priority: 'high', status: 'in-progress', tags: ['design', 'onboarding'], dueAt: '2025-11-04' },
  { id: 't2', title: 'Fix flaky auth tests', assignee: 'Marcus', priority: 'urgent', status: 'review', tags: ['testing', 'auth'], dueAt: '2025-11-01' },
  { id: 't3', title: 'Write data-table docs', assignee: 'Aria', priority: 'low', status: 'todo', tags: ['docs'], dueAt: '2025-12-10' },
  { id: 't4', title: 'Improve contrast on muted text', assignee: 'Eleanor', priority: 'medium', status: 'todo', tags: ['design', 'a11y'], dueAt: '2025-11-12' },
  { id: 't5', title: 'Migrate charts to Recharts 3', assignee: 'Julian', priority: 'high', status: 'in-progress', tags: ['charts', 'refactor'], dueAt: '2025-11-18' },
  { id: 't6', title: 'Add row virtualization', assignee: 'Sophia', priority: 'medium', status: 'done', tags: ['performance', 'table'], dueAt: '2025-10-28' },
  { id: 't7', title: 'Ship kanban pattern', assignee: 'Darius', priority: 'urgent', status: 'review', tags: ['dnd', 'kanban'], dueAt: '2025-11-02' },
  { id: 't8', title: 'Audit empty states', assignee: 'Aria', priority: 'low', status: 'todo', tags: ['ux', 'a11y'], dueAt: '2025-12-01' },
  { id: 't9', title: 'Bulk action bar polish', assignee: 'Marcus', priority: 'medium', status: 'in-progress', tags: ['table', 'ux'], dueAt: '2025-11-09' },
  { id: 't10', title: 'OKLCH dark parity check', assignee: 'Eleanor', priority: 'high', status: 'todo', tags: ['tokens', 'design'], dueAt: '2025-11-06' },
  { id: 't11', title: 'Implement global search', assignee: 'Sophia', priority: 'urgent', status: 'todo', tags: ['search'], dueAt: '2025-11-05' },
  { id: 't12', title: 'Notification center scaffold', assignee: 'Julian', priority: 'medium', status: 'done', tags: ['notifications'], dueAt: '2025-10-25' },
];

const FILTER_FIELDS: FilterFieldDefinition[] = [
  {
    id: 'priority',
    label: 'Priority',
    operators: ['eq', 'neq'],
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    operators: ['eq', 'neq'],
    options: [
      { value: 'todo', label: 'To do' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'review', label: 'In review' },
      { value: 'done', label: 'Done' },
    ],
  },
  { id: 'assignee', label: 'Assignee', operators: ['eq', 'neq', 'contains'] },
  { id: 'title', label: 'Title', operators: ['contains'] },
];

const PRIORITY_BADGE: Record<string, 'default' | 'warning' | 'destructive' | 'secondary'> = {
  low: 'secondary',
  medium: 'warning',
  high: 'default',
  urgent: 'destructive',
};

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning'> = {
  todo: 'outline',
  'in-progress': 'default',
  review: 'warning',
  done: 'success',
};

function matchesChips(task: Task, chips: FilterChip[]): boolean {
  return chips.every((chip) => {
    const value = String((task as unknown as Record<string, string>)[chip.fieldId] ?? '');
    switch (chip.operator) {
      case 'eq':
        return value.toLowerCase() === chip.value.toLowerCase();
      case 'neq':
        return value.toLowerCase() !== chip.value.toLowerCase();
      case 'contains':
        return value.toLowerCase().includes(chip.value.toLowerCase());
      default:
        return true;
    }
  });
}

const INITIAL_SAVED_VIEWS: SavedFilterView[] = [
  {
    id: 'v1',
    name: 'Urgent & In review',
    chips: [
      { id: 'c1', fieldId: 'priority', operator: 'eq', value: 'urgent' },
      { id: 'c2', fieldId: 'status', operator: 'eq', value: 'review' },
    ],
  },
  {
    id: 'v2',
    name: 'My design backlog',
    chips: [
      { id: 'c3', fieldId: 'assignee', operator: 'eq', value: 'Eleanor' },
      { id: 'c4', fieldId: 'status', operator: 'eq', value: 'todo' },
    ],
  },
];

export default function AdvancedFilteringPage() {
  const [chips, setChips] = React.useState<FilterChip[]>([]);
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  const [views, setViews] = React.useState<SavedFilterView[]>(INITIAL_SAVED_VIEWS);
  const [activeViewId, setActiveViewId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const results = React.useMemo(
    () => (chips.length === 0 ? TASKS : TASKS.filter((t) => matchesChips(t, chips))),
    [chips]
  );

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleApplyView = (view: SavedFilterView) => {
    setChips(view.chips);
    setActiveViewId(view.id);
    toast({
      title: 'View applied',
      description: `${view.name} (${view.chips.length} filter${view.chips.length > 1 ? 's' : ''})`,
      variant: 'info',
    });
  };

  const handleSaveView = (name: string, viewChips: FilterChip[]) => {
    const newView: SavedFilterView = {
      id: `v-${Date.now()}`,
      name,
      chips: viewChips,
    };
    setViews((prev) => [...prev, newView]);
    setActiveViewId(newView.id);
    toast({
      title: 'View saved',
      description: `${name} (${viewChips.length} filter${viewChips.length > 1 ? 's' : ''})`,
      variant: 'success',
    });
  };

  const handleDeleteView = (id: string) => {
    const target = views.find((v) => v.id === id);
    setViews((prev) => prev.filter((v) => v.id !== id));
    if (activeViewId === id) {
      setActiveViewId(null);
    }
    if (target) {
      toast({
        title: 'Saved view removed',
        description: target.name,
        variant: 'default',
        action: (
          <ToastAction
            altText="Undo view deletion"
            onClick={() => {
              setViews((prev) => [...prev, target]);
              setActiveViewId(target.id);
              toast({
                title: 'View restored',
                description: target.name,
                variant: 'success',
              });
            }}
          >
            Undo
          </ToastAction>
        ),
      });
    }
  };

  const handleUpdateView = (id: string, viewChips: FilterChip[]) => {
    const target = views.find((v) => v.id === id);
    setViews((prev) =>
      prev.map((v) => (v.id === id ? { ...v, chips: viewChips } : v))
    );
    toast({
      title: 'View updated',
      description: `Updated filters for "${target?.name ?? 'view'}"`,
      variant: 'success',
    });
  };

  const renderTaskActions = (task: Task) => (
    <>
      <DropdownMenuItem onClick={() => toast({ title: `Opening ${task.title}` })}>
        <Eye className="h-3.5 w-3.5" /> View details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => toast({ title: 'Edit task', description: task.title })}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => toast({ title: 'Duplicated task' })}>
        <Copy className="h-3.5 w-3.5" /> Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive focus:bg-destructive/10"
        onClick={() => toast({ variant: 'destructive', title: `Deleted ${task.title}` })}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </DropdownMenuItem>
    </>
  );

  const renderContextMenu = (task: Task) => (
    <ContextMenuContent className="w-48">
      <ContextMenuLabel>{task.title}</ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem inset onClick={() => toast({ title: `Opening ${task.title}` })}>
        <Eye className="h-3.5 w-3.5" /> View details
      </ContextMenuItem>
      <ContextMenuItem inset onClick={() => toast({ title: 'Edit task', description: task.title })}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </ContextMenuItem>
      <ContextMenuItem inset onClick={() => toast({ title: 'Duplicated task' })}>
        <Copy className="h-3.5 w-3.5" /> Duplicate
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        variant="destructive"
        inset
        onClick={() => toast({ variant: 'destructive', title: `Deleted ${task.title}` })}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </ContextMenuItem>
    </ContextMenuContent>
  );

  const renderTask = (task: Task) => {
    const formattedDue = format(new Date(task.dueAt), 'd MMM yyyy');

    const title = (
      <ContextMenuTrigger asChild>
        <h3 className="text-sm font-semibold text-foreground cursor-context-menu truncate">{task.title}</h3>
      </ContextMenuTrigger>
    );

    if (viewMode === 'grid') {
      return (
        <ContextMenu key={task.id}>
          {renderContextMenu(task)}
          <ContextMenuTrigger asChild>
            <Card
              tabIndex={0}
              className="cursor-context-menu transition-all hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <CardHeader className="p-4 pb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  {title}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        aria-label={`Actions for ${task.title}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>{task.title}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {renderTaskActions(task)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant={PRIORITY_BADGE[task.priority]} className="capitalize text-xs">{task.priority}</Badge>
                  <Badge variant={STATUS_BADGE[task.status]} className="capitalize text-xs">{task.status.replace('-', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <DescriptionList
                  columns={1}
                  items={[
                    { label: 'Assignee', value: task.assignee },
                    { label: 'Due', value: <span className="font-mono text-xs">{formattedDue}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </ContextMenuTrigger>
        </ContextMenu>
      );
    }

    return (
      <ContextMenu key={task.id}>
        {renderContextMenu(task)}
        <ContextMenuTrigger asChild>
          <div
            tabIndex={0}
            className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between cursor-context-menu"
          >
            <div className="min-w-0 flex-1">
              {title}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {task.assignee}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-xs">
                  <CalendarDays className="h-3.5 w-3.5" /> {formattedDue}
                </span>
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={PRIORITY_BADGE[task.priority]} className="capitalize text-xs">{task.priority}</Badge>
              <Badge variant={STATUS_BADGE[task.status]} className="capitalize text-xs">{task.status.replace('-', ' ')}</Badge>
            </div>
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    );
  };

  const renderSkeletons = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-4 pb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-md border border-border bg-card p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-2/5" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Advanced Filtering & Saved Views"
        description="FilterBuilder with multi-criteria chips, persistent saved views, grid/list view switching via SegmentedControl, contextual hover-card help, loading skeleton states, and right-click context menus for row actions."
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <FilterBuilder
            fields={FILTER_FIELDS}
            chips={chips}
            onChipsChange={(newChips) => {
              setChips(newChips);
              // Clear active view indicator if chips no longer match
              if (activeViewId) {
                const current = views.find((v) => v.id === activeViewId);
                if (current && JSON.stringify(current.chips) !== JSON.stringify(newChips)) {
                  setActiveViewId(null);
                }
              }
            }}
            savedViews={views}
            activeViewId={activeViewId ?? undefined}
            onApplyView={handleApplyView}
            onSaveView={handleSaveView}
            onDeleteView={handleDeleteView}
            onUpdateView={handleUpdateView}
            maxChips={6}
          />

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateLoading}
              className="h-8 gap-1.5 text-xs"
              title="Simulate loading state"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Reload
            </Button>

            <SegmentedControl
              type="single"
              value={viewMode}
              onValueChange={(v) => {
                if (v) setViewMode(v as 'list' | 'grid');
              }}
              aria-label="Results view mode"
            >
              <SegmentedControlItem value="list">
                <LayoutList className="h-3.5 w-3.5" />
                List
              </SegmentedControlItem>
              <SegmentedControlItem value="grid">
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>
              Showing <strong className="text-foreground">{results.length}</strong> of{' '}
              {TASKS.length} tasks
            </span>
            {chips.length > 0 && (
              <span>
                {' '}·{' '}
                <button
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    setChips([]);
                    setActiveViewId(null);
                  }}
                >
                  Reset filters
                </button>
              </span>
            )}

            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="How saved views work"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">How saved views work</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Click the <strong>Views</strong> dropdown to apply a saved filter set instantly, update the current view with modified filters, or name your current chips to save a new preset.
                  </p>
                  <DescriptionList
                    columns={1}
                    dividers
                    items={views.map((v) => ({
                      label: v.name,
                      value: `${v.chips.length} filter${v.chips.length > 1 ? 's' : ''}`,
                      hint: v.chips.map((c) => c.fieldId).join(', '),
                    }))}
                  />
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {isLoading ? (
          renderSkeletons()
        ) : results.length === 0 ? (
          <EmptyState
            icon={FilterX}
            title="No tasks match your filters"
            description="Try widening your search criteria or resetting your active filter chips."
            actionLabel="Reset filters"
            onAction={() => {
              setChips([]);
              setActiveViewId(null);
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(renderTask)}
          </div>
        ) : (
          <div className="space-y-2">{results.map(renderTask)}</div>
        )}
      </div>
    </div>
  );
}
