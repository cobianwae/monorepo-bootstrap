'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { Button } from './button';

export interface KanbanColumnData {
  id: string;
  title: string;
  items: string[];
}

export interface KanbanItemData {
  id: string;
  title: string;
  label?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumnData[];
  items: Record<string, KanbanItemData>;
  onColumnsChange: (columns: KanbanColumnData[]) => void;
  onAddItem?: (columnId: string) => void;
  renderItem?: (item: KanbanItemData) => React.ReactNode;
  className?: string;
}

interface ItemDragData {
  type: 'item';
  item: KanbanItemData;
  sourceColumnId: string;
  sourceIndex: number;
}

interface ColumnDragData {
  type: 'column';
  column: KanbanColumnData;
  sourceIndex: number;
}

type DragData = ItemDragData | ColumnDragData;

export function KanbanBoard({
  columns,
  items,
  onColumnsChange,
  onAddItem,
  renderItem,
  className,
}: KanbanBoardProps) {
  const [activeDrag, setActiveDrag] = React.useState<DragData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findItem = (id: string): { columnId: string; index: number } | undefined => {
    for (const column of columns) {
      const index = column.items.indexOf(id);
      if (index !== -1) return { columnId: column.id, index };
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    const location = findItem(activeId);
    if (location) {
      setActiveDrag({
        type: 'item',
        item: items[activeId],
        sourceColumnId: location.columnId,
        sourceIndex: location.index,
      });
      return;
    }
    const colIndex = columns.findIndex((c) => c.id === activeId);
    if (colIndex !== -1) {
      setActiveDrag({ type: 'column', column: columns[colIndex], sourceIndex: colIndex });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || activeDrag?.type !== 'item') return;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (overId === activeId) return;
    const activeLocation = findItem(activeId);
    if (!activeLocation) return;

    const overIsColumn = columns.some((c) => c.id === overId);

    if (overIsColumn && activeLocation.columnId !== overId) {
      // Move item to the end of the target column
      const next = columns.map((column) => {
        if (column.id === activeLocation.columnId) {
          return { ...column, items: column.items.filter((id) => id !== activeId) };
        }
        if (column.id === overId) {
          return { ...column, items: [...column.items, activeId] };
        }
        return column;
      });
      onColumnsChange(next);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeDrag?.type === 'item') {
      const activeLocation = findItem(activeId);
      if (!activeLocation) return;
      if (overId === activeId) return;

      const overIsItem = Boolean(findItem(overId));
      const overIsColumn = columns.some((c) => c.id === overId);

      let next = columns.map((column) =>
        column.id === activeLocation.columnId
          ? { ...column, items: column.items.filter((id) => id !== activeId) }
          : column
      );

      if (overIsItem) {
        const overLocation = findItem(overId);
        if (!overLocation) return;
        const target = next.find((c) => c.id === overLocation.columnId)!;
        const targetItems = [...target.items];
        const overIdx = targetItems.indexOf(overId);
        targetItems.splice(overIdx, 0, activeId);
        target.items = targetItems;
      } else if (overIsColumn) {
        const target = next.find((c) => c.id === overId)!;
        target.items = [...target.items, activeId];
      }
      onColumnsChange(next);
    } else if (activeDrag?.type === 'column') {
      const overColIndex = columns.findIndex((c) => c.id === overId);
      if (overColIndex === -1) return;
      onColumnsChange(arrayMove(columns, activeDrag.sourceIndex, overColIndex));
    }
  };

  const handleDragCancel = () => setActiveDrag(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {columns.map((column, index) => (
          <SortableColumn
            key={column.id}
            column={column}
            index={index}
            items={items}
            renderItem={renderItem}
            onAddItem={onAddItem}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDrag ? (
          activeDrag.type === 'item' ? (
            <div className="w-64">
              {renderItem ? (
                renderItem(activeDrag.item)
              ) : (
                <DefaultItem item={activeDrag.item} dragging />
              )}
            </div>
          ) : (
            <div className="w-64 rounded-lg border border-border bg-card p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{activeDrag.column.items.length}</Badge>
                <span className="text-sm font-semibold">{activeDrag.column.title}</span>
              </div>
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableColumnProps {
  column: KanbanColumnData;
  index: number;
  items: Record<string, KanbanItemData>;
  renderItem?: (item: KanbanItemData) => React.ReactNode;
  onAddItem?: (columnId: string) => void;
}

function SortableColumn({ column, items, renderItem, onAddItem }: SortableColumnProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex w-64 shrink-0 flex-col rounded-lg border border-border bg-muted/30',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-center justify-between gap-2 p-3 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Drag column ${column.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">{column.title}</span>
          <Badge variant="secondary" className="text-[10px]">
            {column.items.length}
          </Badge>
        </div>
        {onAddItem && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => onAddItem(column.id)}
            aria-label={`Add item to ${column.title}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <SortableContext items={column.items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 px-2 pb-2 min-h-[2rem]">
          {column.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Drop items here
            </div>
          ) : (
            column.items.map((itemId) => (
              <SortableItemCard key={itemId} item={items[itemId]} renderItem={renderItem} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableItemCard({
  item,
  renderItem,
}: {
  item: KanbanItemData;
  renderItem?: (item: KanbanItemData) => React.ReactNode;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('touch-none', isDragging && 'opacity-40')}
    >
      {renderItem ? renderItem(item) : <DefaultItem item={item} />}
    </div>
  );
}

function DefaultItem({ item, dragging }: { item: KanbanItemData; dragging?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card p-3 shadow-xs',
        dragging && 'rotate-3 shadow-lg'
      )}
    >
      <p className="text-sm font-medium text-foreground">{item.title}</p>
      {item.label && (
        <Badge variant="secondary" className="mt-2 text-[10px] capitalize">
          {item.label}
        </Badge>
      )}
    </div>
  );
}