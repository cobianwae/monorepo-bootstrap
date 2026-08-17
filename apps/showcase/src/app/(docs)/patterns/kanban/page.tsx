'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  KanbanBoard,
  Badge,
  Button,
  Card,
  CardContent,
  toast,
  type KanbanColumnData,
  type KanbanItemData,
} from '@ds/ui';
import {
  Sparkles,
  Plus,
  MousePointerClick,
  Keyboard,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';

const PRIORITY_BADGE: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  urgent: 'destructive',
  high: 'warning',
  low: 'secondary',
};

const INITIAL_COLUMNS: KanbanColumnData[] = [
  { id: 'todo', title: 'To Do', items: ['t1', 't2', 't3'] },
  { id: 'in-progress', title: 'In Progress', items: ['t4', 't5'] },
  { id: 'review', title: 'In Review', items: ['t6'] },
  { id: 'done', title: 'Done', items: [] },
];

const INITIAL_ITEMS: Record<string, KanbanItemData> = {
  t1: { id: 't1', title: 'Design tokens audit', label: 'high' },
  t2: { id: 't2', title: 'Fix dark mode contrast', label: 'urgent' },
  t3: { id: 't3', title: 'Write component docs', label: 'low' },
  t4: { id: 't4', title: 'Data table virtualization', label: 'high' },
  t5: { id: 't5', title: 'Bulk action bar', label: 'low' },
  t6: { id: 't6', title: 'Global search index', label: 'urgent' },
};

export default function KanbanPage() {
  const [columns, setColumns] = React.useState<KanbanColumnData[]>(INITIAL_COLUMNS);
  const [items, setItems] = React.useState<Record<string, KanbanItemData>>(INITIAL_ITEMS);

  const handleAddItem = (columnId: string) => {
    const counter = Object.keys(items).length + 1;
    const id = `t${counter}`;
    const newItem: KanbanItemData = {
      id,
      title: `New task ${counter}`,
      label: 'low',
    };
    setItems((prev) => ({ ...prev, [id]: newItem }));
    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? { ...column, items: [...column.items, id] }
          : column
      )
    );
    toast({
      variant: 'success',
      title: 'Task added',
      description: `Created in "${columns.find((c) => c.id === columnId)?.title ?? columnId}"`,
    });
  };

  const renderItem = (item: KanbanItemData) => (
    <Card className="shadow-xs transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.label && (
          <Badge variant={PRIORITY_BADGE[item.label] ?? 'secondary'} className="mt-2 text-[10px] capitalize">
            {item.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Kanban Board & Drag & Drop"
        description="Multi-column kanban powered by @dnd-kit: drag cards across columns, reorder within a column, reorder entire columns, keyboard sorting, and a drag overlay preview."
      />

      <div className="flex items-center justify-between rounded-xl border border-highlight/30 bg-gradient-to-r from-highlight/10 to-transparent p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-highlight text-highlight-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              See this Kanban in action inside the CRM Pipeline
            </p>
            <p className="text-xs text-muted-foreground">
              Manage live leads with AI score breakdowns, stage progression, and conversion workflows.
            </p>
          </div>
        </div>
        <Link href="/crm/leads">
          <Button variant="highlight" size="sm" className="gap-1.5 text-xs">
            Open CRM Leads
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MousePointerClick className="h-3.5 w-3.5" />
          Drag cards or whole columns to move them
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5" />
          Press Space/Enter on a card to lift it, arrows to move, Space to drop
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Release 3.0 sprint
          </h2>
          <Button size="sm" className="gap-1.5" onClick={() => handleAddItem('todo')}>
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
        </div>

        <KanbanBoard
          columns={columns}
          items={items}
          onColumnsChange={setColumns}
          onAddItem={handleAddItem}
          renderItem={renderItem}
        />
      </div>
    </div>
  );
}