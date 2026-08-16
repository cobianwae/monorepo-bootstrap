'use client';

import * as React from 'react';
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
  DescriptionList,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  toast,
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
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

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

const SAVED_VIEWS: SavedFilterView[] = [
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

  const results = React.useMemo(
    () => (chips.length === 0 ? TASKS : TASKS.filter((t) => matchesChips(t, chips))),
    [chips]
  );

  const renderTask = (task: Task) => {
    const menu = (
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
        <ContextMenuItem variant="destructive" inset onClick={() => toast({ variant: 'destructive', title: `Deleted ${task.title}` })}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    );

    const title = (
      <ContextMenuTrigger asChild>
        <h3 className="text-sm font-semibold text-foreground cursor-context-menu">{task.title}</h3>
      </ContextMenuTrigger>
    );

    if (viewMode === 'grid') {
      return (
        <ContextMenu key={task.id}>
          {menu}
          <ContextMenuTrigger asChild>
            <Card className="cursor-context-menu transition-shadow hover:shadow-md">
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  {title}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant={PRIORITY_BADGE[task.priority]} className="capitalize text-[10px]">{task.priority}</Badge>
                  <Badge variant={STATUS_BADGE[task.status]} className="capitalize text-[10px]">{task.status.replace('-', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <DescriptionList
                  columns={1}
                  items={[
                    { label: 'Assignee', value: task.assignee, hint: undefined },
                    { label: 'Due', value: task.dueAt },
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
        {menu}
        <ContextMenuTrigger asChild>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-3 hover:bg-accent/40 transition-colors sm:flex-row sm:items-center sm:justify-between cursor-context-menu">
            <div className="min-w-0 flex-1">
              {title}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" /> {task.assignee}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> {task.dueAt}
                </span>
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    <Tag className="h-2.5 w-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={PRIORITY_BADGE[task.priority]} className="capitalize text-[10px]">{task.priority}</Badge>
              <Badge variant={STATUS_BADGE[task.status]} className="capitalize text-[10px]">{task.status.replace('-', ' ')}</Badge>
            </div>
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Advanced Filtering & Saved Views"
        description="FilterBuilder with multi-criteria chips, saved filter views, grid/list view switching via SegmentedControl, hover-card previews, and right-click context menus for row actions."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <FilterBuilder
          fields={FILTER_FIELDS}
          chips={chips}
          onChipsChange={setChips}
          savedViews={SAVED_VIEWS}
          onApplyView={(view) => setChips(view.chips)}
          onDeleteView={(id) =>
            toast({ title: 'Saved view removed', description: id, variant: 'info' })
          }
          onSaveView={(name, viewChips) =>
            toast({
              title: 'View saved',
              description: `${name} (${viewChips.length} filter${viewChips.length > 1 ? 's' : ''})`,
              variant: 'success',
            })
          }
          maxChips={6}
        />

        <div className="flex items-center gap-3">
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

      <div className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{results.length}</strong> of{' '}
        {TASKS.length} tasks
        {chips.length > 0 && (
          <span>
            {' '}·{' '}
            <button
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => setChips([])}
            >
              Reset filters
            </button>
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No tasks match your filters. Try widening the criteria.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(renderTask)}
        </div>
      ) : (
        <div className="space-y-2">{results.map(renderTask)}</div>
      )}

      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="text-sm text-primary underline-offset-4 hover:underline">
            Hover to preview a saved view
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">How saved views work</p>
            <p className="text-xs text-muted-foreground">
              Click the <strong>Views</strong> dropdown to apply a saved filter set instantly, or
              name your current filters to persist them for later sessions.
            </p>
            <DescriptionList
              columns={1}
              dividers
              items={SAVED_VIEWS.map((v) => ({
                label: v.name,
                value: `${v.chips.length} filter${v.chips.length > 1 ? 's' : ''}`,
                hint: v.chips.map((c) => c.fieldId).join(', '),
              }))}
            />
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}